"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    Image as ImageIcon,
    MessageCircle,
    Phone,
    Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"

export function AdminSidebar() {
    const pathname = usePathname()
    const { t, language } = useLanguage()

    const menuItems = [
        { icon: LayoutDashboard, label: t('admin.nav.dashboard'), href: "/admin/dashboard" },
        { icon: ShoppingBag, label: t('admin.nav.orders'), href: "/admin/orders" },
        { icon: Package, label: t('admin.nav.products'), href: "/admin/products" },
        { icon: Users, label: t('admin.nav.customers'), href: "/admin/customers" },
        { icon: BarChart3, label: t('admin.nav.analytics'), href: "/admin/analytics" },
        { icon: ImageIcon, label: t('admin.nav.carousel'), href: "/admin/hero-carousel" },
        // CRM / Marketing
        { icon: MessageCircle, label: t('admin.nav.whatsapp'), href: "/admin/whatsapp" },
        { icon: Phone, label: t('admin.nav.contacts'), href: "/admin/contacts" },
        { icon: Briefcase, label: t('admin.nav.careers'), href: "/admin/careers" },
        { icon: Settings, label: t('admin.nav.settings'), href: "/admin/settings" },
    ]

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-xl border-r border-white/10 rtl:border-r-0 rtl:border-l">
            <div className="p-6 flex items-center justify-center border-b border-white/10">
                <Image
                    src="/logo.webp"
                    alt="Azana boutique logo"
                    width={120}
                    height={60}
                    className="h-10 w-auto"
                />
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? "default" : "ghost"}
                                className={`w-full justify-start gap-3 h-12 rounded-xl transition-all ${isActive
                                    ? "shadow-lg shadow-primary/20 bg-primary text-primary-foreground"
                                    : "hover:bg-primary/5 hover:text-primary"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Button>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <Link href="/admin/login">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">{t('admin.nav.logout')}</span>
                    </Button>
                </Link>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 rtl:left-auto rtl:right-4 z-50 rounded-full glass-strong">
                        <Menu className="w-6 h-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side={language === 'ar' ? 'right' : 'left'} className="p-0 w-80 border-r border-white/10 rtl:border-l rtl:border-r-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    )
}

