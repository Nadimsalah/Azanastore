"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getOrders, type Order } from "@/lib/supabase-api"
import { Notifications } from "@/components/admin/notifications"
import { useLanguage } from "@/components/language-provider" // Import translation hook
import {
    Search,
    Filter,
    Download,
    Calendar,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Eye,
    ShoppingBag
} from "lucide-react"

export default function AdminOrdersPage() {
    const { t } = useLanguage() // Initialize translation hook
    const [activeTab, setActiveTab] = useState("all") // Use lowercase keys
    const [searchQuery, setSearchQuery] = useState("")
    const [orders, setOrders] = useState<Order[]>([])
    const [totalOrders, setTotalOrders] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const limit = 10

    useEffect(() => {
        setPage(1)
    }, [activeTab])

    useEffect(() => {
        async function loadOrders() {
            setLoading(true)
            const { data, count } = await getOrders({
                status: activeTab === "all" ? undefined : activeTab,
                limit,
                offset: (page - 1) * limit
            })
            setOrders(data)
            setTotalOrders(count)
            setLoading(false)
        }
        loadOrders()
    }, [activeTab, page])

    const tabs = ["all", "processing", "delivered", "pending", "cancelled"]

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    })

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
                            <ShoppingBag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{t('admin.orders.title')}</h1>
                            <p className="text-xs text-muted-foreground">{t('admin.orders.subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">

                        {/* Create Order Button Removed */}
                        <Notifications />
                    </div>
                </header>

                {/* Filters & Controls */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-background/40 backdrop-blur-md p-1 rounded-2xl border border-white/5">
                        {/* Tabs */}
                        <div className="flex p-1 bg-white/5 rounded-xl overflow-x-auto max-w-full no-scrollbar w-full sm:w-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        }`}
                                >
                                    {t(`status.${tab}`)}
                                </button>
                            ))}
                        </div>

                        {/* Search & Date */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('admin.orders.search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 rtl:pr-9 rtl:pl-3 rounded-xl bg-white/5 border-white/10 focus:bg-white/10 h-10 text-left rtl:text-right"
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-white/5 border-white/10">
                                <Calendar className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="glass-strong rounded-3xl overflow-hidden min-h-[500px] flex flex-col">
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left rtl:text-right">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5 text-left rtl:text-right">
                                        <th className="py-4 pl-4 rtl:pl-0 rtl:pr-4 sm:pl-6 sm:rtl:pr-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.orders.table.order')}</th>
                                        <th className="py-4 px-2 sm:px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('admin.orders.table.date')}</th>
                                        <th className="py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{t('admin.orders.table.customer')}</th>
                                        <th className="py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell text-center">{t('admin.orders.table.items')}</th>
                                        <th className="py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.orders.table.total')}</th>
                                        <th className="py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.orders.table.source')}</th>
                                        <th className="py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.orders.table.status')}</th>
                                        <th className="py-4 pr-6 rtl:pr-0 rtl:pl-6 text-right rtl:text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.orders.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                                                <td className="py-3 sm:py-4 pl-4 sm:pl-6 rtl:pl-0 rtl:pr-4 sm:rtl:pr-6">
                                                    <span className="font-semibold text-foreground text-xs sm:text-sm">{order.order_number}</span>
                                                    <div className="md:hidden text-[10px] text-muted-foreground mt-0.5">
                                                        {new Date(order.created_at).toLocaleDateString('en-US')}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-foreground/80 hidden md:table-cell">
                                                    {new Date(order.created_at).toLocaleDateString('en-US')}
                                                </td>
                                                <td className="py-4 px-4 text-sm font-medium text-foreground hidden sm:table-cell">
                                                    {order.source === 'pos' || order.customer_email === 'walkin@pos.local' ? t('admin.pos.walkin_customer') : order.customer_name}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground hidden lg:table-cell text-center">
                                                    {order.order_items?.length || 0}
                                                </td>
                                                <td className="py-4 px-4 text-sm font-bold text-foreground">{t('common.currency')} {order.total.toLocaleString('en-US')}</td>
                                                <td className="py-4 px-4">
                                                    <Badge variant="outline" className={`border ${order.source === 'pos' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'} text-[10px] sm:text-xs py-0.5 px-2`}>
                                                        {t(`source.${order.source || 'online'}`)}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge variant="outline" className={`border ${getStatusColor(order.status)} text-[10px] sm:text-xs py-0.5 px-2`}>
                                                        {t(`status.${order.status.toLowerCase()}`) || order.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 pr-6 rtl:pr-0 rtl:pl-6 text-right rtl:text-left">
                                                    <div className="flex items-center justify-end rtl:justify-start gap-2">
                                                        <Link href={`/admin/orders/${order.id}`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                                {loading ? t('admin.orders.loading') : t('admin.orders.not_found')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-white/10 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t('admin.orders.pagination')
                                    .replace('{start}', ((page - 1) * limit + 1).toString())
                                    .replace('{end}', Math.min(page * limit, totalOrders).toString())
                                    .replace('{total}', totalOrders.toString())}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg bg-transparent border-white/10"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || loading}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg bg-transparent border-white/10"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page * limit >= totalOrders || loading}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
