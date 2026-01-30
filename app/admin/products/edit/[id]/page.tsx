"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    Upload,
    X,
    Plus,
    Save,
    Image as ImageIcon,
    Check,
    Wand2,
    RefreshCw,
    ChevronDown,
    Layers,
    DollarSign,
    Package,
    Tags,
    Sparkles,
    Loader2,
    Trash2,
    Search
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getProductById } from "@/lib/supabase-api"
import { supabase } from "@/lib/supabase"

// Predefined Options
const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44"]
const COMMON_COLORS = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Navy", hex: "#000080" },
    { name: "Beige", hex: "#F5F5DC" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Red", hex: "#FF0000" },
    { name: "Green", hex: "#008000" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Grey", hex: "#808080" },
    { name: "Gold", hex: "#FFD700" },
    { name: "Silver", hex: "#C0C0C0" }
]

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const productId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form state
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [price, setPrice] = useState("")
    const [compareAtPrice, setCompareAtPrice] = useState("")
    const [stock, setStock] = useState("")
    const [sku, setSku] = useState("")
    const [status, setStatus] = useState("active")
    const [benefits, setBenefits] = useState<string[]>([])
    const [sizeGuide, setSizeGuide] = useState("")
    const [images, setImages] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [relatedProducts, setRelatedProducts] = useState<any[]>([])
    const [selectedRelated, setSelectedRelated] = useState<string[]>([])

    // Variants State
    const [variants, setVariants] = useState<any[]>([])
    const [selectedSizes, setSelectedSizes] = useState<string[]>([])
    const [selectedColors, setSelectedColors] = useState<string[]>([])

    // AI Rewrite State
    const [rewriting, setRewriting] = useState<string | null>(null)

    // Load product data
    useEffect(() => {
        async function loadProduct() {
            setLoading(true)
            const product = await getProductById(productId)

            if (product) {
                setTitle(product.title)
                setDescription(product.description || "")
                setCategory(product.category)
                setPrice(product.price.toString())
                setCompareAtPrice(product.compare_at_price?.toString() || "")
                setStock(product.stock.toString())
                setSku(product.sku)
                setStatus(product.status)
                setBenefits(product.benefits || [])
                setSizeGuide(product.size_guide || "")
                setVariants(product.variants || [])
                setImages(product.images || [])
            }

            // Categories
            const { data: catData } = await supabase
                .from('categories')
                .select('id, name, slug')
                .order('name')

            if (catData) setCategories(catData)

            // Related Products (simplified for now)
            const { data: prodData } = await supabase
                .from('products')
                .select('id, title, images')
                .eq('status', 'active')
                .neq('id', productId)
                .limit(10)

            if (prodData) setRelatedProducts(prodData)

            setLoading(false)
        }

        if (productId) {
            loadProduct()
        }
    }, [productId])

    const handleRewrite = async (field: string, currentText: string, setter: (val: string) => void) => {
        if (!currentText.trim()) return

        setRewriting(field)
        try {
            const res = await fetch('/api/admin/products/rewrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: currentText, field })
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.error_code === "RATE_LIMIT_DAILY") {
                    alert("⚠️ Daily Free AI Quota Exceeded\n\nPlease wait until tomorrow or add your own OpenRouter key in settings.")
                    return
                }
                throw new Error(data.message || data.error || "Unknown error")
            }

            if (data.text) {
                setter(data.text)
            }
        } catch (error: any) {
            console.error('Rewrite error:', error)
            if (error.message !== "Unknown error") {
                alert(`AI Assistant: ${error.message}`)
            }
        } finally {
            setRewriting(null)
        }
    }

    const handleSave = async () => {
        // Validation
        if (!title.trim()) {
            alert('Please enter a product title')
            return
        }
        if (!category) {
            alert('Please select a category')
            return
        }
        if (!price || parseFloat(price) < 0) {
            alert('Please enter a valid price')
            return
        }

        setSaving(true)

        const { error } = await supabase
            .from('products')
            .update({
                title,
                description,
                category,
                price: parseFloat(price) || 0,
                compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
                stock: parseInt(stock) || 0,
                sku,
                status,
                benefits,
                images,
                size_guide: sizeGuide,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId)

        setSaving(false)

        if (error) {
            alert('Error updating product: ' + error.message)
        } else {
            // Sync Variants
            // 1. Delete existing variants not in the current list
            const currentVariantIds = variants.map(v => v.id).filter(Boolean)

            if (currentVariantIds.length > 0) {
                const { error: deleteError } = await supabase
                    .from('product_variants')
                    .delete()
                    .eq('product_id', productId)
                    .not('id', 'in', `(${currentVariantIds.join(',')})`)
                if (deleteError) console.error('Error deleting old variants:', deleteError)
            } else {
                const { error: deleteError } = await supabase
                    .from('product_variants')
                    .delete()
                    .eq('product_id', productId)
                if (deleteError) console.error('Error clearing old variants:', deleteError)
            }

            // 2. Upsert current variants
            if (variants.length > 0) {
                // Filter out invalid variants (e.g. empty ones that might cause SKU collisions)
                const validVariants = variants.filter(v =>
                    (v.size || v.color || v.name) &&
                    !isNaN(parseFloat(v.price || price))
                )

                const variantsToUpsert = validVariants.map((v, idx) => {
                    const vPrice = parseFloat(v.price)
                    const mainPrice = parseFloat(price)
                    const vStock = parseInt(v.stock)

                    const upsertData: any = {
                        product_id: productId,
                        name: v.name || `${v.size || ""} ${v.color || ""}`.trim() || `Variant ${idx + 1}`,
                        size: v.size || null,
                        color: v.color || null,
                        price: isNaN(vPrice) ? (isNaN(mainPrice) ? 0 : mainPrice) : vPrice,
                        stock: isNaN(vStock) ? 0 : vStock,
                        sku: v.sku || `${sku}-${v.size || idx}-${v.color || ''}`.replace(/-+$/, "")
                    }

                    if (v.id) {
                        upsertData.id = v.id
                    }

                    return upsertData
                })

                if (variantsToUpsert.length > 0) {
                    const { error: variantError } = await supabase
                        .from('product_variants')
                        .upsert(variantsToUpsert)

                    if (variantError) {
                        console.error('Error upserting variants:', variantError.message, variantError.details, variantError.hint)
                        alert(`Error saving variants: ${variantError.message}`)
                    }
                }
            }

            router.push('/admin/products')
        }
    }

    const addBenefit = () => {
        setBenefits([...benefits, ""])
    }

    const updateBenefit = (index: number, value: string) => {
        const newBenefits = [...benefits]
        newBenefits[index] = value
        setBenefits(newBenefits)
    }

    const removeBenefit = (index: number) => {
        setBenefits(benefits.filter((_, i) => i !== index))
    }

    const toggleRelated = (id: string) => {
        if (selectedRelated.includes(id)) {
            setSelectedRelated(selectedRelated.filter(i => i !== id))
        } else {
            setSelectedRelated([...selectedRelated, id])
        }
    }

    const generateSku = () => {
        const base = title.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "PROD"
        const random = Math.floor(1000 + Math.random() * 9000)
        setSku(`${base}-${random}`)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        const uploadedUrls: string[] = []

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `${fileName}`

                const { data, error } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file)

                if (error) {
                    console.error('Upload error:', error)
                    alert(`Error uploading ${file.name}: ${error.message}`)
                    continue
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath)

                uploadedUrls.push(publicUrl)
            }

            setImages([...images, ...uploadedUrls])
        } catch (error) {
            console.error('Upload error:', error)
            alert('Error uploading images')
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const addVariant = () => {
        const nextSku = `${sku}-${variants.length + 1}`
        setVariants([...variants, {
            name: "",
            size: "",
            color: "",
            price: price || "0",
            stock: "10",
            sku: nextSku
        }])
    }

    const updateVariant = (index: number, field: string, value: string) => {
        const newVariants = [...variants]
        newVariants[index] = { ...newVariants[index], [field]: value }
        setVariants(newVariants)
    }

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index))
    }

    const toggleSizeSelection = (size: string) => {
        setSelectedSizes(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        )
    }

    const toggleColorSelection = (colorName: string) => {
        setSelectedColors(prev =>
            prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
        )
    }

    const generateCombinations = () => {
        if (selectedSizes.length === 0 && selectedColors.length === 0) return

        const newVariants: any[] = []
        const sizes = selectedSizes.length > 0 ? selectedSizes : [""]
        const colors = selectedColors.length > 0 ? selectedColors : [""]

        sizes.forEach(size => {
            colors.forEach(color => {
                // Check if this variant already exists (by size and color)
                const exists = variants.some(v => v.size === size && v.color === color)
                if (!exists) {
                    newVariants.push({
                        name: `${size} ${color}`.trim(),
                        size: size || null,
                        color: color || null,
                        price: price || "0",
                        stock: "10",
                        sku: `${sku}-${size || 'S'}-${color || 'C'}-${Math.floor(Math.random() * 1000)}`.replace(/-+$/, "")
                    })
                }
            })
        })

        setVariants([...variants, ...newVariants])
        // Reset selections
        setSelectedSizes([])
        setSelectedColors([])
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <AdminSidebar />
                <div className="text-center">
                    <p className="text-gray-500">Loading product...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 relative overflow-hidden text-gray-900">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-100/40 rounded-full blur-[120px]" />
            </div>

            <AdminSidebar />

            <main className="lg:pl-72 lg:rtl:pl-0 lg:rtl:pr-72 p-4 sm:p-6 lg:p-8 min-h-screen relative z-10 pb-24 transition-all duration-300">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-4 z-40 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/products">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
                            <p className="text-xs text-gray-500 font-medium">Update product information</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/admin/products">
                            <Button variant="outline" className="rounded-full border-gray-200 hover:bg-gray-100 text-gray-600">
                                Discard
                            </Button>
                        </Link>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-full px-6 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white border-none transition-all"
                        >
                            {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                        </Button>
                    </div>
                </header>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* General Information */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">General Information</h3>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Product Title</label>
                                <div className="relative">
                                    <Input
                                        value={title || ""}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Pure Argan Oil"
                                        className="h-12 text-base bg-gray-50/50 border-gray-200 focus:bg-white transition-colors pr-12"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        {title.trim() && (
                                            <button
                                                onClick={() => handleRewrite('title', title, setTitle)}
                                                disabled={rewriting === 'title'}
                                                className="text-purple-400 hover:text-purple-600 p-1 rounded-full transition-all"
                                                title="Improve with AI"
                                            >
                                                {rewriting === 'title' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Description</label>
                                <div className="relative">
                                    <Textarea
                                        value={description || ""}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe your product (English)..."
                                        className="min-h-[150px] text-base bg-gray-50/50 border-gray-200 focus:bg-white transition-colors resize-none pr-10"
                                    />
                                    <div className="absolute right-2 top-2 flex flex-col gap-2">
                                        {description.trim() && (
                                            <button
                                                onClick={() => handleRewrite('description', description, setDescription)}
                                                disabled={rewriting === 'description'}
                                                className="text-purple-400 hover:text-purple-600 p-1 rounded-full transition-all bg-white/50 backdrop-blur-sm"
                                                title="Improve with AI"
                                            >
                                                {rewriting === 'description' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Product Attributes */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                    Product Attributes
                                </h3>
                            </div>
                            <div className="p-6 space-y-8">
                                {/* Key Benefits */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Key Benefits</label>
                                        <Button
                                            type="button"
                                            onClick={addBenefit}
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full h-8"
                                        >
                                            <Plus className="w-4 h-4 mr-1" /> Add Benefit
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {benefits.map((benefit, index) => (
                                            <div key={index} className="flex gap-2 group animate-in slide-in-from-left-2 duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                                                <div className="relative flex-1">
                                                    <Input
                                                        value={benefit}
                                                        onChange={(e) => updateBenefit(index, e.target.value)}
                                                        placeholder="e.g. 100% Pure & Organic"
                                                        className="bg-white border-gray-200 h-11 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all pl-4 pr-10"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeBenefit(index)}
                                                    className="h-11 w-11 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {benefits.length === 0 && (
                                            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                                                <p className="text-xs">No benefits added yet. Highlight what makes this product special.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Size Guide */}
                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Size Guide / Additional Info</label>
                                    </div>
                                    <Textarea
                                        value={sizeGuide || ""}
                                        onChange={(e) => setSizeGuide(e.target.value)}
                                        className="w-full min-h-[150px] rounded-xl bg-white border border-gray-200 p-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-gray-700 resize-none shadow-sm"
                                        placeholder="Add size measurements or specific product instructions..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Media */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                    <ImageIcon className="w-4 h-4 text-blue-500" />
                                    Product Media
                                </h3>
                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">{images.length} Images</Badge>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {images.map((url, index) => (
                                        <div key={index} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                            <Image src={url} alt={`Product ${index}`} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeImage(index)}
                                                    className="h-8 w-8 rounded-full bg-white/20 hover:bg-red-500 text-white transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            {index === 0 && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-sm">
                                                    Primary
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center cursor-pointer group">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors mb-2">
                                            {uploading ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin" /> : <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />}
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 group-hover:text-blue-600 uppercase tracking-wider">Upload</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Variants Management */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-gray-900">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                    <Layers className="w-4 h-4 text-indigo-500" />
                                    Product Variants (Sizes & Colors)
                                </h3>
                                <Button
                                    type="button"
                                    onClick={addVariant}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Variant
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="mb-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                            1. Select Sizes
                                            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">Multiple</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {COMMON_SIZES.map(s => {
                                                const isSelected = selectedSizes.includes(s)
                                                return (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => toggleSizeSelection(s)}
                                                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isSelected ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600"}`}
                                                    >
                                                        {s}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                            2. Select Colors
                                            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">Visual Selection</span>
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {COMMON_COLORS.map(c => {
                                                const isSelected = selectedColors.includes(c.name)
                                                return (
                                                    <button
                                                        key={c.name}
                                                        type="button"
                                                        onClick={() => toggleColorSelection(c.name)}
                                                        className={`group relative flex flex-col items-center gap-1 p-1 rounded-xl transition-all ${isSelected ? "bg-white shadow-sm ring-2 ring-indigo-500" : "hover:bg-white"}`}
                                                    >
                                                        <div
                                                            className="w-10 h-10 rounded-full border border-gray-100 shadow-inner flex items-center justify-center transition-transform group-hover:scale-110"
                                                            style={{ backgroundColor: c.hex }}
                                                        >
                                                            {isSelected && <Check className={`w-5 h-5 ${c.name === 'White' || c.name === 'Silver' ? 'text-black' : 'text-white'}`} />}
                                                        </div>
                                                        <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}>{c.name}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={generateCombinations}
                                        disabled={selectedSizes.length === 0 && selectedColors.length === 0}
                                        className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 disabled:bg-gray-200"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Generate {selectedSizes.length > 0 && selectedColors.length > 0 ? selectedSizes.length * selectedColors.length : Math.max(selectedSizes.length, selectedColors.length)} Combinations
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Active Variants ({variants.length})</h4>
                                    </div>
                                    {variants.map((v, i) => (
                                        <div key={i} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4 relative group hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all">
                                            <button
                                                onClick={() => removeVariant(i)}
                                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Size</label>
                                                    <Input
                                                        placeholder="e.g. XL"
                                                        value={v.size || ""}
                                                        onChange={(e) => updateVariant(i, "size", e.target.value)}
                                                        className="h-10 bg-white border-gray-200 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Color</label>
                                                    <Input
                                                        placeholder="e.g. Navy"
                                                        value={v.color || ""}
                                                        onChange={(e) => updateVariant(i, "color", e.target.value)}
                                                        className="h-10 bg-white border-gray-200 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price (MAD)</label>
                                                    <Input
                                                        type="number"
                                                        placeholder={price || "0.00"}
                                                        value={v.price}
                                                        onChange={(e) => updateVariant(i, "price", e.target.value)}
                                                        className="h-10 bg-white border-gray-200 font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={v.stock}
                                                        onChange={(e) => updateVariant(i, "stock", e.target.value)}
                                                        className="h-10 bg-white border-gray-200 font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {variants.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-sm">
                                    No variants added yet.
                                </div>
                            )}
                        </section>

                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Organization */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Organization</h3>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Category</label>
                                <div className="relative">
                                    <select
                                        value={category || ""}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 appearance-none shadow-sm">
                                        <option value="" disabled>Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.slug || cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Status</label>
                                <div className="relative">
                                    <select
                                        value={status || "draft"}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 appearance-none shadow-sm"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </section>

                        {/* Pricing */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Pricing</h3>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Price (MAD)</label>
                                <Input
                                    type="number"
                                    value={price || ""}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="h-12 text-base bg-gray-50/50 border-gray-200"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Compare at Price (Optional)</label>
                                <Input
                                    type="number"
                                    value={compareAtPrice || ""}
                                    onChange={(e) => setCompareAtPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="h-12 text-base bg-gray-50/50 border-gray-200"
                                />
                            </div>
                        </section>

                        {/* Inventory */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Inventory</h3>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Stock Quantity</label>
                                <Input
                                    type="number"
                                    value={stock || ""}
                                    onChange={(e) => setStock(e.target.value)}
                                    placeholder="0"
                                    className="h-12 text-base bg-gray-50/50 border-gray-200"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">SKU</label>
                                <Input
                                    value={sku || ""}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="PROD-001"
                                    className="h-12 text-base bg-gray-50/50 border-gray-200"
                                />
                            </div>
                        </section>

                    </div>

                </div >

            </main >
        </div >
    )
}
