"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    ShoppingBag,
    Barcode,
    Settings,
    Sparkles,
    Package,
    ShoppingCart,
    Plus,
    Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    getProducts,
    getCategories,
    createOrder,
    type Product,
    type Category,
    type CartItem,
    type Order,
    type OrderItem
} from "@/lib/supabase-api"
import { useLanguage } from "@/components/language-provider"
import { toast } from "sonner"

// Re-implemented components
import { BarcodeScanner } from "@/components/admin/pos/barcode-scanner"
import { ZenCart } from "@/components/admin/pos/zen-cart"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { POSReceipt } from "@/components/admin/pos/pos-receipt"

import { generatePOSTicketPDF } from "@/lib/pos-ticket-generator"

export default function POSPage() {
    const { t } = useLanguage()
    const cartRef = useRef<HTMLDivElement>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [flyingItems, setFlyingItems] = useState<{ id: string; x: number; y: number; image: string | null }[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [category, setCategory] = useState("all")
    const [isLoading, setIsLoading] = useState(true)
    const [isFiltering, setIsFiltering] = useState(false)
    const [officialCategories, setOfficialCategories] = useState<Category[]>([])
    const [lastOrder, setLastOrder] = useState<(Order & { order_items: OrderItem[] }) | null>(null)
    const [isScannerOpen, setIsScannerOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        loadProducts()
        loadOfficialCategories()
    }, [])

    const loadOfficialCategories = async () => {
        const data = await getCategories()
        setOfficialCategories(data || [])
    }

    const loadProducts = async () => {
        setIsLoading(true)
        try {
            const data = await getProducts({ status: 'active', limit: 200 })
            setProducts(data || [])
        } catch (error) {
            console.error("Failed to load products:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const categories = useMemo(() => {
        return ["all", ...officialCategories.map(c => c.slug)]
    }, [officialCategories])

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

    const handleCategoryChange = (newCat: string) => {
        if (category === newCat) return
        setCategory(newCat)
        setIsFiltering(true)
        setTimeout(() => setIsFiltering(false), 400)
    }

    const addToCart = (product: Product, event?: React.MouseEvent | React.TouchEvent, variantSku?: string) => {
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

        if (event) {
            const clientX = 'clientX' in event ? (event as React.MouseEvent).clientX : (event as React.TouchEvent).touches[0].clientX
            const clientY = 'clientY' in event ? (event as React.MouseEvent).clientY : (event as React.TouchEvent).touches[0].clientY

            const flyingId = Math.random().toString(36).substring(7)

            setFlyingItems(prev => [...prev, {
                id: flyingId,
                x: clientX,
                y: clientY,
                image: product.images?.[0] || null
            }])

            setTimeout(() => {
                setFlyingItems(prev => prev.filter(item => item.id !== flyingId))
            }, 800)
        }
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
        if (cart.length === 0) {
            toast.error(t("admin.pos.empty_cart"))
            return
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        setIsCheckingOut(true)

        try {
            const orderData = {
                customer: {
                    name: t("admin.pos.walkin_customer"),
                    email: "walkin@pos.local",
                    phone: "",
                    address_line1: t("admin.pos.pos_transaction"),
                    city: t("admin.pos.store_city")
                },
                items: cart.map(item => ({
                    product_id: item.product_id,
                    product_title: item.title,
                    product_sku: item.sku,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity,
                    variant_name: item.variant_name,
                    product_image: item.image
                })),
                subtotal,
                shipping_cost: 0,
                total: subtotal,
                source: 'pos' as const,
                status: 'sale'
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
                await new Promise(resolve => setTimeout(resolve, 1800))
                generatePOSTicketPDF(cart, subtotal, { skipDownload: true })
                setCart([])
                setIsCartOpen(false)
                toast.success(t("admin.pos.order_success"))
            }
        } catch (error) {
            console.error("Checkout failed:", error)
            toast.error(t("admin.pos.checkout_error"))
        } finally {
            setIsCheckingOut(false)
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
            addToCart(foundProduct, undefined, foundVariantSku)
        } else {
            toast.error(`Product with barcode ${barcode} not found`)
        }
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <div className="flex min-h-screen bg-[#FDFDFF] font-sans selection:bg-primary/10 overflow-hidden">
            <AdminSidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative lg:pl-72 lg:rtl:pl-0 lg:rtl:pr-72 transition-all duration-300">
                {/* Zen Background Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[150px] rounded-full pointer-events-none" />

                {/* Compact Adaptive Header */}
                <header className="px-6 py-4 flex items-center justify-between shrink-0 relative z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none mb-1">Azana Zen</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-xl mx-8 hidden md:block group">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t("admin.pos.search_placeholder")}
                                className="w-full bg-white/50 border-gray-100 focus:bg-white focus:border-primary/20 rounded-2xl pl-11 h-11 text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-2xl h-14 w-14 bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 transition-all shadow-sm border border-primary/20"
                            onClick={() => setIsScannerOpen(true)}
                        >
                            <Barcode className="w-8 h-8" />
                        </Button>
                    </div>
                </header>

                {/* Sub-Header: Search for Mobile & Categories */}
                <div className="px-6 pb-4 space-y-4 relative z-20">
                    <div className="md:hidden">
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("admin.pos.search_placeholder")}
                            className="bg-white/50 border-gray-100 rounded-2xl h-12"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-5 py-2.5 rounded-xl border whitespace-nowrap text-[11px] font-bold uppercase tracking-wider transition-all ${category === cat
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                    : "bg-white/50 border-gray-100 text-gray-500 hover:border-primary/20"
                                    }`}
                            >
                                {cat === "all" ? t("admin.pos.all_categories") : (officialCategories.find(c => c.slug === cat)?.name || cat)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Edge-to-Edge Grid */}
                <main className="flex-1 overflow-y-auto px-6 pb-32 custom-scrollbar relative z-10">
                    {isLoading || isFiltering ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                                    <div className="aspect-[4/5] shimmer bg-gray-100" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 w-3/4 shimmer bg-gray-100 rounded-lg" />
                                        <div className="flex items-center justify-between">
                                            <div className="h-6 w-1/2 shimmer bg-gray-100 rounded-lg" />
                                            <div className="h-8 w-8 shimmer bg-gray-100 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all cursor-pointer select-none"
                                    onClick={(e) => addToCart(product, e)}
                                >
                                    <div className="aspect-[4/5] bg-gray-50/50 relative overflow-hidden">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-10"><Package className="w-12 h-12" /></div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <div className="px-2 py-1 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                                {product.category}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <h3 className="text-sm font-bold text-gray-900 truncate leading-none">{product.title}</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-black text-gray-900 tabular-nums">{product.price}</span>
                                                <span className="text-[10px] font-bold text-primary">MAD</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <ShoppingCart className="w-16 h-16 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">{t("admin.pos.no_products_found")}</p>
                        </div>
                    )}
                </main>

                {/* Cart Bar */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%+144px)] lg:-translate-x-1/2 z-[40] w-[calc(100%-3rem)] max-w-4xl lg:w-[calc(100%-36rem)]">
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-[2rem] p-3 flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4 pl-4 cursor-pointer group" onClick={() => setIsCartOpen(true)} ref={cartRef}>
                            <div className="relative">
                                <ShoppingBag className="w-6 h-6 text-primary" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                                        {itemCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-gray-900 tracking-tighter leading-none">{total} <span className="text-xs font-bold text-primary italic">mad</span></span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">{t("admin.pos.view_cart_details")}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setIsCartOpen(true)}
                                className="bg-gray-900 hover:bg-black text-white px-8 h-14 rounded-2xl flex items-center gap-3 active:scale-95 transition-all"
                            >
                                <span className="text-sm font-bold uppercase tracking-widest">{t("admin.pos.view_cart_complete")}</span>
                                <div className="w-px h-4 bg-white/20" />
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Zen Cart Slide-over Drawer */}
                <ZenCart
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    items={cart}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    onCheckout={handleCheckout}
                />

                {/* Barcode Scanner Modal */}
                {isScannerOpen && (
                    <BarcodeScanner
                        onScan={onBarcodeScan}
                        onClose={() => setIsScannerOpen(false)}
                    />
                )}

                {/* Native Print Fallback (Hidden) */}
                {lastOrder && (
                    <div className="hidden print:block">
                        <POSReceipt order={lastOrder} />
                    </div>
                )}

                {/* Flying Animation Overlay */}
                <AnimatePresence>
                    {flyingItems.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{
                                x: item.x - 20,
                                y: item.y - 20,
                                opacity: 1,
                                scale: 0.8,
                                rotate: 0
                            }}
                            animate={{
                                x: cartRef.current ? cartRef.current.getBoundingClientRect().left + 20 : item.x,
                                y: cartRef.current ? cartRef.current.getBoundingClientRect().top : item.y + 500,
                                opacity: 0,
                                scale: 0.2,
                                rotate: 45
                            }}
                            transition={{
                                duration: 0.8,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                            className="fixed z-[9999] pointer-events-none w-12 h-12 rounded-xl overflow-hidden border-2 border-primary/20 shadow-xl bg-white"
                        >
                            {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50"><Package className="w-6 h-6 text-primary/20" /></div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                <AnimatePresence>
                    {isCheckingOut && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
                        >
                            <div className="flex flex-col items-center gap-6 p-12 glass-strong rounded-[3rem] border border-white/10 shadow-2xl">
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary"
                                    />
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <Printer className="w-10 h-10 text-primary" />
                                    </motion.div>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">{t('admin.pos.generating_ticket')}</h2>
                                    <p className="text-primary/60 font-bold uppercase text-[10px] tracking-[0.2em] animate-pulse">{t('admin.pos.printing_in_progress')}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.03); border-radius: 10px; }
                @media print {
                    @page { margin: 0; size: 80mm auto; }
                    body { margin: 0; padding: 0; }
                    body > *:not(.print\\:block) { display: none !important; }
                    .print\\:block { display: block !important; position: absolute; top: 0; left: 0; width: 100%; }
                }
            `}</style>
        </div>
    )
}
