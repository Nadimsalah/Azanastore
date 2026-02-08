"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Printer } from "lucide-react"
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

    return (
        <div className="flex flex-col h-full glass-strong rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl">{t("admin.pos.current_cart")}</h2>
                        <p className="text-xs text-muted-foreground">{items.length} {t("admin.pos.items_selected")}</p>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8, x: 50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.5, x: -100 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="glass-light rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 group relative border border-white/5 hover:border-white/20 active:border-white/20 transition-colors"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-16 lg:h-16 rounded-xl bg-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 lg:w-6 lg:h-6 text-primary/20" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm md:text-base lg:text-sm truncate">{item.title}</h4>
                                {item.variant_name && (
                                    <p className="text-[10px] md:text-xs lg:text-[10px] text-primary font-bold uppercase tracking-wider">{item.variant_name}</p>
                                )}
                                <p className="text-xs md:text-sm lg:text-xs text-muted-foreground font-medium">{item.price} MAD</p>

                                <div className="flex items-center gap-2 md:gap-3 lg:gap-2 mt-2 md:mt-3 lg:mt-2">
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, -1)}
                                        className="w-8 h-8 md:w-11 md:h-11 lg:w-8 lg:h-8 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 flex items-center justify-center transition-colors touch-manipulation"
                                    >
                                        <Minus className="w-3 h-3 md:w-4 md:h-4 lg:w-3 lg:h-3" />
                                    </button>
                                    <span className="text-sm md:text-base lg:text-sm font-bold w-6 md:w-8 lg:w-6 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                        className="w-8 h-8 md:w-11 md:h-11 lg:w-8 lg:h-8 rounded-lg bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary flex items-center justify-center transition-colors touch-manipulation"
                                    >
                                        <Plus className="w-3 h-3 md:w-4 md:h-4 lg:w-3 lg:h-3" />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => onRemove(item.id)}
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 md:p-3 lg:p-2 text-destructive hover:bg-destructive/10 active:bg-destructive/20 rounded-xl transition-all touch-manipulation"
                            >
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-50">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-medium">{t("admin.pos.empty_cart")}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/5 border-t border-white/5 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                        <span className="font-medium">{total} MAD</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                        <span>{t("cart.total")}</span>
                        <span className="text-primary">{total} MAD</span>
                    </div>
                </div>

                <Button
                    disabled={items.length === 0}
                    onClick={onCheckout}
                    className="w-full h-14 md:h-16 lg:h-14 rounded-2xl bg-primary hover:bg-primary/90 active:bg-primary/80 text-lg md:text-xl lg:text-lg font-bold shadow-xl shadow-primary/20 group relative overflow-hidden touch-manipulation"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"
                    />
                    <Printer className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t("admin.pos.print_complete")}
                </Button>
            </div>
        </div>
    )
}

