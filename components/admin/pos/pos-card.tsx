"use client"

import { motion } from "framer-motion"
import { Package, Plus } from "lucide-react"
import type { Product } from "@/lib/supabase-api"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

interface POSCardProps {
    product: Product
    gravityEnabled?: boolean
    onAddToCart: (product: Product) => void
}

export function POSCard({ product, onAddToCart }: POSCardProps) {
    const { t } = useLanguage()

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.97 }}
            className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-primary/5 active:scale-95"
        >
            {/* Image Section */}
            <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Package className="w-16 h-16" />
                    </div>
                )}

                {/* Product Info Overlay (Optional, keeping it clean) */}
                <div className="absolute top-4 right-4">
                    <div className="px-3 py-1.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                        {product.category}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 md:p-6 space-y-3">
                <div>
                    <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {product.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono mt-1 opacity-60">
                        {product.sku || "NO SKU"}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                            {t("admin.products.pricing")}
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl md:text-2xl font-black text-foreground">
                                {product.price}
                            </span>
                            <span className="text-xs font-bold text-primary">MAD</span>
                        </div>
                    </div>

                    <Button
                        onClick={(e) => {
                            e.stopPropagation()
                            onAddToCart(product)
                        }}
                        className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-primary hover:bg-primary/90 active:scale-90 shadow-xl shadow-primary/20 transition-all flex items-center justify-center group/btn"
                    >
                        <Plus className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground group-hover/btn:rotate-90 transition-transform duration-300" />
                    </Button>
                </div>
            </div>

            {/* Tap Feedback Overlay */}
            <div className="absolute inset-0 bg-primary/0 active:bg-primary/5 transition-colors pointer-events-none" />
        </motion.div>
    )
}
