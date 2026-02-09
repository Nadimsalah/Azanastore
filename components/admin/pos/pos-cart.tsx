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
            {/* Soft Ambient Blobs for Dash Aesthetic */}
            <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="p-6 md:p-10 border-b border-white/20 shrink-0 glass-strong relative z-10">
                <div className="flex items-center gap-5 md:gap-7">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:blur-2xl transition-all duration-700" />
                        <div className="p-4 md:p-5 bg-white shadow-xl rounded-3xl text-primary relative z-10 border border-white">
                            <ShoppingBag className="w-6 h-6 md:w-9 md:h-9" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight uppercase tracking-widest leading-none mb-2">
                            {t("admin.pos.current_cart")}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                <p className="text-primary text-[10px] md:text-xs font-black uppercase tracking-widest">
                                    {itemCount} {t("admin.pos.items_selected")}
                                </p>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-4 md:px-10 py-8 md:py-10 space-y-5 md:space-y-8 custom-scrollbar relative z-10">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-subtle border border-white/40 rounded-[2.5rem] p-4 md:p-7 flex items-center gap-5 md:gap-10 group relative transition-all hover:bg-white/90 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.99]"
                        >
                            {/* Product Image Stage */}
                            <div className="relative shrink-0">
                                <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-20 h-20 md:w-32 md:h-32 rounded-[2rem] bg-white border border-gray-100 flex items-center justify-center overflow-hidden relative z-10 shadow-sm group-hover:shadow-lg transition-all duration-500">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <ShoppingCart className="w-10 h-10 md:w-14 md:h-14 text-gray-200" />
                                    )}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-lg md:text-2xl text-foreground truncate leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">
                                    {item.title}
                                </h4>
                                {item.variant_name && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-1 w-1 bg-primary rounded-full" />
                                        <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">
                                            {item.variant_name}
                                        </p>
                                    </div>
                                )}
                                <div className="flex items-baseline gap-1 mt-3">
                                    <span className="text-foreground font-black text-xl md:text-3xl tracking-tighter">
                                        {item.price}
                                    </span>
                                    <span className="text-[10px] md:text-sm font-bold text-muted-foreground/40 italic uppercase tracking-widest font-mono">
                                        MAD
                                    </span>
                                </div>
                            </div>

                            {/* Controls Wrapper */}
                            <div className="flex items-center gap-3 md:gap-6">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-3 md:gap-6 bg-white/50 border border-white/60 p-2 md:p-3 rounded-[2rem] shadow-sm backdrop-blur-sm group-hover:bg-white transition-colors">
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, -1)}
                                        className="w-10 h-10 md:w-16 md:h-16 rounded-2xl bg-gray-50/50 hover:bg-red-50 hover:text-red-500 active:scale-90 flex items-center justify-center transition-all text-muted-foreground"
                                    >
                                        <Minus className="w-4 h-4 md:w-7 md:h-7" />
                                    </button>
                                    <span className="text-xl md:text-3xl font-black text-foreground w-6 md:w-10 text-center tracking-tighter">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                        className="w-10 h-10 md:w-16 md:h-16 rounded-2xl bg-primary hover:bg-primary/90 active:scale-90 text-primary-foreground flex items-center justify-center transition-all shadow-lg shadow-primary/20"
                                    >
                                        <Plus className="w-4 h-4 md:w-7 md:h-7" />
                                    </button>
                                </div>

                                {/* Remove Button */}
                                <Button
                                    onClick={() => onRemove(item.id)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 md:h-16 md:w-16 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 active:scale-90 rounded-2xl transition-all shrink-0"
                                >
                                    <Trash2 className="w-5 h-5 md:w-8 md:h-8" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-32 relative">
                        <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                        <div className="p-10 bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-2xl relative z-10">
                            <ShoppingBag className="w-24 h-24 md:w-40 md:h-40 mb-8 text-primary/10" />
                            <p className="text-xl md:text-3xl font-black uppercase tracking-[0.4em] text-muted-foreground/40 text-center">
                                {t("admin.pos.empty_cart")}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Checkout Footer */}
            <div className="p-8 md:p-14 glass-strong border-t border-white/20 shrink-0 space-y-8 md:space-y-10 relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
                <div className="flex items-end justify-between px-4">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-4 w-1 bg-primary rounded-full" />
                            <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-sm">
                                Grand Total
                            </p>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <p className="text-5xl md:text-9xl font-black tracking-tighter text-foreground leading-none">
                                {total}
                            </p>
                            <span className="text-xl md:text-4xl font-bold text-primary italic lowercase tracking-tight leading-none mb-2 md:mb-4">mad</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-50">
                            {t("admin.pos.items_selected")}
                        </p>
                        <p className="text-2xl md:text-5xl font-black text-foreground tracking-tighter">
                            {itemCount}
                        </p>
                    </div>
                </div>

                <Button
                    disabled={items.length === 0}
                    onClick={onCheckout}
                    className="w-full h-20 md:h-36 rounded-[2.5rem] bg-gradient-to-r from-primary to-purple-600 hover:scale-[1.01] active:scale-[0.98] text-2xl md:text-5xl font-black text-white shadow-[0_30px_60px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center gap-5 md:gap-10 transition-all group relative overflow-hidden border-t border-white/30"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Printer className="w-8 h-8 md:w-16 md:h-16 group-hover:rotate-12 transition-transform" />
                    <span className="uppercase tracking-[0.1em]">{t("admin.pos.checkout") || "Complete Transaction"}</span>
                </Button>
            </div>
        </div>
    )
}

