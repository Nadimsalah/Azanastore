"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Trash2, Plus, Minus, X, ShoppingBag, Printer, Package, FileText } from "lucide-react"
import { generatePOSTicketPDF } from "@/lib/pos-ticket-generator"
import { type CartItem } from "@/lib/supabase-api"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

interface ZenCartProps {
    isOpen: boolean
    onClose: () => void
    items: CartItem[]
    onUpdateQuantity: (id: string, delta: number) => void
    onRemove: (id: string) => void
    onCheckout: () => void
}

export function ZenCart({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }: ZenCartProps) {
    const { t } = useLanguage()
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:backdrop-blur-none"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[60] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest leading-none mb-1">
                                        {t('admin.pos.cart_title')}
                                    </h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{itemCount} {t('admin.pos.items_selected')}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12" onClick={onClose}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <ShoppingCart className="w-16 h-16 mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">{t('admin.pos.empty_cart')}</p>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-gray-50/50 rounded-2xl p-4 flex gap-4 group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-full h-full p-4 text-gray-200" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[13px] font-bold text-gray-900 truncate uppercase tracking-tight">{item.title}</h4>
                                            {item.variant_name && <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">{item.variant_name}</p>}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-lg font-black text-gray-900 tabular-nums">{item.price}</span>
                                                    <span className="text-[9px] font-bold text-primary italic uppercase leading-none">{t('common.currency')}</span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-1">
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.id, -1)}
                                                        className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                                        className="w-7 h-7 rounded-lg bg-primary/5 hover:bg-primary/10 flex items-center justify-center text-primary transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-300 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-gray-50 bg-gray-50/30 space-y-6">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('admin.pos.grand_total')}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-gray-900 tracking-tighter">{total}</span>
                                        <span className="text-sm font-bold text-primary italic uppercase leading-none mb-1">{t('common.currency')}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('admin.pos.items')}</p>
                                    <p className="text-2xl font-black text-gray-900 leading-none">{itemCount}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    disabled={items.length === 0}
                                    onClick={onCheckout}
                                    className="flex-1 h-16 rounded-2xl bg-gray-900 hover:bg-black text-white text-md font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                                >
                                    <span>{t('admin.pos.print_complete')}</span>
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}



