"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import { getOrders, type Order } from "@/lib/supabase-api"
import { useLanguage } from "@/components/language-provider"

export function RecentOrders() {
    const { t } = useLanguage()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadRecentOrders() {
            try {
                const response = await getOrders({ limit: 5 })
                // getOrders returns { data, count }
                setOrders(response.data || [])
            } catch (error) {
                console.error("Failed to load recent orders:", error)
            } finally {
                setLoading(false)
            }
        }
        loadRecentOrders()
    }, [])

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase()
        switch (s) {
            case "processing": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
            case "delivered": return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
            case "pending": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
            case "cancelled": return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            default: return "bg-secondary text-secondary-foreground"
        }
    }

    return (
        <div className="glass rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">{t('admin.recent_orders.title')}</h3>
                <Link href="/admin/orders">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">{t('admin.recent_orders.view_all')}</Button>
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/50 text-left rtl:text-right">
                            <th className="pb-3 text-sm font-medium text-muted-foreground pl-2 rtl:pl-0 rtl:pr-2">{t('admin.recent_orders.order_id')}</th>
                            <th className="pb-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">{t('admin.recent_orders.customer')}</th>
                            <th className="pb-3 text-sm font-medium text-muted-foreground hidden md:table-cell">{t('admin.recent_orders.email')}</th>
                            <th className="pb-3 text-sm font-medium text-muted-foreground">{t('admin.recent_orders.amount')}</th>
                            <th className="pb-3 text-sm font-medium text-muted-foreground">{t('admin.recent_orders.status')}</th>
                            <th className="pb-3 text-sm font-medium text-muted-foreground text-right rtl:text-left pr-2 rtl:pr-0 rtl:pl-2">{t('admin.recent_orders.action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-muted-foreground animate-pulse">{t('admin.recent_orders.loading')}</td>
                            </tr>
                        ) : orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order.id} className="group hover:bg-primary/5 transition-colors">
                                    <td className="py-4 pl-2 rtl:pl-0 rtl:pr-2 font-medium text-foreground text-xs sm:text-base">{order.order_number}</td>
                                    <td className="py-4 text-foreground/80 hidden sm:table-cell">{order.customer_name}</td>
                                    <td className="py-4 text-sm text-muted-foreground max-w-[200px] truncate hidden md:table-cell">{order.customer_email}</td>
                                    <td className="py-4 font-semibold text-foreground text-xs sm:text-base">MAD {typeof order.total === 'number' ? order.total.toLocaleString('en-US') : order.total}</td>
                                    <td className="py-4">
                                        <Badge variant="outline" className={`border-0 ${getStatusColor(order.status)} text-[10px] sm:text-xs`}>
                                            {t(`status.${order.status.toLowerCase()}`) || order.status}
                                        </Badge>
                                    </td>
                                    <td className="py-4 text-right rtl:text-left pr-2 rtl:pr-0 rtl:pl-2">
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                                                <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-muted-foreground">{t('admin.recent_orders.empty')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

