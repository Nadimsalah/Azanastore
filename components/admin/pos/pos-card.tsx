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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -4 }}
            className="group relative bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] active:scale-[0.98]"
        >
            {/* Image Section */}
            <div className="aspect-[4/5] relative overflow-hidden bg-gray-50/50">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                        <Package className="w-16 h-16" />
                    </div>
                )}

                {/* Category Tag */}
                <div className="absolute top-4 left-4">
                    <div className="px-3 py-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-100 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
                        {product.category}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col gap-4">
                <div className="space-y-1">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {product.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono tracking-wider">
                        {product.sku || "NO SKU"}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-80">
                            {t("admin.products.pricing")}
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter">
                                {product.price}
                            </span>
                            <span className="text-[10px] font-bold text-primary italic">MAD</span>
                        </div>
                    </div>

                    <Button
                        onClick={(e) => {
                            e.stopPropagation()
                            onAddToCart(product)
                        }}
                        className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary hover:bg-primary/90 active:scale-90 shadow-[0_10px_20px_rgba(var(--primary-rgb),0.15)] transition-all flex items-center justify-center group/btn border border-white/20"
                    >
                        <Plus className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground group-hover/btn:rotate-90 transition-transform duration-500" />
                    </Button>
                </div>
            </div>

            {/* Tap Feedback Overlay */}
            <div className="absolute inset-0 bg-primary/0 group-active:bg-primary/[0.02] transition-colors pointer-events-none" />
        </motion.div>
    )
}
