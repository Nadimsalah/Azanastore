"use client"

import { useState, useEffect, Fragment } from "react"
import { jsPDF } from "jspdf"
import JsBarcode from 'jsbarcode'
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useLanguage } from "@/components/language-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Search,
    Package,
    AlertTriangle,
    CheckCircle2,
    Plus,
    Filter,
    ArrowUpDown,
    Save,
    RefreshCw,
    X,
    MoreHorizontal,
    ChevronDown,
    ChevronUp,
    Store,
    Printer,
    CheckSquare,
    Square
} from "lucide-react"
import { getProducts, updateProductStock, updateVariantStock, type Product, type ProductVariant } from "@/lib/supabase-api"
import { toast } from "sonner"
import Image from "next/image"
import { AddVariantDialog } from "@/components/admin/inventory/add-variant-dialog"
import { SKUSticker } from "@/components/admin/inventory/sku-sticker"
import { Checkbox } from "@/components/ui/checkbox"

export default function InventoryPage() {
    const { t, language } = useLanguage()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all')
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [saving, setSaving] = useState<string | null>(null)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Add Variant Setup
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [isAddVariantOpen, setIsAddVariantOpen] = useState(false)

    // Printing Setup
    const [printData, setPrintData] = useState<{
        title: string
        sku: string
        size?: string | null
        color?: string | null
        price?: number
    } | null>(null)

    const handlePrint = (data: { title: string; sku: string; size?: string | null; color?: string | null; price?: number }) => {
        setPrintData(data)
        // Give React time to render the hidden sticker component
        setTimeout(() => {
            window.print()
            setPrintData(null)
        }, 500)
    }

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const data = await getProducts()
        setProducts(data)
        setLoading(false)
    }

    const toggleRow = (productId: string) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(productId)) newExpanded.delete(productId)
        else newExpanded.add(productId)
        setExpandedRows(newExpanded)
    }

    const toggleSelectAll = () => {
        if (selectedIds.size > 0) {
            setSelectedIds(new Set())
        } else {
            const allIds = new Set<string>()
            filteredProducts.forEach(p => {
                if (p.variants && p.variants.length > 0) {
                    p.variants.forEach(v => allIds.add(v.id))
                } else {
                    allIds.add(p.id)
                }
            })
            setSelectedIds(allIds)
        }
    }

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedIds(next)
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())

        const hasLowStock = p.variants && p.variants.length > 0
            ? p.variants.some(v => (v.stock || 0) <= 5)
            : (p.stock || 0) <= 5

        const isOutOfStock = p.variants && p.variants.length > 0
            ? p.variants.every(v => (v.stock || 0) === 0)
            : (p.stock || 0) === 0

        if (filterStatus === 'low') return matchesSearch && hasLowStock
        if (filterStatus === 'out') return matchesSearch && isOutOfStock
        return matchesSearch
    })

    const handleStockUpdate = async (id: string, newStock: number, isVariant: boolean) => {
        setSaving(id)
        const result = isVariant
            ? await updateVariantStock(id, newStock)
            : await updateProductStock(id, newStock)

        if (result.success) {
            toast.success(t("admin.inventory.toast_stock_updated"))
            // Update local state
            setProducts(prev => prev.map(p => {
                if (!isVariant && p.id === id) return { ...p, stock: newStock }
                if (isVariant && p.variants) {
                    return {
                        ...p,
                        variants: p.variants.map(v => v.id === id ? { ...v, stock: newStock } : v)
                    }
                }
                return p
            }))
        } else {
            toast.error(t("admin.inventory.toast_stock_failed"))
        }
        setSaving(null)
    }

    const getStockBadge = (stock: number) => {
        if (stock <= 0) return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 font-bold uppercase text-[10px]">{t("admin.inventory.stock_status_out")}</Badge>
        if (stock <= 5) return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold uppercase text-[10px]">{t("admin.inventory.stock_status_low")}</Badge>
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 font-bold uppercase text-[10px]">{t("admin.inventory.stock_status_in")}</Badge>
    }

    const generatePDFLabels = async () => {
        const doc = new jsPDF()
        const pageWidth = 210
        const pageHeight = 297
        const cols = 4
        const rows = 10
        const cellWidth = pageWidth / cols
        const cellHeight = pageHeight / rows
        const padding = 5

        // Helper to sanitize text for jsPDF
        const safeText = (text: string) => {
            if (!text) return "";
            return text.replace(/[^\x00-\x7F]/g, " ").trim();
        }

        const allLabels: { title: string; category: string; sku: string; color: string; size: string; price: number }[] = []

        products.forEach(p => {
            if (p.variants && p.variants.length > 0) {
                p.variants.forEach(v => {
                    // Only add if selected, OR if nothing is selected (fallback to all if user didn't select any?)
                    // The user requested "select then print", so we should strictly obey selection if some exist
                    if (v.sku && (selectedIds.size === 0 || selectedIds.has(v.id))) {
                        allLabels.push({
                            title: p.title || 'Untitled',
                            category: p.category || 'Standard',
                            sku: v.sku,
                            color: v.color || 'N/A',
                            size: v.size || 'N/A',
                            price: v.price || p.price || 0
                        })
                    }
                })
            } else if (p.sku && (selectedIds.size === 0 || selectedIds.has(p.id))) {
                allLabels.push({
                    title: p.title || 'Untitled',
                    category: p.category || 'Standard',
                    sku: p.sku,
                    color: 'N/A',
                    size: 'N/A',
                    price: p.price || 0
                })
            }
        })

        if (allLabels.length === 0) {
            alert("Erreur: Aucun produit avec SKU trouvé.")
            return
        }

        allLabels.sort((a, b) => {
            if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '')
            if (a.color !== b.color) return (a.color || '').localeCompare(b.color || '')
            return (a.size || '').localeCompare(b.size || '')
        })

        toast.info("Generating labels with barcodes...")

        let currentLabel = 0
        while (currentLabel < allLabels.length) {
            if (currentLabel > 0) doc.addPage()

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (currentLabel >= allLabels.length) break

                    const label = allLabels[currentLabel]
                    const x = c * cellWidth
                    const y = r * cellHeight

                    // Draw boundary
                    doc.setDrawColor(220, 220, 220)
                    doc.rect(x, y, cellWidth, cellHeight)

                    // Draw crop lines
                    doc.setDrawColor(150, 150, 150)
                    doc.line(x, y + cellHeight, x + cellWidth, y + cellHeight)
                    doc.line(x + cellWidth, y, x + cellWidth, y + cellHeight)

                    try {
                        // 1. Generate Barcode using a hidden canvas
                        const canvas = document.createElement('canvas')
                        JsBarcode(canvas, label.sku, {
                            format: "CODE128",
                            width: 2,
                            height: 40,
                            displayValue: false,
                            margin: 10,
                            background: "#ffffff"
                        })
                        const barcodeDataUrl = canvas.toDataURL('image/png')

                        const barcodeWidth = cellWidth - (padding * 2)
                        const barcodeHeight = 12
                        doc.addImage(barcodeDataUrl, 'PNG', x + padding, y + padding + 1, barcodeWidth, barcodeHeight)

                        // 2. Info Section (Below Barcode)
                        doc.setTextColor(0, 0, 0)

                        // SKU
                        doc.setFont("helvetica", "bold")
                        doc.setFontSize(8)
                        const skuText = safeText(label.sku)
                        doc.text(skuText, x + cellWidth / 2, y + padding + barcodeHeight + 4, { align: 'center' })

                        // Title
                        doc.setFont("helvetica", "normal")
                        doc.setFontSize(6)
                        const titleText = safeText(label.title)
                        doc.text(titleText, x + cellWidth / 2, y + padding + barcodeHeight + 7, { align: 'center' })

                        // Size & Color
                        doc.setFont("helvetica", "bold")
                        doc.setFontSize(6)
                        const metaText = `${safeText(label.size)} | ${safeText(label.color)}`
                        doc.text(metaText, x + cellWidth / 2, y + padding + barcodeHeight + 10, { align: 'center' })

                    } catch (err) {
                        console.error("Error drawing label:", err)
                    }

                    currentLabel++
                }
            }
        }

        doc.save(`AZANA_BARCODE_LABELS_${new Date().toISOString().split('T')[0]}.pdf`)
        toast.success("PDF Labels Generated!")
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <AdminSidebar />

            <main className="lg:pl-72 lg:rtl:pl-0 lg:rtl:pr-72 p-4 sm:p-6 lg:p-8 min-h-screen relative z-10 transition-all duration-300">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 glass-strong p-6 rounded-[2rem] border border-white/5 shadow-2xl">
                    <div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <Store className="w-6 h-6 text-primary" />
                            {t("admin.inventory.title")}
                        </h1>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest opacity-60">
                            {language === 'ar' ? 'نظام إدارة المخزون الذكي' : 'Smart Inventory Management System'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <Button
                            onClick={generatePDFLabels}
                            variant="outline"
                            size="sm"
                            className={`flex-1 md:flex-none rounded-xl h-10 gap-2 border-primary/20 text-primary transition-all font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/5 ${selectedIds.size > 0 ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                        >
                            <Printer className="w-3.5 h-3.5" />
                            {selectedIds.size > 0
                                ? t("admin.inventory.print_barcodes").replace("{count}", selectedIds.size.toString())
                                : t("admin.inventory.export_barcodes")}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 md:flex-none rounded-xl h-10 gap-2 font-bold uppercase text-[10px] tracking-widest"
                            onClick={loadData}
                        >
                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                            {t("admin.inventory.sync")}
                        </Button>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={t("admin.inventory.search_placeholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 rtl:pr-11 rtl:pl-4 h-12 rounded-2xl bg-white/5 border-white/10 glass-light focus:ring-primary/20 text-left rtl:text-right"
                        />
                    </div>

                    <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 glass-light">
                        {(['all', 'low', 'out'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-white/5"
                                    }`}
                            >
                                {t(`admin.inventory.filter_${s}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="glass-strong rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left rtl:text-right border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="py-4 px-6 w-10">
                                        <Checkbox
                                            checked={selectedIds.size > 0 && selectedIds.size === filteredProducts.reduce((acc, p) => acc + (p.variants?.length || 1), 0)}
                                            onCheckedChange={toggleSelectAll}
                                            className="border-white/20 data-[state=checked]:bg-primary"
                                        />
                                    </th>
                                    <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("admin.inventory.table_product")}</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden md:table-cell">{t("admin.inventory.table_sku")}</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("admin.inventory.table_stock")}</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right rtl:text-left">{t("admin.inventory.table_actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                                            <p className="text-muted-foreground font-medium animate-pulse">{t("admin.inventory.loading")}</p>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold text-muted-foreground">{t("admin.inventory.no_products")}</h3>
                                        </td>
                                    </tr>
                                ) : filteredProducts.map((product) => {
                                    const hasVariants = product.variants && product.variants.length > 0
                                    const isExpanded = expandedRows.has(product.id)
                                    const totalStock = hasVariants
                                        ? product.variants!.reduce((acc, v) => acc + (v.stock || 0), 0)
                                        : (product.stock || 0)

                                    return (
                                        <Fragment key={product.id}>
                                            <tr key={product.id} className={`group hover:bg-white/5 transition-colors ${isExpanded ? 'bg-primary/5' : ''}`}>
                                                <td className="py-4 px-6">
                                                    {!hasVariants ? (
                                                        <Checkbox
                                                            checked={selectedIds.has(product.id)}
                                                            onCheckedChange={() => toggleSelect(product.id)}
                                                            className="border-white/20 data-[state=checked]:bg-primary"
                                                        />
                                                    ) : (
                                                        <code
                                                            className={`text-[9px] font-bold cursor-pointer transition-colors ${selectedIds.size > 0 && product.variants!.every(v => selectedIds.has(v.id)) ? 'text-primary' : 'text-muted-foreground'}`}
                                                            onClick={() => {
                                                                const allV = product.variants!.map(v => v.id)
                                                                const someSelected = allV.some(v => selectedIds.has(v))
                                                                const next = new Set(selectedIds)
                                                                if (someSelected) allV.forEach(v => next.delete(v))
                                                                else allV.forEach(v => next.add(v))
                                                                setSelectedIds(next)
                                                            }}
                                                        >
                                                            {product.variants!.every(v => selectedIds.has(v.id)) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                                        </code>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-white/5">
                                                            {product.images?.[0] ? (
                                                                <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                                                            ) : (
                                                                <Package className="w-6 h-6 m-auto text-muted-foreground/20" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-foreground text-sm line-clamp-1">{product.title}</div>
                                                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">{product.category}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 hidden md:table-cell">
                                                    <code className="text-[10px] font-black bg-white/5 px-2 py-1 rounded text-primary border border-primary/10">
                                                        {product.sku}
                                                    </code>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        {hasVariants ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-lg">{totalStock}</span>
                                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase font-bold whitespace-nowrap">
                                                                    {t("admin.inventory.variants_count").replace("{count}", product.variants!.length.toString())}
                                                                </Badge>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-4">
                                                                <Input
                                                                    type="number"
                                                                    defaultValue={product.stock || 0}
                                                                    className="w-20 h-9 bg-white/5 border-white/10 text-center font-bold"
                                                                    onBlur={(e) => {
                                                                        const val = parseInt(e.target.value)
                                                                        if (val !== product.stock) handleStockUpdate(product.id, val, false)
                                                                    }}
                                                                />
                                                                {getStockBadge(product.stock || 0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right rtl:text-left">
                                                    <div className="flex items-center justify-end rtl:justify-start gap-2">
                                                        <Button
                                                            onClick={() => {
                                                                setSelectedProduct(product)
                                                                setIsAddVariantOpen(true)
                                                            }}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="rounded-xl h-9 px-3 gap-2 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all font-bold text-[10px] uppercase tracking-widest whitespace-nowrap"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                            <span className="hidden sm:inline">{t("admin.inventory.add_variant")}</span>
                                                        </Button>
                                                        {hasVariants && (
                                                            <Button
                                                                onClick={() => {
                                                                    const next = new Set(selectedIds)
                                                                    product.variants!.forEach(v => next.add(v.id))
                                                                    setSelectedIds(next)
                                                                    toast.success(t("admin.inventory.toast_labels_prepared").replace("{count}", product.variants!.length.toString()))
                                                                }}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="rounded-xl h-9 px-3 gap-2 hover:bg-primary/10 hover:text-primary transition-all font-bold text-[10px] uppercase tracking-widest border border-dashed border-primary/20 whitespace-nowrap"
                                                                title={t("admin.inventory.preselect_all")}
                                                            >
                                                                <CheckSquare className="w-3.5 h-3.5" />
                                                                <span className="hidden lg:inline">{t("admin.inventory.preselect_all")}</span>
                                                            </Button>
                                                        )}
                                                        {hasVariants && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRow(product.id)}
                                                                className={`rounded-xl h-9 w-9 p-0 transition-transform ${isExpanded ? 'rotate-180 bg-primary/10 text-primary' : ''}`}
                                                            >
                                                                <ChevronDown className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Variants Row */}
                                            {hasVariants && isExpanded && product.variants!.map((v) => (
                                                <tr key={v.id} className={`bg-black/20 border-l-4 border-primary transition-colors ${selectedIds.has(v.id) ? 'bg-primary/5' : ''}`}>
                                                    <td className="py-3 px-6 pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <Checkbox
                                                                checked={selectedIds.has(v.id)}
                                                                onCheckedChange={() => toggleSelect(v.id)}
                                                                className="border-white/20 data-[state=checked]:bg-primary"
                                                            />
                                                            <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                                                            <div>
                                                                <span className="text-xs font-bold text-foreground/80">{v.name || 'Variant'}</span>
                                                                <div className="flex gap-2 mt-1">
                                                                    {v.size && <Badge variant="outline" className="text-[9px] h-4 px-1.5 opacity-60 uppercase">{v.size}</Badge>}
                                                                    {v.color && <Badge variant="outline" className="text-[9px] h-4 px-1.5 opacity-60 uppercase">{v.color}</Badge>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6 hidden md:table-cell">
                                                        <code className="text-[9px] font-bold opacity-60">
                                                            {v.sku}
                                                        </code>
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <Input
                                                                type="number"
                                                                defaultValue={v.stock || 0}
                                                                className="w-16 h-8 bg-white/5 border-white/10 text-center text-xs font-bold"
                                                                onBlur={(e) => {
                                                                    const val = parseInt(e.target.value)
                                                                    if (val !== (v.stock || 0)) handleStockUpdate(v.id, val, true)
                                                                }}
                                                            />
                                                            {getStockBadge(v.stock || 0)}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6 text-right rtl:text-left">
                                                    </td>
                                                </tr>
                                            ))}
                                        </Fragment>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <AddVariantDialog
                    product={selectedProduct}
                    open={isAddVariantOpen}
                    onOpenChange={setIsAddVariantOpen}
                    onSuccess={(variantData) => {
                        loadData()
                        if (variantData) {
                            handlePrint(variantData)
                        }
                    }}
                />

                {printData && (
                    <div className="fixed inset-0 pointer-events-none opacity-0 overflow-hidden">
                        <SKUSticker {...printData} />
                    </div>
                )}
            </main>
        </div>
    )
}
