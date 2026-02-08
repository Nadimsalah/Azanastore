"use client"

import React from "react"
import Image from "next/image"
import type { Order, OrderItem } from "@/lib/supabase-api"

interface POSReceiptProps {
    order: (Order & { order_items: OrderItem[] }) | null
}

export function POSReceipt({ order }: POSReceiptProps) {
    if (!order) return null

    return (
        <div className="hidden print:block bg-white text-black p-0 min-h-screen font-mono text-[10px] w-full max-w-[80mm] mx-auto" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        size: 80mm auto; 
                        margin: 0; 
                    }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        width: 80mm; 
                    }
                    .receipt-container { 
                        width: 80mm; 
                        padding: 4mm; 
                        box-sizing: border-box;
                    }
                    /* Ensure thermal printers don't cut off content */
                    .spacer { height: 10mm; }
                }
            `}} />

            <div className="receipt-container">
                {/* Header */}
                <div className="text-center border-b border-dashed border-black pb-3 mb-3">
                    <div className="w-12 h-12 relative mx-auto mb-1 grayscale">
                        <Image
                            src="/logo.webp"
                            alt="Azana"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-sm font-black uppercase mb-0.5">AZANA BOUTIQUE</h1>
                    <p className="text-[8px] uppercase font-bold">Luxury & Boutique</p>
                    <p className="text-[8px]">Casablanca, Morocco</p>
                    <p className="text-[8px]">Tél: +212 5XX-XXXXXX</p>
                </div>

                {/* Info Section */}
                <div className="mb-3 text-center border-b border-dotted border-black pb-2">
                    <h2 className="text-[10px] font-black uppercase mb-0.5">TICKET DE CAISSE</h2>
                    <p className="font-bold text-[9px]">#{order.order_number}</p>
                    <p className="text-[8px]">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                {/* Items Table */}
                <div className="mb-3">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-black text-[8px]">
                                <th className="py-1 w-[60%]">ARTICLE</th>
                                <th className="py-1 text-center">QTÉ</th>
                                <th className="py-1 text-right">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody className="text-[9px]">
                            {order.order_items.map((item, i) => (
                                <tr key={i} className="border-b border-dotted border-gray-300">
                                    <td className="py-1.5 pr-1">
                                        <span className="font-bold block leading-tight">{item.product_title}</span>
                                        {item.variant_name && <span className="text-[7px] italic">{item.variant_name}</span>}
                                    </td>
                                    <td className="py-1.5 text-center align-top">{item.quantity}</td>
                                    <td className="py-1.5 text-right font-bold align-top">{(item.subtotal || 0).toLocaleString('fr-FR')} MAD</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mb-4 space-y-0.5 text-right border-t border-black pt-2">
                    <div className="flex justify-between text-[8px]">
                        <span>Sous-total:</span>
                        <span>{(order.subtotal || 0).toLocaleString('fr-FR')} MAD</span>
                    </div>
                    {order.shipping_cost > 0 && (
                        <div className="flex justify-between text-[8px]">
                            <span>Livraison:</span>
                            <span>{(order.shipping_cost || 0).toLocaleString('fr-FR')} MAD</span>
                        </div>
                    )}
                    <div className="flex justify-between text-[11px] font-black border-t-2 border-black pt-1 mt-1">
                        <span>TOTAL À PAYER:</span>
                        <span>{(order.total || 0).toLocaleString('fr-FR')} MAD</span>
                    </div>
                </div>

                {/* Payment & Footer */}
                <div className="text-center space-y-1.5 pt-3 border-t border-dashed border-black">
                    <p className="text-[8px] font-bold uppercase">Mode de paiement: Cash</p>
                    <p className="text-[9px] font-black uppercase">MERCI DE VOTRE VISITE !</p>
                    <p className="text-[7px]">Suivez-nous sur Instagram @azana.boutique</p>
                    <div className="spacer" />
                </div>
            </div>
        </div>
    )
}
