"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentOrders } from "@/components/admin/recent-orders"
import { Notifications } from "@/components/admin/notifications"
import { Search, Sparkles, Package, ShoppingCart, Users, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PushNotificationManager } from "@/components/admin/push-notification-manager"
import { useLanguage } from "@/components/language-provider"
import { globalSearch, type GlobalSearchResults } from "@/lib/supabase-api"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function AdminDashboard() {
    const { t, language } = useLanguage()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<GlobalSearchResults | null>(null)
    const [searching, setSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)

    // Debounced search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults(null)
            setShowResults(false)
            return
        }

        setSearching(true)
        const timer = setTimeout(async () => {
            const results = await globalSearch(searchQuery)
            setSearchResults(results)
            setShowResults(true)
            setSearching(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const clearSearch = () => {
        setSearchQuery("")
        setSearchResults(null)
        setShowResults(false)
    }

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase()
        switch (s) {
            case "processing": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "delivered": return "bg-green-500/10 text-green-500 border-green-500/20"
            case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20"
            case "sale": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            default: return "bg-secondary text-secondary-foreground"
        }
    }

    const hasResults = searchResults && (
        searchResults.products.length > 0 ||
        searchResults.orders.length > 0 ||
        searchResults.customers.length > 0
    )

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <PushNotificationManager />
            {/* Background gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <AdminSidebar />

            <main className="lg:pl-72 lg:rtl:pl-0 lg:rtl:pr-72 p-4 sm:p-6 lg:p-8 min-h-screen relative z-10 transition-all duration-300">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-4 z-40 glass-strong p-4 rounded-3xl border border-white/5 shadow-lg shadow-black/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{t('admin.dashboard.title')}</h1>
                            <p className="text-xs text-muted-foreground">{t('admin.dashboard.subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rtl:left-auto rtl:right-3 z-10" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('admin.dashboard.search_placeholder')}
                                className="pl-9 rtl:pl-10 rtl:pr-9 w-64 md:w-80 rounded-full bg-background/50 border-white/10 focus:bg-background transition-all h-10 text-left rtl:text-right"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            {searching && (
                                <Loader2 className="absolute right-10 rtl:right-auto rtl:left-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                            )}
                        </div>
                        <Notifications />
                    </div>
                </header>

                {/* Search Results */}
                {showResults && (
                    <div className="mb-8 glass-strong rounded-3xl p-6 border border-white/5">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-primary" />
                            {t('admin.dashboard.search_results')}
                        </h2>

                        {!hasResults ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>{t('admin.dashboard.no_results')}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Products */}
                                {searchResults.products.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            {t('admin.dashboard.products_found')} ({searchResults.products.length})
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {searchResults.products.map((product) => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left rtl:text-right group"
                                                >
                                                    <div className="relative w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.images[0] ? (
                                                            <Image
                                                                src={product.images[0]}
                                                                alt={product.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-muted-foreground/20 absolute inset-0 m-auto" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate">
                                                            {language === 'ar' && product.title_ar ? product.title_ar : product.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                                        <p className="text-xs font-bold text-primary">{product.price} {t('common.currency')}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Orders */}
                                {searchResults.orders.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                            <ShoppingCart className="w-4 h-4" />
                                            {t('admin.dashboard.orders_found')} ({searchResults.orders.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {searchResults.orders.map((order) => (
                                                <button
                                                    key={order.id}
                                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                    className="flex items-center justify-between w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left rtl:text-right group"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm">#{order.order_number}</p>
                                                        <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-sm font-bold text-primary">{order.total} {t('common.currency')}</p>
                                                        <Badge className={`${getStatusColor(order.status)} text-xs`}>
                                                            {t(`status.${order.status.toLowerCase()}`)}
                                                        </Badge>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Customers */}
                                {searchResults.customers.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            {t('admin.dashboard.customers_found')} ({searchResults.customers.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {searchResults.customers.map((customer) => (
                                                <div
                                                    key={customer.id}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm">{customer.name}</p>
                                                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                                                        {customer.phone && (
                                                            <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right rtl:text-left">
                                                        <p className="text-xs text-muted-foreground">{customer.total_orders} {t('admin.stats.orders')}</p>
                                                        <p className="text-sm font-bold text-primary">{customer.total_spent} {t('common.currency')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Bento Grid Layout */}
                {!showResults && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Top Row: Stats (Spawn across all columns) */}
                        <DashboardStats />

                        {/* Bottom Row: Recent Orders (Full Width) */}
                        <div className="lg:col-span-4 min-h-[400px]">
                            <RecentOrders />
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
