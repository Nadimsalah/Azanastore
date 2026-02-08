"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Sparkles } from "lucide-react"
import { createProductVariant, type Product } from "@/lib/supabase-api"
import { toast } from "sonner"
import { generateSKU } from "@/lib/sku-utils"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/components/language-provider"

interface AddVariantDialogProps {
    product: Product | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (variantData?: any) => void
}

export function AddVariantDialog({ product, open, onOpenChange, onSuccess }: AddVariantDialogProps) {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [size, setSize] = useState("")
    const [color, setColor] = useState("")
    const [price, setPrice] = useState(product?.price?.toString() || "")
    const [stock, setStock] = useState("0")
    const [sku, setSku] = useState("")
    const [shouldPrint, setShouldPrint] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!product) return

        if (!size && !color) {
            toast.error(t("admin.inventory.dialog.validation_error"))
            return
        }

        setLoading(true)
        const variantSku = sku || generateSKU(product.category, product.title, color, size)

        const result = await createProductVariant({
            product_id: product.id,
            name: `${size} ${color}`.trim(),
            size: size || null,
            color: color || null,
            price: parseFloat(price) || product.price,
            stock: parseInt(stock) || 0,
            sku: variantSku
        })

        if (result.success) {
            toast.success(t("admin.inventory.toast_stock_updated"))
            onSuccess(shouldPrint ? {
                title: product.title,
                sku: variantSku,
                size: size || null,
                color: color || null,
                price: parseFloat(price) || product.price
            } : undefined)
            onOpenChange(false)
            // Reset form
            setSize("")
            setColor("")
            setPrice(product.price.toString())
            setStock("0")
            setSku("")
        } else {
            toast.error(t("admin.inventory.toast_stock_failed") + ": " + result.error)
        }
        setLoading(false)
    }

    const autoGenerateSku = () => {
        if (!product) return
        const generated = generateSKU(product.category, product.title, color, size)
        setSku(generated)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-strong border-white/10 rounded-[2rem] max-w-md w-full p-8 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-foreground">{t("admin.inventory.dialog.add_title")}</DialogTitle>
                    <DialogDescription className="text-xs uppercase font-bold tracking-widest opacity-60">
                        {product?.title}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">{t("admin.inventory.dialog.size")}</Label>
                            <Input
                                placeholder="ex: XL"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                className="bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">{t("admin.inventory.dialog.color")}</Label>
                            <Input
                                placeholder="ex: Noir"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">{t("admin.inventory.dialog.price")}</Label>
                            <Input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">{t("admin.inventory.dialog.stock")}</Label>
                            <Input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex justify-between">
                            SKU
                            <button type="button" onClick={autoGenerateSku} className="text-primary hover:underline flex items-center gap-1 font-black">
                                <Sparkles className="w-3 h-3" /> Auto
                            </button>
                        </Label>
                        <Input
                            placeholder={t("admin.inventory.dialog.sku_auto")}
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            className="bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary/20 font-mono uppercase"
                        />
                        {product && (size || color) && !sku && (
                            <p className="text-[10px] text-primary/60 font-mono mt-1 px-1">
                                Preview: {generateSKU(product.category, product.title, color, size)}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="space-y-0.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary">{t("admin.inventory.dialog.print_label")}</Label>
                            <p className="text-[9px] text-muted-foreground font-bold">{t("admin.inventory.dialog.print_desc")}</p>
                        </div>
                        <Switch
                            checked={shouldPrint}
                            onCheckedChange={setShouldPrint}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("admin.inventory.dialog.submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
