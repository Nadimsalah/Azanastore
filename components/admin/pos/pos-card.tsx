"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Package, ShoppingCart, Sparkles } from "lucide-react"
import type { Product } from "@/lib/supabase-api"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

interface POSCardProps {
    product: Product
    gravityEnabled: boolean
    onAddToCart: (product: Product, event: React.MouseEvent) => void
}

export function POSCard({ product, gravityEnabled, onAddToCart }: POSCardProps) {
    const { t } = useLanguage()
    const cardRef = useRef<HTMLDivElement>(null)
    const [isTouchDevice, setIsTouchDevice] = useState(false)

    // Detect touch device
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }, [])

    // Spring physics for smooth movement (disabled on touch devices)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springX = useSpring(x, { stiffness: 100, damping: 30 })
    const springY = useSpring(y, { stiffness: 100, damping: 30 })

    const rotateX = useTransform(springY, [-100, 100], [10, -10])
    const rotateY = useTransform(springX, [-100, 100], [-10, 10])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        // Disable gravity effect on touch devices
        if (!gravityEnabled || !cardRef.current || isTouchDevice) return

        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        x.set(e.clientX - centerX)
        y.set(e.clientY - centerY)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: gravityEnabled && !isTouchDevice ? rotateX : 0,
                rotateY: gravityEnabled && !isTouchDevice ? rotateY : 0,
                transformStyle: "preserve-3d",
            }}
            className="glass-strong rounded-[2.5rem] p-4 md:p-5 lg:p-5 relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 active:shadow-2xl active:shadow-primary/10 border border-white/10"
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none" />

            {/* Product Image Placeholder/Icon */}
            <div className="relative h-40 md:h-52 lg:h-48 mb-3 md:mb-4 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-active:scale-110"
                    />
                ) : (
                    <Package className="w-12 h-12 text-primary/20 group-hover:scale-110 group-active:scale-110 transition-transform duration-500" />
                )}

                <div className="absolute top-3 right-3 rtl:left-3 rtl:right-auto">
                    <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
                        {product.category}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base md:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {product.title}
                    </h3>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                    {product.sku}
                </p>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">{t("admin.products.pricing")}</span>
                        <span className="text-lg md:text-xl font-bold text-foreground">
                            {product.price} <span className="text-xs font-normal opacity-50">MAD</span>
                        </span>
                    </div>

                    <Button
                        size="icon"
                        onClick={(e) => onAddToCart(product, e)}
                        className="rounded-2xl h-12 w-12 md:h-14 md:w-14 lg:h-12 lg:w-12 bg-primary hover:bg-primary/90 active:bg-primary/80 shadow-lg shadow-primary/20 transition-all active:scale-95 group/btn overflow-hidden relative touch-manipulation"
                    >
                        <motion.div
                            whileHover={!isTouchDevice ? { y: "-50%" } : {}}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="flex flex-col h-[200%] w-full absolute top-0 left-0"
                        >
                            <div className="h-1/2 w-full flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5 text-primary-foreground" />
                            </div>
                            <div className="h-1/2 w-full flex items-center justify-center">
                                <Sparkles className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5 text-primary-foreground" />
                            </div>
                        </motion.div>
                    </Button>
                </div>
            </div>

            {/* Float effect elements if gravity is on and not touch device */}
            {gravityEnabled && !isTouchDevice && (
                <div className="absolute -bottom-2 -right-2 rtl:-left-2 rtl:right-auto w-20 h-20 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </motion.div>
    )
}
