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
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 md:p-10 border-b border-white/5 shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-4 md:gap-5">
                    <div className="p-4 bg-primary/20 rounded-[1.5rem] text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
                        <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase tracking-widest">{t("admin.pos.current_cart")}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            <p className="text-white/40 text-xs md:text-sm font-bold uppercase tracking-widest">{itemCount} {t("admin.pos.items_selected")}</p>
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
                            className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-3 md:p-6 flex items-center gap-4 md:gap-8 group relative overflow-hidden hover:bg-white/[0.06] transition-all"
                        >
                            {/* Product Image */}
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-white/10" />
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base md:text-xl text-white truncate leading-tight uppercase tracking-wide">{item.title}</h4>
                                {item.variant_name && (
                                    <p className="text-[10px] md:text-xs text-primary font-black uppercase tracking-[0.2em] mt-1 opacity-80">{item.variant_name}</p>
                                )}
                                <div className="flex items-baseline gap-1 mt-1.5">
                                    <span className="text-primary font-black text-base md:text-2xl tracking-tighter">{item.price}</span>
                                    <span className="text-[10px] md:text-xs font-bold text-white/20 italic uppercase tracking-widest font-mono">MAD</span>
                                </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 md:gap-5 bg-black/40 p-1.5 md:p-2.5 rounded-[1.5rem] border border-white/5">
                                <button
                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all text-white/50 hover:text-white border border-white/5"
                                >
                                    <Minus className="w-4 h-4 md:w-6 md:h-6" />
                                </button>
                                <span className="text-lg md:text-xl font-black text-white w-6 md:w-8 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-primary hover:bg-primary/90 active:scale-90 text-primary-foreground flex items-center justify-center transition-all shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)] border border-white/10"
                                >
                                    <Plus className="w-4 h-4 md:w-6 md:h-6" />
                                </button>
                            </div>

                            {/* Remove Button */}
                            <Button
                                onClick={() => onRemove(item.id)}
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 md:h-14 md:w-14 text-white/20 hover:text-destructive hover:bg-destructive/10 active:scale-90 rounded-2xl transition-all shrink-0 border border-white/5"
                            >
                                <Trash2 className="w-4 h-4 md:w-6 md:h-6" />
                            </Button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-20 opacity-10">
                        <ShoppingBag className="w-20 h-20 md:w-32 md:h-32 mb-6" />
                        <p className="text-xl md:text-2xl font-black uppercase tracking-[0.3em]">{t("admin.pos.empty_cart")}</p>
                    </div>
                )}
            </div>

            {/* Checkout Footer */}
            <div className="p-6 md:p-12 bg-white/[0.02] border-t border-white/5 shrink-0 space-y-6 md:space-y-8 pb-10 md:pb-14">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">Order Summary</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <p className="text-4xl md:text-7xl font-black tracking-tighter text-white">
                                {total}
                            </p>
                            <span className="text-lg md:text-2xl font-bold text-primary italic lowercase tracking-tight">mad</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] md:text-xs font-bold text-white/30 uppercase tracking-widest">{t("admin.pos.items_selected")}</p>
                        <p className="text-xl md:text-3xl font-black text-white">{itemCount}</p>
                    </div>
                </div>

                <Button
                    disabled={items.length === 0}
                    onClick={onCheckout}
                    className="w-full h-18 md:h-28 rounded-[2rem] bg-primary hover:bg-primary/90 active:scale-[0.98] text-xl md:text-3xl font-black text-primary-foreground shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center gap-4 md:gap-6 transition-all group relative overflow-hidden border border-white/20"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"
                    />
                    <Printer className="w-7 h-7 md:w-12 md:h-12" />
                    <span className="uppercase tracking-[0.1em]">Complete Transaction</span>
                </Button>
            </div>
        </div>
    )
}

