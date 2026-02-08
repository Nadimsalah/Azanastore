"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Sparkles,
    Zap,
    Filter,
    Package,
    RefreshCw,
    MousePointer2,
    ShoppingCart
} from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { POSCard } from "@/components/admin/pos/pos-card"
import { POSCart } from "@/components/admin/pos/pos-cart"
import { POSReceipt } from "@/components/admin/pos/pos-receipt"
import { getProducts, createOrder, type Product, type Order, type OrderItem, type CartItem } from "@/lib/supabase-api"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"


export default function POSPage() {
    const { t } = useLanguage()
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [gravityEnabled, setGravityEnabled] = useState(false)
    const [flyingItem, setFlyingItem] = useState<{ id: string, x: number, y: number } | null>(null)
    const [lastOrder, setLastOrder] = useState<(Order & { order_items: OrderItem[] }) | null>(null)

    useEffect(() => {
        if (lastOrder) {
            // Give the DOM a moment to render the hidden print receipt
            setTimeout(() => {
                window.print()
                setLastOrder(null)
            }, 500)
        }
    }, [lastOrder])

    const handleAddToCart = (itemData: Omit<CartItem, 'quantity'>, event?: React.MouseEvent) => {
        // Trigger "Fly to Cart" animation if event info exists
        if (event) {
            setFlyingItem({
                id: itemData.id,
                x: event.clientX,
                y: event.clientY
            })
        }

        setTimeout(() => {
            setCart(prev => {
                const existing = prev.find(item => item.id === itemData.id)
                if (existing) {
                    return prev.map(item =>
                        item.id === itemData.id ? { ...item, quantity: item.quantity + 1 } : item
                    )
                }
                return [...prev, { ...itemData, quantity: 1 }]
            })
            setFlyingItem(null)
        }, event ? 600 : 0)

        if (!event) {
            // If no event (scanning), show a small toast for feedback
            toast.success(`Ajouté: ${itemData.title}${itemData.variant_name ? ` (${itemData.variant_name})` : ''}`, {
                icon: <ShoppingCart className="w-4 h-4" />
            })
        }
    }

    // SKU Scanning Logic
    useEffect(() => {
        if (!searchQuery) return

        const query = searchQuery.trim().toUpperCase()

        // Check for exact SKU match among products or their variants
        for (const product of products) {
            // 1. Check direct product SKU
            if (product.sku.toUpperCase() === query) {
                handleAddToCart({
                    id: product.id,
                    product_id: product.id,
                    title: product.title,
                    sku: product.sku,
                    price: product.price,
                    image: product.images?.[0]
                })
                setSearchQuery("")
                return
            }

            // 2. Check variant SKUs
            if (product.variants && product.variants.length > 0) {
                for (const variant of product.variants) {
                    if (variant.sku.toUpperCase() === query) {
                        handleAddToCart({
                            id: variant.id,
                            product_id: product.id,
                            title: product.title,
                            variant_name: `${variant.size || ''} ${variant.color || ''}`.trim(),
                            sku: variant.sku,
                            price: variant.price,
                            image: product.images?.[0]
                        })
                        setSearchQuery("")
                        return
                    }
                }
            }
        }
    }, [searchQuery, products])

    useEffect(() => {
        async function loadProducts() {
            setLoading(true)
            const data = await getProducts({ limit: 50 })
            setProducts(data)
            setFilteredProducts(data)
            setLoading(false)
        }
        loadProducts()
    }, [])

    useEffect(() => {
        const query = searchQuery.toLowerCase()
        const filtered = products.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        )
        setFilteredProducts(filtered)
    }, [searchQuery, products])


    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }))
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const handleCheckout = async () => {
        if (cart.length === 0) return

        setLoading(true)
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

        const orderData = {
            customer: {
                name: "POS Customer",
                email: "pos@example.com",
                phone: "0000000000",
                address_line1: "Store Walk-in",
                city: "Local Store"
            },
            items: cart.map(item => ({
                product_id: item.product_id,
                product_title: item.title,
                product_sku: item.sku,
                variant_name: item.variant_name || null,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            })),
            subtotal: total,
            shipping_cost: 0,
            total: total,
            source: 'pos',
            status: 'delivered'
        }

        const result = await createOrder(orderData as any)

        if (result.order) {
            // Fetch complete order with items for receipt
            const fullOrder = {
                ...result.order,
                order_items: orderData.items.map(i => ({ ...i, id: Math.random().toString() })) as OrderItem[]
            }

            setCart([])
            setLastOrder(fullOrder as any)

            // Removed console notification to keep UI clean for printing
        } else {
            toast.error("Failed to complete sale. Please try again.")
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col lg:flex-row h-screen print:p-0 print:bg-white print:h-auto">
            {/* Print Only Receipt */}
            <POSReceipt order={lastOrder} />

            {/* Background elements (Hide when printing) */}
            <div className="fixed inset-0 pointer-events-none opacity-20 print:hidden">
                <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] transition-all duration-1000 ${gravityEnabled ? 'animate-pulse scale-110' : ''}`} />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />
            </div>

            <div className="print:hidden">
                <AdminSidebar />
            </div>

            <main className="flex-1 lg:pl-72 lg:rtl:pl-0 lg:rtl:pr-72 h-full flex flex-col relative z-10 overflow-hidden print:pl-0 print:m-0 print:overflow-visible print:h-auto">
                {/* POS Header */}
                <header className="p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 glass-strong m-4 rounded-[2.5rem] border border-white/5 shadow-2xl print:hidden">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Zap className={`w-6 h-6 text-primary ${gravityEnabled ? 'animate-bounce' : ''}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-foreground tracking-tight">AZANA POS</h1>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest opacity-60">Boutique Checkout System</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Scan or search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 pr-4 rounded-2xl bg-background/50 border-white/5 w-full md:w-80 h-12 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-3 px-4 h-12 glass-light rounded-2xl border border-white/5 transition-all hover:border-primary/20">
                            <MousePointer2 className={`w-4 h-4 ${gravityEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                            <Label htmlFor="gravity-mode" className="text-xs font-bold uppercase cursor-pointer select-none">Gravity</Label>
                            <Switch
                                id="gravity-mode"
                                checked={gravityEnabled}
                                onCheckedChange={setGravityEnabled}
                            />
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 overflow-hidden print:hidden">
                    {/* Products Grid */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-primary" />
                                <span className="font-bold text-sm uppercase tracking-wider">Stock Preview</span>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-xl h-8 gap-2 text-xs" onClick={() => setSearchQuery("")}>
                                <RefreshCw className="w-3 h-3 text-muted-foreground" />
                                Refresh
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 pb-6 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product) => (
                                        <POSCard
                                            key={product.id}
                                            product={product}
                                            gravityEnabled={gravityEnabled}
                                            onAddToCart={(p, e) => handleAddToCart({
                                                id: p.id,
                                                product_id: p.id,
                                                title: p.title,
                                                sku: p.sku,
                                                price: p.price,
                                                image: p.images?.[0]
                                            }, e)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {filteredProducts.length === 0 && !loading && (
                                <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                                    <Package className="w-16 h-16 mb-4" />
                                    <h3 className="text-xl font-bold">No products found</h3>
                                    <p className="text-sm">Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Sidebar */}
                    <aside className="w-full lg:w-[400px] flex flex-col min-h-0">
                        <POSCart
                            items={cart}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeFromCart}
                            onCheckout={handleCheckout}
                        />
                    </aside>
                </div>
            </main>

            {/* Fly to Cart Animation Overlay (Hide when printing) */}
            <AnimatePresence>
                {flyingItem && (
                    <motion.div
                        initial={{ x: flyingItem.x, y: flyingItem.y, scale: 1, opacity: 1, rotate: 0 }}
                        animate={{
                            x: window.innerWidth - 300,
                            y: 200,
                            scale: 0.1,
                            opacity: 0,
                            rotate: 360
                        }}
                        transition={{ duration: 0.6, ease: [0.32, 0, 0.67, 0] }}
                        className="fixed z-[100] w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl pointer-events-none print:hidden"
                    >
                        <ShoppingCart className="w-8 h-8" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
