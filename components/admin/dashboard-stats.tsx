"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from "lucide-react"
import { getDashboardStats } from "@/lib/supabase-api"
import { useLanguage } from "@/components/language-provider"
import { motion, useSpring, useTransform, animate } from "framer-motion"

function Counter({ value, prefix = "" }: { value: number, prefix?: string }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 1,
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
            <>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-strong rounded-3xl p-6 h-32 animate-pulse bg-white/5" />
                ))}
            </>
        )
    }

    const stats = [
        {
            label: t('admin.stats.total_revenue'),
            value: statsData?.totalRevenue || 0,
            prefix: "MAD ",
            change: "+12.5%",
            trend: "up",
            icon: DollarSign,
            color: "from-primary/20 to-secondary/20",
            textColor: "text-primary",
        },
        {
            label: t('admin.stats.total_orders'),
            value: statsData?.totalOrders || 0,
            change: `+${statsData?.pendingOrders}`,
            trend: "up",
            icon: ShoppingCart,
            color: "from-blue-500/20 to-cyan-500/20",
            textColor: "text-blue-500",
        },
        {
            label: t('admin.stats.total_products'),
            value: statsData?.totalProducts || 0,
            change: t('admin.stats.active'),
            trend: "up",
            icon: Package,
            color: "from-orange-500/20 to-red-500/20",
            textColor: "text-orange-500",
        },
        {
            label: t('admin.stats.total_customers'),
            value: statsData?.totalCustomers || 0,
            change: t('admin.stats.sync'),
            trend: "up",
            icon: Users,
            color: "from-purple-500/20 to-pink-500/20",
            textColor: "text-purple-500",
        },
    ]

    return (
        <>
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-strong rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                >
                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity rtl:right-auto rtl:left-[-1rem]`} />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} ${stat.textColor} shadow-lg shadow-black/5`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full bg-white/5 ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                {stat.change}
                                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 ml-1 rtl:ml-0 rtl:mr-1" /> : <TrendingDown className="w-3 h-3 ml-1 rtl:ml-0 rtl:mr-1" />}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                            <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                                <Counter value={stat.value} prefix={stat.prefix} />
                            </h3>
                        </div>
                    </div>
                </motion.div>
            ))}
        </>
    )
}

