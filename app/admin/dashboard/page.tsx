"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentOrders } from "@/components/admin/recent-orders"
import { Notifications } from "@/components/admin/notifications"
import { Search, Sparkles, Package, ShoppingCart, Users, Loader2, X, Mail, Briefcase, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PushNotificationManager } from "@/components/admin/push-notification-manager"
import { useLanguage } from "@/components/language-provider"
import { globalSearch, type GlobalSearchResults, type ContactMessage, type CareerApplication, listContactMessages, listCareerApplications } from "@/lib/supabase-api"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type TabType = "overview" | "messages" | "applications"

export default function AdminDashboard() {
    const { t, language } = useLanguage()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>("overview")
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<GlobalSearchResults | null>(null)
    const [searching, setSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)

    // Messages state
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null)
    const [loadingMessages, setLoadingMessages] = useState(false)

    // Applications state
    const [applications, setApplications] = useState<CareerApplication[]>([])
    const [activeApplication, setActiveApplication] = useState<CareerApplication | null>(null)
    const [loadingApplications, setLoadingApplications] = useState(false)

    // Load messages when Messages tab is active
    useEffect(() => {
        if (activeTab === "messages" && messages.length === 0) {
            setLoadingMessages(true)
            listContactMessages().then(setMessages).catch(console.error).finally(() => setLoadingMessages(false))
        }
    }, [activeTab, messages.length])

    // Load applications when Applications tab is active
    useEffect(() => {
        if (activeTab === "applications" && applications.length === 0) {
            setLoadingApplications(true)
            listCareerApplications().then(setApplications).catch(console.error).finally(() => setLoadingApplications(false))
        }
    }, [activeTab, applications.length])

    // Debounced search (only for Overview tab)
    useEffect(() => {
        if (activeTab !== "overview") return

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
    }, [searchQuery, activeTab])

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

    const tabs = [
        { id: "overview" as TabType, label: t('admin.dashboard.tab_overview'), icon: LayoutDashboard },
        { id: "messages" as TabType, label: t('admin.dashboard.tab_messages'), icon: Mail, count: messages.length },
        { id: "applications" as TabType, label: t('admin.dashboard.tab_applications'), icon: Briefcase, count: applications.length },
    ]

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
                {/* Header with Search and Tabs */}
                <header className="mb-8 space-y-4">
                    {/* Search Bar (only on Overview tab) */}
                    {activeTab === "overview" && (
                        <div className="glass-strong p-4 rounded-3xl border border-white/5 shadow-lg shadow-black/5">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('admin.dashboard.search_placeholder')}
                                        className="pl-12 pr-12 h-12 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                                    />
                                    {searching && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
                                    )}
                                    {searchQuery && !searching && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                <Notifications />
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="glass-strong p-2 rounded-3xl border border-white/5 inline-flex gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all flex items-center gap-2 ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                                            {tab.count}
                                        </Badge>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </header>

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <>
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
                                                            {product.images?.[0] && (
                                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                                                                    <Image
                                                                        src={product.images[0]}
                                                                        alt={product.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                                                    {language === 'ar' && product.title_ar ? product.title_ar : product.title}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{product.sku}</p>
                                                            </div>
                                                            <p className="text-sm font-semibold">{product.price} DH</p>
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
                                                                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                                                    #{order.order_number}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <p className="text-sm font-semibold">{order.total} DH</p>
                                                                <Badge className={getStatusColor(order.status)}>
                                                                    {order.status}
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
                                                                <p className="font-medium text-sm">{customer.name}</p>
                                                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                                                            </div>
                                                            <div className="text-right rtl:text-left">
                                                                <p className="text-xs text-muted-foreground">{customer.total_orders} orders</p>
                                                                <p className="text-sm font-semibold">{customer.total_spent} DH</p>
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

                        {/* Dashboard Stats and Orders (only show when no search results) */}
                        {!showResults && (
                            <>
                                <DashboardStats />
                                <RecentOrders />
                            </>
                        )}
                    </>
                )}

                {activeTab === "messages" && (
                    <div className="glass-strong rounded-3xl p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{t('admin.dashboard.messages_title')}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                                </p>
                            </div>
                        </div>

                        {loadingMessages ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>{t('admin.dashboard.no_messages')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                                            <TableHead>{language === 'ar' ? 'البريد' : 'Email'}</TableHead>
                                            <TableHead>{language === 'ar' ? 'الموبايل' : 'Phone'}</TableHead>
                                            <TableHead>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                                            <TableHead>{language === 'ar' ? 'الرسالة' : 'Message'}</TableHead>
                                            <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {messages.map((msg) => (
                                            <TableRow key={msg.id}>
                                                <TableCell>{msg.name}</TableCell>
                                                <TableCell>{msg.email}</TableCell>
                                                <TableCell>{msg.phone}</TableCell>
                                                <TableCell>{msg.type}</TableCell>
                                                <TableCell className="max-w-xs">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="flex-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                                            {msg.message}
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setActiveMessage(msg)}
                                                        >
                                                            {t('admin.dashboard.view_message')}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{new Date(msg.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Message Dialog */}
                        <Dialog open={!!activeMessage} onOpenChange={(open) => !open && setActiveMessage(null)}>
                            <DialogContent className="max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>{t('admin.dashboard.message_details')}</DialogTitle>
                                </DialogHeader>
                                {activeMessage && (
                                    <div className="space-y-2 text-sm">
                                        <p><strong>{language === 'ar' ? 'الاسم:' : 'Name:'}</strong> {activeMessage.name}</p>
                                        {activeMessage.email && <p><strong>{language === 'ar' ? 'البريد:' : 'Email:'}</strong> {activeMessage.email}</p>}
                                        <p><strong>{language === 'ar' ? 'الموبايل:' : 'Phone:'}</strong> {activeMessage.phone}</p>
                                        {activeMessage.company && <p><strong>{language === 'ar' ? 'الشركة:' : 'Company:'}</strong> {activeMessage.company}</p>}
                                        {activeMessage.type && <p><strong>{language === 'ar' ? 'النوع:' : 'Type:'}</strong> {activeMessage.type}</p>}
                                        <p className="mt-4 whitespace-pre-line break-words">
                                            {activeMessage.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-3">
                                            {new Date(activeMessage.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                {activeTab === "applications" && (
                    <div className="glass-strong rounded-3xl p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Briefcase className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{t('admin.dashboard.applications_title')}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {applications.length} {applications.length === 1 ? 'application' : 'applications'}
                                </p>
                            </div>
                        </div>

                        {loadingApplications ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>{t('admin.dashboard.no_applications')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                                            <TableHead>{language === 'ar' ? 'البريد' : 'Email'}</TableHead>
                                            <TableHead>{language === 'ar' ? 'الموبايل' : 'Phone'}</TableHead>
                                            <TableHead>{language === 'ar' ? 'الوظيفة' : 'Role'}</TableHead>
                                            <TableHead>{language === 'ar' ? 'السيرة الذاتية' : 'CV'}</TableHead>
                                            <TableHead>{language === 'ar' ? 'نبذة' : 'Summary'}</TableHead>
                                            <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applications.map((app) => (
                                            <TableRow key={app.id}>
                                                <TableCell>{app.name}</TableCell>
                                                <TableCell>{app.email}</TableCell>
                                                <TableCell>{app.phone}</TableCell>
                                                <TableCell>{app.role}</TableCell>
                                                <TableCell>
                                                    {app.cv_file_name ? (
                                                        <a
                                                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${app.cv_file_name}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary underline"
                                                        >
                                                            {t('admin.dashboard.open_cv')}
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            {t('admin.dashboard.no_file')}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="flex-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                                            {app.summary}
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setActiveApplication(app)}
                                                        >
                                                            {t('admin.dashboard.view_application')}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Application Dialog */}
                        <Dialog open={!!activeApplication} onOpenChange={(open) => !open && setActiveApplication(null)}>
                            <DialogContent className="max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>{t('admin.dashboard.application_details')}</DialogTitle>
                                </DialogHeader>
                                {activeApplication && (
                                    <div className="space-y-2 text-sm">
                                        <p><strong>{language === 'ar' ? 'الاسم:' : 'Name:'}</strong> {activeApplication.name}</p>
                                        <p><strong>{language === 'ar' ? 'البريد:' : 'Email:'}</strong> {activeApplication.email}</p>
                                        <p><strong>{language === 'ar' ? 'الموبايل:' : 'Phone:'}</strong> {activeApplication.phone}</p>
                                        <p><strong>{language === 'ar' ? 'الوظيفة:' : 'Role:'}</strong> {activeApplication.role}</p>
                                        {activeApplication.cv_file_name && (
                                            <p><strong>{language === 'ar' ? 'ملف الـ CV:' : 'CV file:'}</strong> {activeApplication.cv_file_name}</p>
                                        )}
                                        <p className="mt-4 whitespace-pre-line break-words">
                                            {activeApplication.summary}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-3">
                                            {new Date(activeApplication.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </main>
        </div>
    )
}
