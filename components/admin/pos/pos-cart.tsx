"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Printer, ShoppingBag } from "lucide-react"
import { type Product, type CartItem } from "@/lib/supabase-api"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

interface POSCartProps {
    items: CartItem[]
    onUpdateQuantity: (id: string, delta: number) => void
    onRemove: (id: string) => void
    onCheckout: () => void
}

export function POSCart({ items, onUpdateQuantity, onRemove, onCheckout }: POSCartProps) {
    const { t } = useLanguage()
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-10 border-b border-gray-100 shrink-0 bg-gray-50/50">
                <div className="flex items-center gap-4 md:gap-5">
                    <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary">
                        <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight uppercase tracking-widest">{t("admin.pos.current_cart")}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">{itemCount} {t("admin.pos.items_selected")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8 space-y-4 md:space-y-6 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-3 md:p-6 flex items-center gap-4 md:gap-8 group relative overflow-hidden hover:bg-white hover:shadow-md transition-all"
                        >
                            {/* Product Image */}
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-gray-200" />
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base md:text-xl text-gray-900 truncate leading-tight uppercase tracking-wide">{item.title}</h4>
                                {item.variant_name && (
                                    <p className="text-[10px] md:text-xs text-primary font-black uppercase tracking-[0.2em] mt-1 opacity-80">{item.variant_name}</p>
                                )}
                                <div className="flex items-baseline gap-1 mt-1.5">
                                    <span className="text-primary font-black text-base md:text-2xl tracking-tighter">{item.price}</span>
                                    <span className="text-[10px] md:text-xs font-bold text-gray-300 italic uppercase tracking-widest font-mono text-xs">MAD</span>
                                </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 md:gap-5 bg-white p-1.5 md:p-2.5 rounded-[1.5rem] border border-gray-100 shadow-sm">
                                <button
                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-90 flex items-center justify-center transition-all text-gray-400 hover:text-gray-900"
                                >
                                    <Minus className="w-4 h-4 md:w-6 md:h-6" />
                                </button>
                                <span className="text-lg md:text-xl font-black text-gray-900 w-6 md:w-8 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-primary hover:bg-primary/90 active:scale-90 text-primary-foreground flex items-center justify-center transition-all shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)]"
                                >
                                    <Plus className="w-4 h-4 md:w-6 md:h-6" />
                                </button>
                            </div>

                            {/* Remove Button */}
                            <Button
                                onClick={() => onRemove(item.id)}
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 md:h-14 md:w-14 text-gray-300 hover:text-destructive hover:bg-red-50 active:scale-90 rounded-2xl transition-all shrink-0"
                            >
                                <Trash2 className="w-4 h-4 md:w-6 md:h-6" />
                            </Button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                        <ShoppingBag className="w-20 h-20 md:w-32 md:h-32 mb-6" />
                        <p className="text-xl md:text-2xl font-black uppercase tracking-[0.3em] text-gray-400">{t("admin.pos.empty_cart")}</p>
                    </div>
                )}
            </div>

            {/* Checkout Footer */}
            <div className="p-6 md:p-12 bg-gray-50/50 border-t border-gray-100 shrink-0 space-y-6 md:space-y-8 pb-10 md:pb-14">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">Order Summary</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <p className="text-4xl md:text-7xl font-black tracking-tighter text-gray-900">
                                {total}
                            </p>
                            <span className="text-lg md:text-2xl font-bold text-primary italic lowercase tracking-tight">mad</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{t("admin.pos.items_selected")}</p>
                        <p className="text-xl md:text-3xl font-black text-gray-900">{itemCount}</p>
                    </div>
                </div>

                <Button
                    disabled={items.length === 0}
                    onClick={onCheckout}
                    className="w-full h-18 md:h-28 rounded-[2rem] bg-primary hover:bg-primary/90 active:scale-[0.98] text-xl md:text-3xl font-black text-primary-foreground shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center gap-4 md:gap-6 transition-all group relative overflow-hidden border border-white/20"
                >
                    <Printer className="w-7 h-7 md:w-12 md:h-12" />
                    <span className="uppercase tracking-[0.1em]">Complete Transaction</span>
                </Button>
            </div>
        </div>
    )
}

