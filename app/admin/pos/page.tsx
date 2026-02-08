
"use client"

import { useState, useEffect, useMemo } from "react"
import { POSCard } from "@/components/admin/pos/pos-card"
import { POSCart } from "@/components/admin/pos/pos-cart"
import { POSReceipt } from "@/components/admin/pos/pos-receipt"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Search, ShoppingBag, LayoutGrid, RotateCcw } from "lucide-react"
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
    const [selectedCategory, setSelectedCategory] = useState<string>("All")
    const [categories, setCategories] = useState<string[]>(["All"])
    const [loading, setLoading] = useState(true)
    const [lastOrder, setLastOrder] = useState<(Order & { order_items: OrderItem[] }) | null>(null)
    const [gravityEnabled, setGravityEnabled] = useState(false)
    const { t } = useLanguage()

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        try {
            // Fetch all active products
            const data = await getProducts({ status: 'active', limit: 100 })
            setProducts(data || [])

            // Fetch categories from categories table
            const { data: categoriesData } = await supabase
                .from('categories')
                .select('name')
                .order('name')

            if (categoriesData) {
                // Exclude specific categories from POS
                const excludedCategories = ['face_care', 'hair_care', 'body_care', 'gift_sets']
                const filteredCategories = categoriesData.filter(c => !excludedCategories.includes(c.name))
                const categoryNames = ["All", ...filteredCategories.map(c => c.name)]
                setCategories(categoryNames)
            }
        } catch (error) {
            console.error("Failed to load products:", error)
            toast.error("Failed to load products")
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [products, searchQuery, selectedCategory])

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
        // Toast notification removed
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
            // Create order with basic walk-in customer details
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
                status: 'delivered' // Auto-complete POS orders
            }

            const { order, error } = await createOrder(orderData)

            if (error) throw error

            if (order) {
                // Prepare receipt data
                const receiptOrder = {
                    ...order,
                    order_items: cart.map(item => ({
                        // map cart items to match OrderItem structure for receipt
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
                toast.success(t("admin.pos.order_success"))

                // Trigger print after a short delay to allow state update
                setTimeout(() => {
                    window.print()
                }, 500)
            }
        } catch (error) {
            console.error("Checkout failed:", error)
            toast.error(t("admin.pos.checkout_error"))
        }
    }

    return (
        <div className="flex bg-background text-foreground h-screen overflow-hidden">
            <AdminSidebar />

            <main className="flex-1 flex flex-col lg:flex-row lg:pl-72 rtl:lg:pl-0 rtl:lg:pr-72 min-w-0 transition-all duration-300 h-full relative">
                {/* Product Grid Section */}
                <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-6 gap-4 lg:gap-6 h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
                                <span className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <LayoutGrid className="w-5 h-5 lg:w-6 lg:h-6" />
                                </span>
                                {t("admin.pos.title")}
                            </h1>
                            <p className="text-muted-foreground text-xs lg:text-sm">{t("admin.pos.subtitle")}</p>
                        </div>

                        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-2xl border border-white/10 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder={t("admin.pos.search_placeholder")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 rtl:pr-9 rtl:pl-3 bg-transparent border-0 focus-visible:ring-0 h-10 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar shrink-0">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === category
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                                    : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {category === "All" ? t("admin.pos.category_all") : category}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto min-h-0 pr-1 lg:pr-2 custom-scrollbar pb-24 lg:pb-0">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="h-48 lg:h-64 rounded-[2rem] lg:rounded-[2.5rem] bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product) => (
                                        <POSCard
                                            key={product.id}
                                            product={product}
                                            gravityEnabled={gravityEnabled}
                                            onAddToCart={addToCart}
                                        />
                                    ))}
                                </AnimatePresence>

                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
                                        <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                                        <p>{t("admin.pos.no_products")}</p>
                                        <Button
                                            variant="link"
                                            onClick={() => {
                                                setSearchQuery("")
                                                setSelectedCategory("All")
                                            }}
                                        >
                                            {t("admin.pos.clear_filters")}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Cart - Hidden on Mobile */}
                <div className="hidden lg:flex w-[400px] p-6 pl-0 flex-col h-full">
                    <POSCart
                        items={cart}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                        onCheckout={handleCheckout}
                    />
                </div>

                {/* Mobile Cart Button & Sheet */}
                <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold shadow-xl shadow-primary/20 flex items-center justify-between px-6">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    <span>{t("admin.pos.view_cart")}</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                        {cart.reduce((sum, item) => sum + item.quantity, 0)} {t("admin.pos.items")}
                                    </span>
                                </div>
                                <span>
                                    {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} MAD
                                </span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] p-0 border-0">
                            <div className="sr-only">
                                <SheetTitle>{t("admin.pos.cart_title")}</SheetTitle>
                            </div>
                            <div className="h-full pt-4">
                                <POSCart
                                    items={cart}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeFromCart}
                                    onCheckout={() => {
                                        // Close sheet logic would ideally go here, but POSCart handles checkout directly
                                        // For now, checkout will work and sheet will stay open or we can trigger a close via ref if needed
                                        handleCheckout()
                                    }}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </main>

            {/* Hidden Receipt for Printing */}
            <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
                {lastOrder && <POSReceipt order={lastOrder} />}
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: 80mm auto; }
                    body { margin: 0; padding: 0; }
                    /* Hide everything except the receipt container */
                    body > *:not(.print\\:block) { display: none !important; }
                    .print\\:block { display: block !important; position: absolute; top: 0; left: 0; width: 100%; }
                }
            `}</style>
        </div>
    )
}
