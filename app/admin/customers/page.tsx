"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Download,
    Filter,
    MoreHorizontal,
    Mail,
    Ban,
    UserCheck,
    Users,
} from "lucide-react"
import { getCustomers, type Customer } from "@/lib/supabase-api"
import { useLanguage } from "@/components/language-provider"

export default function CustomersPage() {
    const { t } = useLanguage()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        async function loadCustomers() {
            setLoading(true)
            const data = await getCustomers()
            setCustomers(data)
            setLoading(false)
        }
        loadCustomers()
    }, [])

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const stats = [
        { label: t('admin.customers.total_customers'), value: customers.length.toLocaleString('en-US'), icon: Users, color: "text-primary" },
        { label: t('admin.customers.active_customers'), value: customers.filter(c => c.status === 'active').length.toLocaleString('en-US'), icon: UserCheck, color: "text-green-500" },
    ]

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <AdminSidebar />

            <main className="lg:pl-72 lg:rtl:pl-0 lg:rtl:pr-72 p-4 sm:p-6 lg:p-8 min-h-screen relative z-10 transition-all duration-300">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-4 z-40 glass-strong p-4 rounded-3xl border border-white/5 shadow-lg shadow-black/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{t('admin.customers.title')}</h1>
                            <p className="text-xs text-muted-foreground">{t('admin.customers.subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-full h-9 bg-background/50 border-white/10 hidden sm:flex">
                            <Download className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" /> {t('admin.customers.export')}
                        </Button>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="glass-strong rounded-3xl p-6 relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                                </div>
                                <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Table */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-background/40 backdrop-blur-md p-4 rounded-3xl border border-white/5">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                            <Input
                                placeholder={t('admin.customers.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 rtl:pl-3 rtl:pr-9 rounded-full bg-white/5 border-white/10"
                            />
                        </div>
                        <Button variant="outline" className="rounded-full h-10 bg-white/5 border-white/10">
                            <Filter className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" /> {t('admin.customers.filters')}
                        </Button>
                    </div>

                    <div className="glass-strong rounded-3xl overflow-hidden min-h-[500px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left rtl:text-right border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] sm:text-xs">
                                        <th className="py-4 px-6 text-left rtl:text-right">{t('admin.customers.table_customer')}</th>
                                        <th className="py-4 px-6 text-left rtl:text-right">{t('status.all')}</th>
                                        <th className="py-4 px-6 hidden md:table-cell text-left rtl:text-right">{t('admin.customers.table_orders')}</th>
                                        <th className="py-4 px-6 hidden lg:table-cell text-left rtl:text-right">{t('admin.customers.table_spent')}</th>
                                        <th className="py-4 px-6 hidden xl:table-cell text-left rtl:text-right">{t('admin.customers.table_joined')}</th>
                                        <th className="py-4 px-6 text-right rtl:text-left">{t('admin.recent_orders.action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-muted-foreground animate-pulse">{t('admin.customers.loading')}</td>
                                        </tr>
                                    ) : filteredCustomers.length > 0 ? (
                                        filteredCustomers.map((customer) => (
                                            <tr key={customer.id} className="group hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold">
                                                            {customer.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-foreground text-sm sm:text-base">{customer.name}</p>
                                                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Badge variant="outline" className={`rounded-full border-0 ${customer.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        {customer.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6 hidden md:table-cell text-sm">{customer.total_orders || 0}</td>
                                                <td className="py-4 px-6 hidden lg:table-cell font-semibold">MAD {customer.total_spent?.toLocaleString('en-US') || 0}</td>
                                                <td className="py-4 px-6 hidden xl:table-cell text-sm text-muted-foreground">
                                                    {new Date(customer.created_at).toLocaleDateString('en-US')}
                                                </td>
                                                <td className="py-4 px-6 text-right rtl:text-left">
                                                    <div className="flex items-center justify-end rtl:justify-start gap-2">
                                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-500/10 hover:text-red-500">
                                                            <Ban className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="rounded-full">
                                                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-muted-foreground">{t('admin.customers.no_customers')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

