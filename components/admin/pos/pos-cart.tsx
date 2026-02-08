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
            <div className="p-6 md:p-10 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight">{t("admin.pos.current_cart")}</h2>
                        <p className="text-muted-foreground font-medium">{itemCount} {t("admin.pos.items_selected")}</p>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 space-y-4 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white/5 border border-white/10 rounded-[2rem] p-4 md:p-6 flex items-center gap-6 group active:bg-white/10 transition-colors"
                        >
                            {/* Product Image */}
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingCart className="w-10 h-10 text-white/10" />
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg md:text-xl truncate">{item.title}</h4>
                                {item.variant_name && (
                                    <p className="text-xs text-primary font-black uppercase tracking-widest mt-0.5">{item.variant_name}</p>
                                )}
                                <p className="text-primary font-bold text-lg mt-1">{item.price} <span className="text-xs font-normal text-muted-foreground uppercase opacity-60">MAD</span></p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
                                <button
                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                    className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all text-white"
                                >
                                    <Minus className="w-6 h-6" />
                                </button>
                                <span className="text-xl font-black w-8 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                    className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary hover:bg-primary/90 active:scale-90 text-primary-foreground flex items-center justify-center transition-all shadow-lg shadow-primary/20"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Remove Button */}
                            <Button
                                onClick={() => onRemove(item.id)}
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 md:h-16 md:w-16 text-destructive hover:bg-destructive/10 active:scale-90 rounded-2xl transition-all"
                            >
                                <Trash2 className="w-6 h-6" />
                            </Button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                        <ShoppingBag className="w-32 h-32 mb-6" />
                        <p className="text-2xl font-black uppercase tracking-widest">{t("admin.pos.empty_cart")}</p>
                    </div>
                )}
            </div>

            {/* Checkout Footer */}
            <div className="p-6 md:p-10 bg-white/5 border-t border-white/10 shrink-0 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-60">Order Total</p>
                        <p className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                            {total} <span className="text-lg font-bold text-primary opacity-80 italic">MAD</span>
                        </p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-muted-foreground opacity-60 uppercase">{t("admin.pos.items_selected")}</p>
                        <p className="text-xl font-bold">{itemCount} Items</p>
                    </div>
                </div>

                <Button
                    disabled={items.length === 0}
                    onClick={onCheckout}
                    className="w-full h-20 md:h-24 rounded-[2rem] bg-primary hover:bg-primary/90 active:scale-[0.98] text-2xl md:text-3xl font-black shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 transition-all group overflow-hidden"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"
                    />
                    <Printer className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />
                    <span>Print Receipt</span>
                </Button>
            </div>
        </div>
    )
}

