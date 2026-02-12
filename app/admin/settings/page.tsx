"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { getAdminSettings, updateAdminSettings } from "@/lib/supabase-api"
import { toast } from "sonner"
import {
    Settings,
    Store,
    Truck,
    CreditCard,
    Bell,
    Package,
    Megaphone,
    Shield,
    Save,
    Loader2
} from "lucide-react"

type TabType = "store" | "shipping" | "payment" | "notifications" | "product" | "marketing" | "system"

export default function SettingsPage() {
    const { t, language } = useLanguage()
    const [activeTab, setActiveTab] = useState<TabType>("store")
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    async function loadSettings() {
        setLoading(true)
        const data = await getAdminSettings()
        setSettings(data)
        setLoading(false)
    }

    async function handleSave() {
        setSaving(true)
        const result = await updateAdminSettings(settings)
        if (result.success) {
            toast.success(t('admin.settings.saved'))
        } else {
            toast.error(t('admin.settings.save_failed'))
        }
        setSaving(false)
    }

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const tabs = [
        { id: "store" as TabType, label: t('admin.settings.tab_store'), icon: Store },
        { id: "shipping" as TabType, label: t('admin.settings.tab_shipping'), icon: Truck },
        { id: "payment" as TabType, label: t('admin.settings.tab_payment'), icon: CreditCard },
        { id: "notifications" as TabType, label: t('admin.settings.tab_notifications'), icon: Bell },
        { id: "product" as TabType, label: t('admin.settings.tab_product'), icon: Package },
        { id: "marketing" as TabType, label: t('admin.settings.tab_marketing'), icon: Megaphone },
        { id: "system" as TabType, label: t('admin.settings.tab_system'), icon: Shield },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
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
                            <Settings className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{t('admin.settings.title')}</h1>
                            <p className="text-xs text-muted-foreground">{t('admin.settings.subtitle')}</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-full"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {saving ? t('admin.settings.saving') : t('admin.settings.save')}
                    </Button>
                </header>

                {/* Tabs */}
                <div className="glass-strong rounded-3xl overflow-hidden">
                    <div className="flex overflow-x-auto border-b border-white/10 scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                            ? "text-primary border-b-2 border-primary bg-primary/5"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="p-6">
                        {/* Store Tab */}
                        {activeTab === "store" && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.store_name')}</label>
                                    <Input
                                        value={settings.store_name || ""}
                                        onChange={(e) => handleChange("store_name", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.store_name_ar')}</label>
                                    <Input
                                        value={settings.store_name_ar || ""}
                                        onChange={(e) => handleChange("store_name_ar", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10 text-right"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.store_description')}</label>
                                    <textarea
                                        rows={3}
                                        value={settings.store_description || ""}
                                        onChange={(e) => handleChange("store_description", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-all text-sm resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.store_description_ar')}</label>
                                    <textarea
                                        rows={3}
                                        value={settings.store_description_ar || ""}
                                        onChange={(e) => handleChange("store_description_ar", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-all text-sm resize-none text-right"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.contact_email')}</label>
                                    <Input
                                        type="email"
                                        value={settings.contact_email || ""}
                                        onChange={(e) => handleChange("contact_email", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.contact_phone')}</label>
                                    <Input
                                        type="tel"
                                        value={settings.contact_phone || ""}
                                        onChange={(e) => handleChange("contact_phone", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.store_address')}</label>
                                    <textarea
                                        rows={2}
                                        value={settings.store_address || ""}
                                        onChange={(e) => handleChange("store_address", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-all text-sm resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Shipping Tab */}
                        {activeTab === "shipping" && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.default_shipping')}</label>
                                    <Input
                                        type="number"
                                        value={settings.default_shipping || ""}
                                        onChange={(e) => handleChange("default_shipping", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                        placeholder="50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.free_shipping_threshold')}</label>
                                    <Input
                                        type="number"
                                        value={settings.free_shipping_threshold || ""}
                                        onChange={(e) => handleChange("free_shipping_threshold", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                        placeholder="500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.delivery_time')}</label>
                                    <Input
                                        value={settings.delivery_time || ""}
                                        onChange={(e) => handleChange("delivery_time", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                        placeholder="2-5 business days"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Payment Tab */}
                        {activeTab === "payment" && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <label className="text-sm font-medium">{t('admin.settings.cod_enabled')}</label>
                                    <Switch
                                        checked={settings.cod_enabled === "true"}
                                        onCheckedChange={(checked) => handleChange("cod_enabled", checked ? "true" : "false")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.payment_instructions')}</label>
                                    <textarea
                                        rows={3}
                                        value={settings.payment_instructions || ""}
                                        onChange={(e) => handleChange("payment_instructions", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-all text-sm resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.payment_instructions_ar')}</label>
                                    <textarea
                                        rows={3}
                                        value={settings.payment_instructions_ar || ""}
                                        onChange={(e) => handleChange("payment_instructions_ar", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-all text-sm resize-none text-right"
                                        dir="rtl"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === "notifications" && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.admin_email')}</label>
                                    <Input
                                        type="email"
                                        value={settings.admin_email || ""}
                                        onChange={(e) => handleChange("admin_email", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <label className="text-sm font-medium">{t('admin.settings.order_notifications')}</label>
                                    <Switch
                                        checked={settings.order_notifications === "true"}
                                        onCheckedChange={(checked) => handleChange("order_notifications", checked ? "true" : "false")}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <label className="text-sm font-medium">{t('admin.settings.push_enabled')}</label>
                                    <Switch
                                        checked={settings.push_enabled === "true"}
                                        onCheckedChange={(checked) => handleChange("push_enabled", checked ? "true" : "false")}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Product Tab */}
                        {activeTab === "product" && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.currency')}</label>
                                    <Input
                                        value={settings.currency || ""}
                                        onChange={(e) => handleChange("currency", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                        placeholder="MAD"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.tax_rate')}</label>
                                    <Input
                                        type="number"
                                        value={settings.tax_rate || ""}
                                        onChange={(e) => handleChange("tax_rate", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.low_stock_threshold')}</label>
                                    <Input
                                        type="number"
                                        value={settings.low_stock_threshold || ""}
                                        onChange={(e) => handleChange("low_stock_threshold", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Marketing Tab */}
                        {activeTab === "marketing" && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.announcement_bar')}</label>
                                    <textarea
                                        rows={2}
                                        value={settings.announcement_bar || ""}
                                        onChange={(e) => handleChange("announcement_bar", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-all text-sm resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.announcement_bar_ar')}</label>
                                    <textarea
                                        rows={2}
                                        value={settings.announcement_bar_ar || ""}
                                        onChange={(e) => handleChange("announcement_bar_ar", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-all text-sm resize-none text-right"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.whatsapp_number')}</label>
                                    <Input
                                        type="tel"
                                        value={settings.whatsapp_number || ""}
                                        onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                        placeholder="+212XXXXXXXXX"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.promo_code')}</label>
                                    <Input
                                        value={settings.promo_code || ""}
                                        onChange={(e) => handleChange("promo_code", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                        placeholder="WELCOME20"
                                    />
                                </div>
                            </div>
                        )}

                        {/* System Tab */}
                        {activeTab === "system" && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.admin_pin')}</label>
                                    <Input
                                        type="password"
                                        value={settings.admin_pin || ""}
                                        onChange={(e) => handleChange("admin_pin", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                        placeholder="••••••"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <label className="text-sm font-medium">{t('admin.settings.maintenance_mode')}</label>
                                    <Switch
                                        checked={settings.maintenance_mode === "true"}
                                        onCheckedChange={(checked) => handleChange("maintenance_mode", checked ? "true" : "false")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('admin.settings.session_timeout')}</label>
                                    <Input
                                        type="number"
                                        value={settings.session_timeout || ""}
                                        onChange={(e) => handleChange("session_timeout", e.target.value)}
                                        className="rounded-xl bg-white/5 border-white/10"
                                        placeholder="30"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
