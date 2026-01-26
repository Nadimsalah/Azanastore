"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Save,
    Globe,
    Lock,
    Store,
    Bell,
    Mail,
    Shield,
    Smartphone,
    Eye,
    EyeOff,
    Upload,
    Image as ImageIcon,
    Settings
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { getAdminSettings, updateAdminSettings } from "@/lib/supabase-api"
import { toast } from "sonner"

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general")
    const [showPin, setShowPin] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loading, setLoading] = useState(true)

    // Settings state
    const [storeName, setStoreName] = useState("")
    const [supportEmail, setSupportEmail] = useState("")
    const [currency, setCurrency] = useState("EGP")
    const [adminPin, setAdminPin] = useState("")
    const [newPin, setNewPin] = useState("")
    const [confirmPin, setConfirmPin] = useState("")

    useEffect(() => {
        async function loadSettings() {
            setLoading(true)
            const settings = await getAdminSettings()
            setStoreName(settings.store_name || "")
            setSupportEmail(settings.support_email || "")
            setCurrency(settings.currency || "EGP")
            setAdminPin(settings.admin_pin || "")
            setLoading(false)
        }
        loadSettings()
    }, [])

    const handleSave = async () => {
        setIsLoading(true)

        const updates: Record<string, string> = {
            store_name: storeName,
            support_email: supportEmail,
            currency: currency,
        }

        // Only update PIN if new one is provided
        if (newPin && newPin === confirmPin) {
            updates.admin_pin = newPin
            setAdminPin(newPin)
            setNewPin("")
            setConfirmPin("")
        } else if (newPin && newPin !== confirmPin) {
            toast.error("PINs do not match!")
            setIsLoading(false)
            return
        }

        const result = await updateAdminSettings(updates)

        if (result.success) {
            toast.success("Settings saved successfully!")
        } else {
            toast.error("Failed to save settings")
        }

        setIsLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <AdminSidebar />

            <main className="lg:pl-72 p-4 sm:p-6 lg:p-8 min-h-screen relative z-10">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-4 z-40 glass-strong p-4 rounded-3xl border border-white/5 shadow-lg shadow-black/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Settings className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Settings</h1>
                            <p className="text-xs text-muted-foreground">Manage your store configuration</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="rounded-full px-6 shadow-lg shadow-primary/20"
                        >
                            {isLoading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1 space-y-2">
                        {[
                            { id: 'general', label: 'General', icon: Store },
                            { id: 'security', label: 'Security & Login', icon: Shield },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                    ? 'glass-strong text-primary shadow-sm border border-white/10'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">

                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Store Details */}
                                <section className="glass-strong rounded-3xl border border-white/5 shadow-sm p-6 space-y-6">
                                    <h3 className="text-lg font-bold text-foreground border-b border-white/5 pb-4">Store Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">Store Name</label>
                                            <Input
                                                value={storeName}
                                                onChange={(e) => setStoreName(e.target.value)}
                                                className="bg-white/5 border-white/10 focus:bg-white/10 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">Support Email</label>
                                            <Input
                                                type="email"
                                                value={supportEmail}
                                                onChange={(e) => setSupportEmail(e.target.value)}
                                                className="bg-white/5 border-white/10 focus:bg-white/10 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">Currency</label>
                                            <Input
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                                className="bg-white/5 border-white/10 focus:bg-white/10 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Security Settings */}
                                <section className="glass-strong rounded-3xl border border-white/5 shadow-sm p-6 space-y-6">
                                    <h3 className="text-lg font-bold text-foreground border-b border-white/5 pb-4">Admin PIN</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">Current PIN</label>
                                            <div className="relative">
                                                <Input
                                                    type={showPin ? "text" : "password"}
                                                    value={adminPin}
                                                    disabled
                                                    className="bg-white/5 border-white/10 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPin(!showPin)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">New PIN</label>
                                            <Input
                                                type="password"
                                                value={newPin}
                                                onChange={(e) => setNewPin(e.target.value)}
                                                placeholder="Enter new 6-digit PIN"
                                                maxLength={6}
                                                className="bg-white/5 border-white/10 focus:bg-white/10 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">Confirm New PIN</label>
                                            <Input
                                                type="password"
                                                value={confirmPin}
                                                onChange={(e) => setConfirmPin(e.target.value)}
                                                placeholder="Confirm new PIN"
                                                maxLength={6}
                                                className="bg-white/5 border-white/10 focus:bg-white/10 transition-colors"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Leave blank to keep current PIN. Changes take effect immediately after saving.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
