"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { getDashboardStats } from "@/lib/supabase-api"
import { useLanguage } from "@/components/language-provider"
import { motion, animate } from "framer-motion"

function Counter({ value, prefix = "" }: { value: number, prefix?: string }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 1.2,
            onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
        })
        return () => controls.stop()
    }, [value])

    return (
        <span>
            {prefix}{displayValue.toLocaleString('en-US')}
        </span>
    )
}

export function DashboardStats() {
    const { t } = useLanguage()
    const [statsData, setStatsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            const data = await getDashboardStats()
            setStatsData(data)
            setLoading(false)
        }
        loadStats()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-strong rounded-3xl p-6 h-40 animate-pulse bg-white/5" />
                ))}
            </div>
        )
    }

    const stats = [
        {
            label: t('admin.stats.total_revenue'),
            value: statsData?.totalRevenue || 0,
            prefix: "MAD ",
            change: "+12.5%",
            changeValue: "+11",
            trend: "up",
            icon: DollarSign,
            gradient: "from-emerald-500/20 via-green-500/10 to-teal-500/20",
            iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
            iconColor: "text-white",
            glowColor: "shadow-emerald-500/20",
        },
        {
            label: t('admin.stats.total_orders'),
            value: statsData?.totalOrders || 0,
            change: `+${statsData?.pendingOrders || 0}`,
            changeValue: t('admin.stats.active'),
            trend: "up",
            icon: ShoppingCart,
            gradient: "from-blue-500/20 via-cyan-500/10 to-sky-500/20",
            iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
            iconColor: "text-white",
            glowColor: "shadow-blue-500/20",
        },
        {
            label: t('admin.stats.total_products'),
            value: statsData?.totalProducts || 0,
            change: "+8",
            changeValue: t('admin.stats.sync'),
            trend: "up",
            icon: Package,
            gradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20",
            iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
            iconColor: "text-white",
            glowColor: "shadow-orange-500/20",
        },
        {
            label: t('admin.stats.total_customers'),
            value: statsData?.totalCustomers || 0,
            change: "+5",
            changeValue: t('admin.stats.this_month'),
            trend: "up",
            icon: Users,
            gradient: "from-purple-500/20 via-violet-500/10 to-fuchsia-500/20",
            iconBg: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
            iconColor: "text-white",
            glowColor: "shadow-purple-500/20",
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="group relative"
                >
                    {/* Card Container */}
                    <div className="glass-strong rounded-3xl p-6 relative overflow-hidden hover:scale-[1.02] transition-all duration-300 border border-white/5 h-full">
                        {/* Animated Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        {/* Glow Effect */}
                        <div className={`absolute -inset-1 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`} />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full">
                            {/* Header: Icon + Change Badge */}
                            <div className="flex items-start justify-between mb-4">
                                {/* Icon */}
                                <div className={`p-3 rounded-2xl ${stat.iconBg} ${stat.iconColor} shadow-lg ${stat.glowColor} group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="w-5 h-5" strokeWidth={2.5} />
                                </div>

                                {/* Change Badge */}
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${stat.trend === 'up'
                                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                    }`}>
                                    {stat.trend === 'up' ? (
                                        <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={3} />
                                    ) : (
                                        <ArrowDownRight className="w-3.5 h-3.5" strokeWidth={3} />
                                    )}
                                    {stat.change}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex-1 flex flex-col justify-end">
                                {/* Label */}
                                <p className="text-sm text-muted-foreground font-medium mb-2 tracking-wide">
                                    {stat.label}
                                </p>

                                {/* Value */}
                                <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-1 tracking-tight">
                                    <Counter value={stat.value} prefix={stat.prefix} />
                                </h3>

                                {/* Sub-info */}
                                <p className="text-xs text-muted-foreground/70 font-medium">
                                    {stat.changeValue}
                                </p>
                            </div>
                        </div>

                        {/* Decorative Corner Element */}
                        <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity rtl:right-auto rtl:left-0">
                            <stat.icon className="w-full h-full" strokeWidth={0.5} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
