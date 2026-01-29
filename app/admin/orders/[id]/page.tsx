"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getOrderById, updateOrderStatus, type Order, type OrderItem } from "@/lib/supabase-api"
import {
    ArrowLeft,
    Printer,
    MapPin,
    Phone,
    Mail,
    CreditCard,
    Package,
    CheckCircle2,
    Clock,
    Truck,
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.id as string

    const [order, setOrder] = useState<(Order & { order_items: OrderItem[] }) | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        async function loadOrder() {
            if (!orderId) return
            setLoading(true)
            const data = await getOrderById(orderId)
            setOrder(data)
            setLoading(false)
        }
        loadOrder()
    }, [orderId])

    const handlePrint = () => {
        window.print()
        toast.success("Printing Invoice...")
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!order) return
        setUpdating(true)
        const { error } = await updateOrderStatus(order.id, newStatus.toLowerCase())

        if (error) {
            toast.error("Failed to update status")
        } else {
            setOrder(prev => prev ? { ...prev, status: newStatus.toLowerCase() } : null)
            toast.success(`Order status updated to ${newStatus}`)
        }
        setUpdating(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Loading order details...</p>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Order not found</h2>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase()
        switch (s) {
            case "processing": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "delivered": return "bg-green-500/10 text-green-500 border-green-500/20"
            case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20"
            default: return "bg-secondary text-secondary-foreground"
        }
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden print:bg-white print:overflow-visible">
            {/* Background gradients */}
            <div className="fixed inset-0 pointer-events-none print:hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="print:hidden">
                <AdminSidebar />
            </div>

            <main className="lg:pl-72 lg:rtl:pl-0 lg:rtl:pr-72 p-4 sm:p-6 lg:p-8 min-h-screen relative z-10 print:pl-0 print:p-0 transition-all duration-300">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-4 z-40 glass-strong p-4 rounded-3xl border border-white/5 shadow-lg shadow-black/5 print:hidden">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-primary/10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                                {order.order_number}
                                <Badge variant="outline" className={`ml-2 border-primary/20 ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </Badge>
                            </h1>
                            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString('en-US')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-full h-9 bg-background/50 border-white/10 hover:bg-white/10" onClick={handlePrint}>
                            <Printer className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Print Invoice</span>
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print:block">
                    {/* Left Column: Order Details */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Items Card */}
                        <div className="glass-strong rounded-3xl p-6 print:hidden">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" /> Order Items
                            </h3>

                            <div className="space-y-4">
                                {order.order_items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="h-16 w-16 bg-muted rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                            {item.product_image ? (
                                                <Image
                                                    src={item.product_image}
                                                    alt={item.product_title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Package className="w-8 h-8 text-muted-foreground/20" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-foreground">{item.product_title}</h4>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity} × MAD {item.price.toLocaleString('en-US')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-foreground">MAD {item.subtotal.toLocaleString('en-US')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>MAD {order.subtotal.toLocaleString('en-US')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Shipping</span>
                                    <span>MAD {order.shipping_cost.toLocaleString('en-US')}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-foreground pt-4 border-t border-white/5">
                                    <span>Total</span>
                                    <span className="text-primary">MAD {order.total.toLocaleString('en-US')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Professional Invoice Layout (Print Only) - Ticket Style */}
                        <div className="hidden print:block bg-white text-black p-0 min-h-screen font-mono text-[10px]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                @media print {
                                    @page { size: 148mm 210mm; margin: 0; }
                                    body { margin: 0; padding: 0; width: 148mm; }
                                    .ticket-container { width: 100%; padding: 5mm; }
                                }
                            `}} />

                            <div className="ticket-container">
                                {/* Ticket Header */}
                                <div className="text-center border-b-2 border-dashed border-black pb-4 mb-4">
                                    <div className="w-16 h-16 relative mx-auto mb-2 grayscale">
                                        <Image
                                            src="/logo.webp"
                                            alt="Azana"
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    </div>
                                    <h1 className="text-xl font-black uppercase mb-1">AZANA BOUTIQUE</h1>
                                    <p className="text-[9px] uppercase">Boutique & Luxury Clothing</p>
                                    <p className="text-[9px]">Casablanca, Morocco</p>
                                    <p className="text-[9px]">contact@azana.com</p>
                                </div>

                                {/* Order Info */}
                                <div className="mb-4 text-center">
                                    <h2 className="text-lg font-black uppercase mb-1">REÇU DE COMMANDE</h2>
                                    <p className="font-bold text-sm">#{order.order_number}</p>
                                    <p className="text-[9px]">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>

                                {/* Customer Info */}
                                <div className="mb-4 border-b border-black pb-2">
                                    <p className="font-bold uppercase text-[9px] mb-1">CLIENT:</p>
                                    <p className="font-bold">{order.customer_name}</p>
                                    <p>{order.customer_phone}</p>
                                    <p>{order.address_line1}</p>
                                    <p>{order.city} - {order.governorate}</p>
                                </div>

                                {/* Items */}
                                <div className="mb-4">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-black text-[9px]">
                                                <th className="py-1 w-[50%]">PRODUIT</th>
                                                <th className="py-1 text-center">QTÉ</th>
                                                <th className="py-1 text-right">TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[10px]">
                                            {order.order_items.map((item, i) => (
                                                <tr key={i} className="border-b border-dotted border-gray-400">
                                                    <td className="py-2 pr-1">
                                                        <span className="font-bold block">{item.product_title}</span>
                                                        {item.variant_name && <span className="text-[9px] italic">{item.variant_name}</span>}
                                                    </td>
                                                    <td className="py-2 text-center align-top">{item.quantity}</td>
                                                    <td className="py-2 text-right font-bold align-top">{(item.subtotal || 0).toLocaleString('fr-FR')} MAD</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals */}
                                <div className="mb-6 space-y-1 text-right">
                                    <div className="flex justify-between">
                                        <span>Sous-total:</span>
                                        <span>{(order.subtotal || 0).toLocaleString('fr-FR')} MAD</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Livraison:</span>
                                        <span>{(order.shipping_cost || 0).toLocaleString('fr-FR')} MAD</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-black border-t-2 border-black pt-1 mt-1">
                                        <span>TOTAL:</span>
                                        <span>{(order.total || 0).toLocaleString('fr-FR')} MAD</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="text-center space-y-2 pt-4 border-t-2 border-dashed border-black text-[9px]">
                                    <p className="font-bold uppercase">MERCI DE VOTRE VISITE !</p>
                                    <p>Les retours sont acceptés sous 15 jours.</p>
                                    <div className="pt-2">
                                        <p>AZANA BOUTIQUE</p>
                                        <p>RC: 123456 | ICE: 000000000000</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Customer & Status */}
                    <div className="space-y-6 print:hidden">

                        {/* Status Card */}
                        <div className="glass-strong rounded-3xl p-6 border-l-4 border-primary">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Update Status</h3>
                            <div className="space-y-3">
                                {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                                    <button
                                        key={s}
                                        disabled={updating}
                                        onClick={() => handleStatusChange(s)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${order.status === s.toLowerCase()
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "hover:bg-white/5 text-foreground"
                                            } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <span className="font-medium">{s}</span>
                                        {order.status === s.toLowerCase() && <CheckCircle2 className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="glass-strong rounded-3xl p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Customer</h3>
                                    <p className="text-sm font-medium text-muted-foreground mt-1">{order.customer_name}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {order.customer_name.charAt(0)}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-white/5 rounded-lg text-primary">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Email</p>
                                        <p className="text-foreground font-medium truncate">{order.customer_email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-white/5 rounded-lg text-primary">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Phone</p>
                                        <p className="text-foreground font-medium">{order.customer_phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-white/5 rounded-lg text-primary">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Address</p>
                                        <p className="text-foreground font-medium leading-tight">
                                            {order.address_line1}, {order.city}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="glass-strong rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-foreground mb-4">Delivery Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Truck className="w-4 h-4 text-primary" />
                                    <div>
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Method</p>
                                        <p className="text-foreground font-medium">Standard Delivery</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <div>
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Destination</p>
                                        <p className="text-foreground font-medium">{order.city}, Morocco</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="glass-strong rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-foreground mb-4">Payment</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    <div>
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Method</p>
                                        <p className="text-foreground font-medium">Cash on Delivery (COD)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Badge variant="outline" className={`border-primary/20 ${order.status === "delivered" ? "text-primary bg-primary/5" : "text-yellow-500 bg-yellow-500/10"}`}>
                                        {order.status === "delivered" ? "Payment Collected" : "Payment Pending"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
