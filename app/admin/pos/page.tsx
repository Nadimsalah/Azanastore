"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    ShoppingBag,
    LayoutGrid,
    Barcode,
    Settings,
    X,
    Sparkles,
    Calendar,
    Package,
    ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    getProducts,
    createOrder,
    type Product,
    type CartItem,
    type Order,
    type OrderItem
} from "@/lib/supabase-api"
import { POSCard } from "@/components/admin/pos/pos-card"
import { POSCart } from "@/components/admin/pos/pos-cart"
import { POSReceipt } from "@/components/admin/pos/pos-receipt"
import { BarcodeScanner } from "@/components/admin/pos/barcode-scanner"
import { useLanguage } from "@/components/language-provider"
import { toast } from "sonner"

export default function POSPage() {
    const { t } = useLanguage()
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [category, setCategory] = useState("all")
    const [isLoading, setIsLoading] = useState(true)
    const [lastOrder, setLastOrder] = useState<(Order & { order_items: OrderItem[] }) | null>(null)
    const [isScannerOpen, setIsScannerOpen] = useState(false)
    const [isCartOpenMobile, setIsCartOpenMobile] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    // Clock update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setIsLoading(true)
        try {
            const data = await getProducts({ status: 'active', limit: 200 })
            setProducts(data || [])
        } catch (error) {
            console.error("Failed to load products:", error)
            toast.error("Failed to load products")
        } finally {
            setIsLoading(false)
        }
    }

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category).filter(Boolean))
        return ["all", ...Array.from(cats)]
    }, [products])

    const filteredProducts = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase()
        return products.filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(lowerQuery) ||
                product.sku?.toLowerCase().includes(lowerQuery) ||
                product.variants?.some(v => v.sku?.toLowerCase().includes(lowerQuery))
            const matchesCategory = category === "all" || product.category === category
            return matchesSearch && matchesCategory
        })
    }, [products, searchQuery, category])

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
        toast.success(`${product.title}${variantName ? ` (${variantName})` : ''} ${t("admin.pos.added_to_cart")}`)
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
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
                setIsCartOpenMobile(false)
                toast.success(t("admin.pos.order_success"))
                setTimeout(() => window.print(), 500)
            }
        } catch (error) {
            console.error("Checkout failed:", error)
            toast.error(t("admin.pos.checkout_error"))
        }
    }

    const onBarcodeScan = (barcode: string) => {
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
        } else {
            toast.error(`Product with barcode ${barcode} not found`)
        }
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans relative">
            {/* Background Aesthetic Blobs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none" />

            {/* Left: Application Shell & Product Browser */}
            <main className="flex-1 flex flex-col min-w-0 relative z-10 border-r border-white/20">
                <header className="px-4 md:px-8 py-4 md:py-6 border-b border-white/20 glass-strong flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:2xl">
                            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-2xl font-black text-foreground tracking-tight uppercase tracking-[0.2em] mb-0.5 md:mb-1">
                                Azana POS
                            </h1>
                            <div className="flex items-center gap-2 md:gap-3 opacity-40">
                                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{t("admin.pos.quick_checkout")}</p>
                                <span className="w-1 h-1 bg-foreground rounded-full" />
                                <p className="text-[8px] md:text-[10px] font-mono font-bold">终端 #01</p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-4 xl:gap-8 bg-white/50 px-4 xl:px-6 py-2 rounded-full border border-white/60 shadow-sm backdrop-blur-xl">
                        <div className="flex items-center gap-2 xl:gap-3">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] xl:text-xs font-black uppercase tracking-widest text-foreground/60">
                                {currentTime.toLocaleDateString()}
                            </span>
                        </div>
                        <div className="w-px h-4 bg-gray-200" />
                        <span className="text-xs xl:text-sm font-mono font-bold text-primary tabular-nums">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <Button
                            variant="outline"
                            className="rounded-xl md:rounded-2xl h-10 md:h-12 gap-2 border-white/60 bg-white/50 shadow-sm px-3 md:px-4"
                            onClick={() => setIsScannerOpen(true)}
                        >
                            <Barcode className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            <span className="hidden sm:inline text-[10px] md:text-xs font-black uppercase tracking-widest">{t("admin.pos.scanner")}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl md:rounded-2xl h-10 w-10 md:h-12 md:w-12 hover:bg-white/80">
                            <Settings className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                        </Button>
                    </div>
                </header>

                <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                    <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={t("admin.pos.search_products")}
                                className="pl-14 md:pl-16 h-12 md:h-16 rounded-2xl md:rounded-[2rem] bg-white border-white/60 shadow-lg shadow-black/5"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-6 md:px-8 h-12 md:h-16 rounded-xl md:rounded-[2rem] border transition-all whitespace-nowrap text-[10px] md:text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 ${category === cat
                                            ? "bg-primary text-primary-foreground border-primary shadow-xl scale-105"
                                            : "glass border-white/60 text-muted-foreground hover:bg-white"
                                        }`}
                                >
                                    {cat === "all" ? <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" /> : <Package className="w-4 h-4 md:w-5 md:h-5" />}
                                    {cat === "all" ? t("admin.pos.all_categories") : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 md:pb-10 custom-scrollbar">
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] rounded-2xl md:rounded-[2.5rem] shimmer bg-muted/20" />
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                            <AnimatePresence>
                                {filteredProducts.map((product) => (
                                    <POSCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={addToCart}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                            <ShoppingCart className="w-16 h-16 md:w-24 md:h-24 mb-6" />
                            <p className="text-xl md:text-2xl font-black uppercase tracking-widest text-center">{t("admin.pos.no_products_found")}</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Right: Persistent Cart Sidebar (Laptop & iPad Landscape) */}
            <aside className="hidden lg:flex w-[320px] xl:w-[400px] 2xl:w-[500px] flex-col shrink-0 bg-white/5 backdrop-blur-3xl border-l border-white/20 relative z-20 transition-all">
                <POSCart
                    items={cart}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    onCheckout={handleCheckout}
                />
            </aside>

            {/* Mobile/Tablet Portrait Cart Trigger */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg">
                <Button
                    onClick={() => setIsCartOpenMobile(true)}
                    className="w-full h-16 md:h-20 rounded-2xl md:rounded-[2.5rem] bg-primary shadow-2xl flex items-center justify-between px-6 md:px-10 hover:bg-primary/90 transition-all active:scale-95"
                >
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <ShoppingBag className="w-5 h-5 md:w-7 md:h-7 text-white" />
                        </div>
                        <span className="text-sm md:text-lg font-black uppercase tracking-widest text-white">Cart</span>
                        {cart.length > 0 && (
                            <span className="px-2 py-0.5 bg-white text-primary text-[10px] font-black rounded-full">
                                {cart.reduce((a, b) => a + b.quantity, 0)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-xl md:text-32xl font-black text-white tabular-nums">
                            {cart.reduce((a, b) => a + b.price * b.quantity, 0)}
                        </span>
                        <span className="text-[10px] md:text-xs font-bold text-white/50 italic font-mono uppercase">mad</span>
                    </div>
                </Button>
            </div>

            {/* Mobile/Tablet Cart Drawer */}
            <AnimatePresence>
                {isCartOpenMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 lg:hidden overflow-hidden flex flex-col"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsCartOpenMobile(false)} />

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="flex-1 bg-background rounded-t-[3rem] md:rounded-t-[4rem] relative z-10 overflow-hidden shadow-2xl flex flex-col border-t border-white/40 mt-[10vh]"
                        >
                            {/* Grab Handle */}
                            <div className="h-8 flex items-center justify-center shrink-0">
                                <div className="w-12 h-1 bg-foreground/10 rounded-full" />
                            </div>

                            <Button
                                onClick={() => setIsCartOpenMobile(false)}
                                className="absolute right-6 top-6 z-50 w-10 h-10 md:w-12 md:h-12 rounded-xl md:2xl bg-white border border-gray-100 shadow-xl text-gray-400"
                                variant="ghost"
                                size="icon"
                            >
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </Button>

                            <div className="flex-1 overflow-hidden">
                                <POSCart
                                    items={cart}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeFromCart}
                                    onCheckout={handleCheckout}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Barcode Scanner */}
            {isScannerOpen && (
                <BarcodeScanner onScan={onBarcodeScan} onClose={() => setIsScannerOpen(false)} />
            )}

            {/* Hidden Receipt */}
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
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
            `}</style>
        </div>
    )
}
