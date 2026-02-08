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
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 md:p-10 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-3 md:p-4 bg-primary/10 rounded-2xl text-primary">
                        <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black tracking-tight">{t("admin.pos.current_cart")}</h2>
                        <p className="text-muted-foreground text-xs md:text-base font-medium">{itemCount} {t("admin.pos.items_selected")}</p>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-4 md:px-10 py-4 md:py-6 space-y-3 md:space-y-4 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-3 md:p-6 flex items-center gap-4 md:gap-6 group active:bg-white/10 transition-colors"
                        >
                            {/* Product Image */}
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-white/10" />
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base md:text-xl truncate leading-tight">{item.title}</h4>
                                {item.variant_name && (
                                    <p className="text-[10px] md:text-xs text-primary font-black uppercase tracking-widest mt-0.5 md:mt-1 truncate opacity-80">{item.variant_name}</p>
                                )}
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-primary font-black text-base md:text-xl">{item.price}</span>
                                    <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase opacity-60">MAD</span>
                                </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 md:gap-4 bg-black/20 p-1.5 md:p-2 rounded-2xl border border-white/5">
                                <button
                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                    className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all text-white border border-white/5"
                                >
                                    <Minus className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                                <span className="text-lg md:text-xl font-black w-6 md:w-8 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                    className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-primary hover:bg-primary/90 active:scale-90 text-primary-foreground flex items-center justify-center transition-all shadow-lg shadow-primary/20"
                                >
                                    <Plus className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                            </div>

                            {/* Remove Button */}
                            <Button
                                onClick={() => onRemove(item.id)}
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 md:h-16 md:w-16 text-destructive/50 hover:text-destructive hover:bg-destructive/10 active:scale-90 rounded-2xl transition-all shrink-0"
                            >
                                <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                            </Button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                        <ShoppingBag className="w-20 h-20 md:w-32 md:h-32 mb-6" />
                        <p className="text-xl md:text-2xl font-black uppercase tracking-widest">{t("admin.pos.empty_cart")}</p>
                    </div>
                )}
            </div>

            {/* Checkout Footer */}
            <div className="p-4 md:p-10 bg-white/5 border-t border-white/10 shrink-0 space-y-4 md:space-y-6 pb-8 md:pb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] md:text-xs opacity-60">Order Total</p>
                        <p className="text-3xl md:text-5xl font-black tracking-tighter text-white">
                            {total} <span className="text-base md:text-lg font-bold text-primary opacity-80 italic">MAD</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] md:text-xs font-bold text-muted-foreground opacity-60 uppercase">{t("admin.pos.items_selected")}</p>
                        <p className="text-lg md:text-xl font-bold">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</p>
                    </div>
                </div>

                <Button
                    disabled={items.length === 0}
                    onClick={onCheckout}
                    className="w-full h-16 md:h-24 rounded-3xl bg-primary hover:bg-primary/90 active:scale-[0.98] text-xl md:text-3xl font-black shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 md:gap-4 transition-all group overflow-hidden"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"
                    />
                    <Printer className="w-6 h-6 md:w-10 md:h-10 animate-pulse" />
                    <span>Print Receipt</span>
                </Button>
            </div>
        </div>
    )
}

