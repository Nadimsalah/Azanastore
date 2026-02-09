
"use client"

import { useState, useEffect, useMemo } from "react"
import { POSCard } from "@/components/admin/pos/pos-card"
import { POSCart } from "@/components/admin/pos/pos-cart"
import { POSReceipt } from "@/components/admin/pos/pos-receipt"
import { BarcodeScanner } from "@/components/admin/pos/barcode-scanner"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Search, ShoppingBag, LayoutGrid, Barcode, X, Package } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
    getProducts,
    createOrder,
    type Product,
    type CartItem,
    type Order,
    type OrderItem
} from "@/lib/supabase-api"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useLanguage } from "@/components/language-provider"

export default function POSPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [lastOrder, setLastOrder] = useState<(Order & { order_items: OrderItem[] }) | null>(null)
    const [isScannerOpen, setIsScannerOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const { t } = useLanguage()

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        try {
            const data = await getProducts({ status: 'active', limit: 200 })
            setProducts(data || [])
        } catch (error) {
            console.error("Failed to load products:", error)
            toast.error("Failed to load products")
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products
        const lowerQuery = searchQuery.toLowerCase()
        return products.filter(product =>
            product.title.toLowerCase().includes(lowerQuery) ||
            product.sku?.toLowerCase().includes(lowerQuery) ||
            product.variants?.some(v => v.sku?.toLowerCase().includes(lowerQuery))
        )
    }, [products, searchQuery])

    const addToCart = (product: Product, variantSku?: string) => {
        const variant = variantSku ? product.variants?.find(v => v.sku === variantSku) : null
        const itemPrice = variant ? variant.price : product.price
        const itemSku = variant ? variant.sku : product.sku
        const variantName = variant ? `${variant.color || ""} ${variant.size || ""}`.trim() : null

        setCart(currentCart => {
            const existingItem = currentCart.find(item =>
                item.product_id === product.id &&
                item.variant_name === variantName
            )

            if (existingItem) {
                return currentCart.map(item =>
                    (item.product_id === product.id && item.variant_name === variantName)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }

            return [...currentCart, {
                id: Math.random().toString(36).substr(2, 9),
                product_id: product.id,
                title: product.title,
                variant_name: variantName,
                price: itemPrice,
                image: product.images?.[0] || null,
                quantity: 1,
                sku: itemSku
            }]
        })
    }

    const onBarcodeScan = (barcode: string) => {
        // Find product by SKU or variant SKU
        let foundProduct: Product | undefined
        let foundVariantSku: string | undefined

        for (const p of products) {
            if (p.sku === barcode) {
                foundProduct = p
                break
            }
            const variant = p.variants?.find(v => v.sku === barcode)
            if (variant) {
                foundProduct = p
                foundVariantSku = variant.sku
                break
            }
        }

        if (foundProduct) {
            addToCart(foundProduct, foundVariantSku)
            toast.success(`Added ${foundProduct.title}${foundVariantSku ? ` (${barcode})` : ''} to cart`)
        } else {
            toast.error(`Product with barcode ${barcode} not found`)
        }
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(currentCart => {
            return currentCart.map(item => {
                if (item.id === id) {
                    const newQuantity = Math.max(0, item.quantity + delta)
                    return { ...item, quantity: newQuantity }
                }
                return item
            }).filter(item => item.quantity > 0)
        })
    }

    const removeFromCart = (id: string) => {
        setCart(currentCart => currentCart.filter(item => item.id !== id))
    }

    const handleCheckout = async () => {
        if (cart.length === 0) return
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        try {
            const orderData = {
                customer: {
                    name: "Walk-in Customer",
                    email: "walkin@pos.local",
                    phone: "",
                    address_line1: "POS Transaction",
                    city: "Casablanca"
                },
                items: cart.map(item => ({
                    product_id: item.product_id,
                    product_title: item.title,
                    product_sku: item.sku,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity,
                    variant_name: item.variant_name
                })),
                subtotal,
                shipping_cost: 0,
                total: subtotal,
                source: 'pos' as const,
                status: 'delivered'
            }

            const { order, error } = await createOrder(orderData)
            if (error) throw error

            if (order) {
                const receiptOrder = {
                    ...order,
                    order_items: cart.map(item => ({
                        id: item.id,
                        order_id: order.id,
                        product_id: item.product_id,
                        product_title: item.title,
                        product_sku: item.sku,
                        variant_name: item.variant_name || null,
                        quantity: item.quantity,
                        price: item.price,
                        subtotal: item.price * item.quantity,
                        created_at: new Date().toISOString(),
                        product_image: item.image || null
                    }))
                }

                setLastOrder(receiptOrder)
                setCart([])
                setIsCartOpen(false)
                toast.success(t("admin.pos.order_success"))
                setTimeout(() => window.print(), 500)
            }
        } catch (error) {
            console.error("Checkout failed:", error)
            toast.error(t("admin.pos.checkout_error"))
        }
    }

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return (
        <div className="flex bg-background text-foreground h-screen overflow-hidden font-sans relative">
            {/* Soft Background Blobs (Light Mode) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

            <AdminSidebar />

            <main className="flex-1 flex flex-col lg:pl-72 rtl:lg:pl-0 rtl:lg:pr-72 min-w-0 transition-all duration-300 h-full relative z-10">
                {/* Header Section */}
                <div className="p-4 md:p-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-2xl">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <LayoutGrid className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black tracking-tight uppercase tracking-widest leading-none text-gray-900">Azana <span className="text-primary italic">POS</span></h1>
                            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase mt-1 tracking-[0.2em]">{t("admin.pos.quick_checkout") || "Precision Retail"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setIsScannerOpen(true)}
                            className="rounded-2xl h-14 px-6 md:px-8 flex items-center gap-3 bg-white border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all text-sm font-black uppercase tracking-widest shadow-sm text-gray-900"
                        >
                            <Barcode className="w-6 h-6 text-primary" />
                            <span className="hidden sm:inline">Scanner</span>
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Search Section */}
                    <div className="p-6 md:p-10 pb-4 shrink-0">
                        <div className="relative group max-w-4xl mx-auto">
                            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-primary transition-all duration-500" />
                            <Input
                                placeholder="Find Products, Variants or SKUs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-16 h-18 md:h-22 text-xl rounded-full bg-white border-gray-100 focus:border-primary/20 focus:ring-0 transition-all w-full shadow-sm placeholder:text-gray-300 font-medium text-gray-900"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-32 custom-scrollbar">
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
                                {[...Array(15)].map((_, i) => (
                                    <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-gray-100/50 animate-pulse border border-gray-100" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product) => (
                                        <POSCard
                                            key={product.id}
                                            product={product}
                                            onAddToCart={addToCart}
                                        />
                                    ))}
                                </AnimatePresence>

                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-32 text-gray-300 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-100">
                                        <Package className="w-24 h-24 mb-6 opacity-20" />
                                        <p className="text-2xl font-black uppercase tracking-[0.2em]">No Matches</p>
                                        <Button
                                            variant="link"
                                            className="mt-4 text-primary hover:no-underline font-bold uppercase tracking-widest text-sm"
                                            onClick={() => setSearchQuery("")}
                                        >
                                            Reset Filters
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Floating Cart Button (Liquid Aesthetic) */}
                    <div className="absolute bottom-8 left-8 right-8 z-40 max-w-5xl mx-auto">
                        <Button
                            onClick={() => setIsCartOpen(true)}
                            className="w-full h-20 md:h-24 rounded-[2.5rem] bg-primary hover:bg-primary/90 active:scale-[0.98] shadow-[0_30px_60px_rgba(var(--primary-rgb),0.2)] flex items-center justify-between px-8 md:px-14 transition-all group border border-white/20 relative overflow-hidden"
                        >

                            <div className="flex items-center gap-6 relative z-10">
                                <div className="p-4 bg-white/20 rounded-[1.5rem] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                                    <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] md:text-xs font-black opacity-60 uppercase tracking-[0.3em] mb-1">Basket Status</span>
                                    <span className="text-2xl md:text-3xl font-black text-white leading-none whitespace-nowrap">{cartCount} {cartCount === 1 ? 'Product' : 'Products'}</span>
                                </div>
                            </div>

                            <div className="h-12 w-[1px] bg-white/20 hidden md:block mx-10" />

                            <div className="text-right relative z-10">
                                <span className="block text-[10px] md:text-xs font-black opacity-60 uppercase tracking-[0.3em] mb-1 text-white leading-none">Payable Amount</span>
                                <div className="flex items-baseline justify-end gap-1">
                                    <span className="text-3xl md:text-5xl font-black text-white tracking-tighter">{cartTotal}</span>
                                    <span className="text-sm md:text-lg font-bold text-white/50 italic font-mono lowercase tracking-tighter">mad</span>
                                </div>
                            </div>
                        </Button>
                    </div>
                </div>
            </main>

            {/* Bottom Sheet Cart */}
            <AnimatePresence>
                <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                    <DialogContent className="max-w-[100vw] h-[100vh] sm:max-w-[550px] sm:h-[95vh] sm:rounded-t-[4rem] sm:bottom-0 sm:top-auto sm:translate-y-0 m-0 p-0 border-0 glass-strong overflow-hidden flex flex-col transition-all duration-700 shadow-[0_-50px_100px_rgba(0,0,0,0.1)] backdrop-blur-3xl border-t border-white/40">
                        <div className="sr-only">
                            <DialogTitle>Shopping Cart</DialogTitle>
                        </div>

                        {/* Dash Handle - Visual cue for gestural interaction */}
                        <div className="relative h-12 shrink-0 flex items-center justify-center sm:hidden">
                            <div className="w-16 h-1.5 bg-foreground/10 rounded-full group-hover:bg-primary/40 transition-colors" />
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            <POSCart
                                items={cart}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeFromCart}
                                onCheckout={handleCheckout}
                            />
                        </div>

                        {/* High-End Close Button */}
                        <Button
                            onClick={() => setIsCartOpen(false)}
                            variant="ghost"
                            size="icon"
                            className="absolute right-6 top-6 h-12 w-12 md:h-16 md:w-16 rounded-[1.5rem] bg-white border border-gray-100 shadow-xl z-50 transition-all hover:scale-110 active:scale-95 text-gray-400 hover:text-primary group"
                        >
                            <X className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-90 transition-transform duration-500" />
                        </Button>
                    </DialogContent>
                </Dialog>
            </AnimatePresence>

            {/* Barcode Scanner Modal */}
            {isScannerOpen && (
                <BarcodeScanner
                    onScan={onBarcodeScan}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}

            {/* Hidden Receipt for Printing */}
            <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
                {lastOrder && <POSReceipt order={lastOrder} />}
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: 80mm auto; }
                    body { margin: 0; padding: 0; }
                    body > *:not(.print\\:block) { display: none !important; }
                    .print\\:block { display: block !important; position: absolute; top: 0; left: 0; width: 100%; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.1); }
            `}</style>
        </div>
    )
}
