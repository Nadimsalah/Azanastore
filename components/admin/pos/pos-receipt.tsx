"use client"

import { type Order, type OrderItem } from "@/lib/supabase-api"
import { useLanguage } from "@/components/language-provider"

interface POSReceiptProps {
    order: Order & { order_items: OrderItem[] }
}

export function POSReceipt({ order }: POSReceiptProps) {
    const { t } = useLanguage()

    return (
        <div className="w-[300px] p-4 font-mono text-sm text-black bg-white mx-auto print:w-full print:p-0">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-1">Azana Store</h1>
                <p className="text-[10px] uppercase tracking-widest opacity-60">{t('admin.pos.store_city')}, {t('common.morocco')}</p>
                <p className="text-[10px] uppercase tracking-widest opacity-60">Tel: +212 5XX-XXXXXX</p>
            </div>

            <div className="border-t border-b border-black border-dashed py-3 mb-4 space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-bold">
                    <span>{t('admin.pos.receipt_no')}:</span>
                    <span>{order.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold">
                    <span>{t('admin.order.date')}:</span>
                    <span>{new Date(order.created_at || '').toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold">
                    <span>{t('admin.pos.type')}:</span>
                    <span>{t('admin.pos.pos_transaction')}</span>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[10px] font-black border-b border-black pb-1">
                    <span className="flex-1">{t('admin.order.product')}</span>
                    <span className="w-12 text-center">{t('admin.order.qty').toUpperCase()}</span>
                    <span className="w-20 text-right">{t('admin.order.price').toUpperCase()}</span>
                </div>
                {order.order_items.map((item) => (
                    <div key={item.id} className="space-y-0.5">
                        <div className="flex justify-between text-xs font-bold leading-tight">
                            <span className="flex-1 uppercase">{item.product_title}</span>
                            <span className="w-12 text-center">x{item.quantity}</span>
                            <span className="w-20 text-right">{item.subtotal}</span>
                        </div>
                        {item.variant_name && (
                            <p className="text-[10px] opacity-60 uppercase">{item.variant_name}</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="border-t border-black border-dashed pt-4 space-y-2">
                <div className="flex justify-between font-black text-lg">
                    <span>{t('admin.order.total').toUpperCase()}:</span>
                    <span>{order.total} {t('common.currency')}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                    <span>{t('admin.pos.tax')} (0%):</span>
                    <span>0.00 {t('common.currency')}</span>
                </div>
            </div>

            <div className="mt-8 text-center space-y-2">
                <div className="w-full h-12 bg-black/5 flex items-center justify-center rounded-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">{t('admin.order.thanks')}</p>
                </div>
                <p className="text-[8px] uppercase tracking-widest opacity-40">{t('admin.order.returns_policy')}</p>
                <div className="pt-4 flex justify-center">
                    {/* Placeholder for barcode font/image if needed */}
                    <div className="h-4 w-48 bg-black/10" />
                </div>
            </div>
        </div>
    )
}
