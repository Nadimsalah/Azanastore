"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAnalyticsSummary, getTopProducts, type AnalyticsSummary, type TopProduct } from "@/lib/supabase-api"
import {
    TrendingUp,
    ShoppingCart,
    Store,
    Globe,
    Calendar,
    Search,
    DollarSign,
    Package,
    BarChart3
} from "lucide-react"
import Image from "next/image"

export default function AnalyticsPage() {
    const { t, language } = useLanguage()
    const [summary, setSummary] = useState<AnalyticsSummary>({
        totalRevenue: 0,
        posRevenue: 0,
        ecommerceRevenue: 0,
        posOrders: 0,
        ecommerceOrders: 0
    })
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "week" | "month" | "custom">("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    const loadData = async () => {
        setLoading(true)

        let start: string | undefined
        let end: string | undefined

        if (dateFilter === "today") {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            start = today.toISOString()
            const endOfDay = new Date()
            endOfDay.setHours(23, 59, 59, 999)
            end = endOfDay.toISOString()
        } else if (dateFilter === "yesterday") {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            yesterday.setHours(0, 0, 0, 0)
            start = yesterday.toISOString()
            const endOfYesterday = new Date()
            endOfYesterday.setDate(endOfYesterday.getDate() - 1)
            endOfYesterday.setHours(23, 59, 59, 999)
            end = endOfYesterday.toISOString()
        } else if (dateFilter === "week") {
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            start = weekAgo.toISOString().split('T')[0]
        } else if (dateFilter === "month") {
            const monthAgo = new Date()
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            start = monthAgo.toISOString().split('T')[0]
        } else if (dateFilter === "custom" && startDate && endDate) {
            start = startDate
            end = endDate
        }

        const [summaryData, productsData] = await Promise.all([
            getAnalyticsSummary(start, end),
            getTopProducts(start, end, 50)
        ])

        setSummary(summaryData)
        setTopProducts(productsData)
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [dateFilter, startDate, endDate])

    const filteredProducts = topProducts.filter(product => {
        const title = language === 'ar' && product.title_ar ? product.title_ar : product.title
        return title.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const StatCard = ({ icon: Icon, label, value, color }: any) => (
        <div className="glass-strong rounded-3xl p-6 border-l-4" style={{ borderColor: color }}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-${color}/10`}>
                    <Icon className="w-6 h-6" style={{ color }} />
                </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <AdminSidebar />

            <main className="lg:pl-72 lg:rtl:pl-0 lg:rtl:pr-72 p-4 sm:p-6 lg:p-8 min-h-screen relative z-10 transition-all duration-300">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-4 z-40 glass-strong p-4 rounded-3xl border border-white/5 shadow-lg shadow-black/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{t('admin.analytics.title')}</h1>
                            <p className="text-xs text-muted-foreground">{t('admin.analytics.subtitle')}</p>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {["all", "today", "yesterday", "week", "month", "custom"].map((filter) => (
                            <Button
                                key={filter}
                                variant={dateFilter === filter ? "default" : "outline"}
                                size="sm"
                                onClick={() => setDateFilter(filter as any)}
                                className="rounded-full text-xs"
                            >
                                {t(`admin.analytics.${filter === "all" ? "all_time" : filter === "week" ? "this_week" : filter === "month" ? "this_month" : filter}`)}
                            </Button>
                        ))}
                    </div>
                </header>

                {/* Custom Date Range */}
                {dateFilter === "custom" && (
                    <div className="glass-strong rounded-2xl p-4 mb-6 flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">{t('admin.analytics.from')}:</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-40 rounded-xl bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">{t('admin.analytics.to')}:</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-40 rounded-xl bg-white/5 border-white/10"
                            />
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
                    <StatCard
                        icon={DollarSign}
                        label={t('admin.analytics.total_revenue')}
                        value={`${summary.totalRevenue.toLocaleString()} ${t('common.currency')}`}
                        color="#10b981"
                    />
                    <StatCard
                        icon={Store}
                        label={t('admin.analytics.pos_revenue')}
                        value={`${summary.posRevenue.toLocaleString()} ${t('common.currency')}`}
                        color="#f97316"
                    />
                    <StatCard
                        icon={Globe}
                        label={t('admin.analytics.ecommerce_revenue')}
                        value={`${summary.ecommerceRevenue.toLocaleString()} ${t('common.currency')}`}
                        color="#8b5cf6"
                    />
                    <StatCard
                        icon={ShoppingCart}
                        label={t('admin.analytics.pos_orders')}
                        value={summary.posOrders}
                        color="#f97316"
                    />
                    <StatCard
                        icon={ShoppingCart}
                        label={t('admin.analytics.ecommerce_orders')}
                        value={summary.ecommerceOrders}
                        color="#8b5cf6"
                    />
                </div>

                {/* Top Products Table */}
                <div className="glass-strong rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                {t('admin.analytics.top_products')}
                            </h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={t('admin.analytics.search_products')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 rtl:pr-9 rtl:pl-3 rounded-xl bg-white/5 border-white/10"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left rtl:text-right">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="py-4 pl-6 rtl:pl-0 rtl:pr-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {t('admin.analytics.product_name')}
                                    </th>
                                    <th className="py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                                        {t('admin.analytics.total_sold')}
                                    </th>
                                    <th className="py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                                        {t('admin.analytics.revenue')}
                                    </th>
                                    <th className="py-4 pr-6 rtl:pr-0 rtl:pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                                        {t('admin.analytics.orders')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-muted-foreground">
                                            {t('admin.analytics.loading')}
                                        </td>
                                    </tr>
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map((product, index) => (
                                        <tr key={product.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="py-4 pl-6 rtl:pl-0 rtl:pr-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-12 h-12 bg-muted rounded-xl overflow-hidden flex-shrink-0">
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
                                                    <div>
                                                        <p className="font-semibold text-foreground text-sm">
                                                            {language === 'ar' && product.title_ar ? product.title_ar : product.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">#{index + 1}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                    {product.totalSold} {t('admin.products.units')}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-4 text-center font-bold text-primary">
                                                {product.revenue.toLocaleString()} {t('common.currency')}
                                            </td>
                                            <td className="py-4 pr-6 rtl:pr-0 rtl:pl-6 text-center text-muted-foreground">
                                                {product.orderCount}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-muted-foreground">
                                            {t('admin.analytics.no_data')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
