"use client"

import { useState, useEffect } from "react"
import { Bell, ShoppingBag, User, Package, Clock, CheckCircle2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { getOrders, type Order } from "@/lib/supabase-api"
import { formatDistanceToNow } from "date-fns"
import { arSA } from "date-fns/locale"
import Link from "next/link"

export function Notifications() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        async function loadNotifications() {
            try {
                // Fetch recent orders as proxy for notifications
                const response = await getOrders({ limit: 5 })
                const orders = response.data || []

                const mappedNotifications = orders.map((order: Order) => ({
                    id: order.id,
                    type: 'order',
                    title: 'طلب جديد',
                    description: `الطلب ${order.order_number} من ${order.customer_name}`,
                    time: order.created_at,
                    status: order.status,
                    link: `/admin/orders/${order.id}`
                }))

                setNotifications(mappedNotifications)
                // For now, consider all fetched as "unread" in this session for demo purposes
                setUnreadCount(mappedNotifications.length)
            } catch (error) {
                console.error("Failed to load notifications:", error)
            } finally {
                setLoading(false)
            }
        }

        loadNotifications()
    }, [])

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingBag className="w-4 h-4 text-primary" />
            case 'user': return <User className="w-4 h-4 text-blue-500" />
            case 'product': return <Package className="w-4 h-4 text-orange-500" />
            default: return <Bell className="w-4 h-4 text-gray-500" />
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-primary/10 transition-colors">
                    <Bell className="w-5 h-5 text-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-destructive text-[10px] font-bold text-white rounded-full ring-2 ring-background flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 glass-strong border-white/10 rounded-3xl overflow-hidden shadow-2xl" align="end" sideOffset={8}>
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5" dir="rtl">
                    <h4 className="font-bold text-sm">الإشعارات</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => setUnreadCount(0)}
                            className="text-[10px] font-semibold text-primary hover:underline"
                        >
                            تحديد الكل كمقروء
                        </button>
                    )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
                            جاري التحميل...
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notif) => (
                                <Link
                                    key={notif.id}
                                    href={notif.link}
                                    className="p-4 flex gap-3 hover:bg-white/5 transition-colors group block items-start"
                                    dir="rtl"
                                >
                                    <div className="mt-1 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-semibold text-foreground leading-none">{notif.title}</p>
                                            <span className="text-[9px] text-muted-foreground whitespace-nowrap mr-2">
                                                {formatDistanceToNow(new Date(notif.time), { addSuffix: true, locale: arSA })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${notif.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                                'bg-primary/10 text-primary'
                                                }`}>
                                                {notif.status}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <CheckCircle2 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm font-medium text-foreground">الكل مقروء!</p>
                            <p className="text-xs text-muted-foreground mt-1">لا توجد إشعارات جديدة.</p>
                        </div>
                    )}
                </div>
                {notifications.length > 0 && (
                    <Link href="/admin/orders" className="block p-3 text-center text-xs font-semibold hover:bg-white/5 border-t border-white/5 transition-colors">
                        عرض كل الطلبات
                    </Link>
                )}
            </PopoverContent>
        </Popover>
    )
}
