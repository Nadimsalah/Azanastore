
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
            product.sku?.toLowerCase().includes(lowerQuery)
        )
    }, [products, searchQuery])

    const addToCart = (product: Product) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.product_id === product.id)
            if (existingItem) {
                return currentCart.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...currentCart, {
                id: Math.random().toString(36).substr(2, 9),
                product_id: product.id,
                title: product.title,
                price: product.price,
                image: product.images?.[0] || null,
                quantity: 1,
                sku: product.sku
            }]
        })
    }

    const onBarcodeScan = (barcode: string) => {
        const product = products.find(p => p.sku === barcode || p.sku?.includes(barcode))
        if (product) {
            addToCart(product)
            toast.success(`Added ${product.title} to cart`)
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
        <div className="flex bg-background text-foreground h-screen overflow-hidden">
            <AdminSidebar />

            <main className="flex-1 flex flex-col lg:pl-72 rtl:lg:pl-0 rtl:lg:pr-72 min-w-0 transition-all duration-300 h-full relative">
                {/* Header Section */}
                <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <LayoutGrid className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Point of Sale</h1>
                            <p className="text-muted-foreground text-xs md:text-sm">Quick & Easy Checkout</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsScannerOpen(true)}
                            variant="outline"
                            className="rounded-2xl h-12 px-4 md:px-6 flex items-center gap-2 border-white/10 hover:bg-white/5 active:scale-95 transition-all text-sm font-bold"
                        >
                            <Barcode className="w-5 h-5 text-primary" />
                            <span className="hidden sm:inline">Scan Barcode</span>
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Search Section */}
                    <div className="p-4 md:p-6 pb-2 shrink-0">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search by product name or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 md:h-16 text-lg rounded-3xl bg-white/5 border-white/10 focus:bg-white/10 focus:ring-primary/20 transition-all w-full shadow-inner"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-muted-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 custom-scrollbar">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product) => (
                                        <POSCard
                                            key={product.id}
                                            product={product}
                                            gravityEnabled={false}
                                            onAddToCart={addToCart}
                                        />
                                    ))}
                                </AnimatePresence>

                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-24 text-muted-foreground bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                        <Package className="w-16 h-16 mb-4 opacity-20" />
                                        <p className="text-lg font-medium">No products found</p>
                                        <Button
                                            variant="link"
                                            className="mt-2 text-primary hover:no-underline"
                                            onClick={() => setSearchQuery("")}
                                        >
                                            Clear search filters
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Floating Cart Button (iPad-friendly) */}
                    <div className="absolute bottom-6 left-6 right-6 z-40">
                        <Button
                            onClick={() => setIsCartOpen(true)}
                            className="w-full h-16 md:h-20 rounded-[2rem] bg-primary hover:bg-primary/90 active:scale-[0.98] shadow-2xl shadow-primary/30 flex items-center justify-between px-6 md:px-10 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                                    <ShoppingBag className="w-6 h-6 md:w-7 md:h-7" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-bold opacity-80 uppercase tracking-widest">Cart</span>
                                    <span className="text-lg md:text-xl font-extrabold">{cartCount} Items</span>
                                </div>
                            </div>
                            <div className="h-10 w-[2px] bg-white/20 hidden md:block" />
                            <div className="text-right">
                                <span className="block text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest">Total</span>
                                <span className="text-xl md:text-2xl font-black text-white">{cartTotal} MAD</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </main>

            {/* Full-screen Cart Modal */}
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="max-w-[100vw] h-[100vh] m-0 rounded-0 p-0 border-0 bg-background overflow-hidden flex flex-col">
                    <div className="sr-only">
                        <DialogTitle>Shopping Cart</DialogTitle>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <POSCart
                            items={cart}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeFromCart}
                            onCheckout={handleCheckout}
                        />
                    </div>
                    <Button
                        onClick={() => setIsCartOpen(false)}
                        variant="ghost"
                        size="icon"
                        className="absolute right-6 top-6 h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 z-50 transition-all active:scale-95"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </DialogContent>
            </Dialog>

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
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}</style>
        </div>
    )
}
