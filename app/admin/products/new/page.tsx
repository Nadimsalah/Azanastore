"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    ArrowRight,
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
    Camera,
    Zap,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider" // Import translation hook
import { generateSKU } from "@/lib/sku-utils"
import { toast } from "sonner"

// Predefined Options
const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44"]
const COMMON_COLORS = [
    // Basics
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Grey", hex: "#808080" },
    { name: "Silver", hex: "#C0C0C0" },
    { name: "Gold", hex: "#FFD700" },
    { name: "Beige", hex: "#F5F5DC" },
    { name: "Brown", hex: "#A52A2A" },
    { name: "Tan", hex: "#D2B48C" },
    { name: "Cream", hex: "#FFFDD0" },
    { name: "Ivory", hex: "#FFFFF0" },
    { name: "Taupe", hex: "#483C32" },
    { name: "Khaki", hex: "#F0E68C" },

    // Blues
    { name: "Navy", hex: "#000080" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Royal Blue", hex: "#4169E1" },
    { name: "Sky Blue", hex: "#87CEEB" },
    { name: "Teal", hex: "#008080" },
    { name: "Turquoise", hex: "#40E0D0" },
    { name: "Cyan", hex: "#00FFFF" },
    { name: "Midnight", hex: "#191970" },
    { name: "Indigo", hex: "#4B0082" },

    // Reds / Pinks
    { name: "Red", hex: "#FF0000" },
    { name: "Burgundy", hex: "#800020" },
    { name: "Maroon", hex: "#800000" },
    { name: "Crimson", hex: "#DC143C" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Hot Pink", hex: "#FF69B4" },
    { name: "Rose", hex: "#FF007F" },
    { name: "Magenta", hex: "#FF00FF" },
    { name: "Coral", hex: "#FF7F50" },
    { name: "Salmon", hex: "#FA8072" },
    { name: "Peach", hex: "#FFDAB9" },

    // Greens
    { name: "Green", hex: "#008000" },
    { name: "Forest", hex: "#228B22" },
    { name: "Olive", hex: "#808000" },
    { name: "Lime", hex: "#00FF00" },
    { name: "Mint", hex: "#98FF98" },
    { name: "Sage", hex: "#BCB88A" },
    { name: "Emerald", hex: "#50C878" },

    // Yellows / Oranges
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Mustard", hex: "#FFDB58" },
    { name: "Amber", hex: "#FFBF00" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Rust", hex: "#B7410E" },
    { name: "Apricot", hex: "#FBCEB1" },

    // Purples
    { name: "Purple", hex: "#800080" },
    { name: "Violet", hex: "#EE82EE" },
    { name: "Lavender", hex: "#E6E6FA" },
    { name: "Lilac", hex: "#C8A2C8" },
    { name: "Plum", hex: "#DDA0DD" }
]

export default function NewProductPage() {
    const { t } = useLanguage() // Initialize translation hook
    const [title, setTitle] = useState("")
    const [images, setImages] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)
    const [benefits, setBenefits] = useState<string[]>([])
    const [newBenefit, setNewBenefit] = useState("")
    const [selectedRelated, setSelectedRelated] = useState<string[]>([])
    const [status, setStatus] = useState("Active")
    const [category, setCategory] = useState("")
    const [isPublishing, setIsPublishing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const router = useRouter()

    // Form fields
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [compareAtPrice, setCompareAtPrice] = useState("")
    const [stock, setStock] = useState("0")
    const [sizeGuide, setSizeGuide] = useState("")
    const [categories, setCategories] = useState<any[]>([])

    // AI Rewrite State Removed
    const [relatedProducts, setRelatedProducts] = useState<any[]>([])

    // Variants State
    const [variants, setVariants] = useState<any[]>([])
    const [selectedSizes, setSelectedSizes] = useState<string[]>([])
    const [selectedColors, setSelectedColors] = useState<string[]>([])
    
    // AI Magic State
    const [showAIModal, setShowAIModal] = useState(false)
    const [aiAnalyzing, setAIAnalyzing] = useState(false)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [aiProcessingStage, setAIProcessingStage] = useState<string | null>(null)
    const [aiResult, setAIResult] = useState<{ title: string; description: string; proImage: string; category?: string } | null>(null)

    // Fetch related products & categories
    useEffect(() => {
        const fetchData = async () => {
            // Products for cross-sell
            const { data: prodData } = await supabase
                .from('products')
                .select('id, title, images')
                .eq('status', 'active')
                .limit(10)

            if (prodData) setRelatedProducts(prodData)

            // Categories
            const { data: catData } = await supabase
                .from('categories')
                .select('id, name, slug')
                .order('name')

            if (catData) setCategories(catData)
        }
        fetchData()
    }, [])

    const handlePublish = async () => {
        // Validation with step switching
        if (!title.trim()) {
            toast.error(t('admin.products.error_title_required'))
            setCurrentStep(1)
            return
        }
        if (images.length === 0) {
            toast.error("Veuillez ajouter au moins une image")
            setCurrentStep(2)
            return
        }
        if (!category) {
            toast.error(t('admin.products.error_category_required'))
            setCurrentStep(4)
            return
        }
        if (!price || parseFloat(price) <= 0) {
            toast.error(t('admin.products.error_price_required'))
            setCurrentStep(6)
            return
        }

        setIsPublishing(true)

        try {
            const { data, error } = await supabase
                .from('products')
                .insert({
                    title,
                    description,
                    sku: generateSKU(category, title, "NA", "NA"),
                    category,
                    price: parseFloat(price) || 0,
                    compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
                    stock: parseInt(stock) || 0,
                    status: status.toLowerCase(),
                    images,
                    benefits,
                    size_guide: sizeGuide || null,
                })
                .select()

            if (error) {
                console.error('Error creating product:', error)
                alert(`Error creating product: ${error.message || 'Unknown error'} (${error.code || 'no code'})`)
                setIsPublishing(false)
                return
            }

            const productId = data[0].id

            // Insert Variants
            if (variants.length > 0) {
                // Filter out invalid variants (e.g. empty ones that might cause SKU collisions)
                const validVariants = variants.filter(v =>
                    (v.size || v.color || v.name) &&
                    !isNaN(parseFloat(v.price || price))
                )

                const variantsToInsert = validVariants.map((v, idx) => {
                    const vPrice = parseFloat(v.price)
                    const mainPrice = parseFloat(price)
                    const vStock = parseInt(v.stock)

                    return {
                        product_id: productId,
                        name: v.name || `${v.size || ""} ${v.color || ""}`.trim() || `Variant ${idx + 1}`,
                        size: v.size || null,
                        color: v.color || null,
                        price: isNaN(vPrice) ? (isNaN(mainPrice) ? 0 : mainPrice) : vPrice,
                        stock: isNaN(vStock) ? 0 : vStock,
                        sku: v.sku || generateSKU(category, title, v.color, v.size)
                    }
                })

                if (variantsToInsert.length > 0) {
                    const { error: variantError } = await supabase
                        .from('product_variants')
                        .insert(variantsToInsert)

                    if (variantError) {
                        console.error('Error inserting variants:', variantError.message, variantError.details, variantError.hint)
                        alert(`Error saving variants: ${variantError.message}`)
                    }
                }
            }

            setShowSuccess(true)
            setTimeout(() => {
                router.push('/admin/products')
            }, 1500)
        } catch (error) {
            console.error('Error:', error)
            alert('Error creating product')
            setIsPublishing(false)
        }
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

    const addBenefit = () => {
        if (newBenefit.trim()) {
            setBenefits([...benefits, newBenefit])
            setNewBenefit("")
        }
    }

    const removeBenefit = (index: number) => {
        setBenefits(benefits.filter((_, i) => i !== index))
    }

    const handleAILoader = async (imgData: string) => {
        setCapturedImage(imgData)
        setAIAnalyzing(true)
        setAIProcessingStage("analyzing")
        
        try {
            // First step: Analyze metadata with Gemini
            setAIProcessingStage("Reading product traits...")
            const res = await fetch('/api/admin/products/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imgData })
            })
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.error || errorData.message || 'Gemini failed')
            }
            
            const data = await res.json()
            
            setAIProcessingStage("Optimizing for professional shot...")
            // Simulating pro shooting transformation
            await new Promise(r => setTimeout(r, 1500))
            
            const finalImage = data.proImage || imgData
            
            setAIResult({
                title: data.title,
                description: data.description,
                proImage: finalImage,
                category: data.category
            })

            if (data.imagenError) {
                console.warn("Imagen Error (falling back to original):", data.imagenError)
                toast.warning(`Metadata OK, but Image Magic failed: ${data.imagenError.slice(0, 50)}...`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to analyze image")
        } finally {
            setAIAnalyzing(false)
            setAIProcessingStage(null)
        }
    }

    const applyAIResult = () => {
        if (!aiResult) return
        
        setTitle(aiResult.title)
        setDescription(aiResult.description)
        
        // Find closest category match
        if (aiResult.category && categories.length > 0) {
            const searchStr = aiResult.category.toLowerCase()
            const match = categories.find(c => 
                c.slug?.toLowerCase().includes(searchStr) || 
                c.name?.toLowerCase().includes(searchStr)
            )
            if (match) setCategory(match.slug || match.id)
        }
        
        setImages([aiResult.proImage, ...images])
        setShowAIModal(false)
        setAIResult(null)
        setCapturedImage(null)
    }

    const toggleRelated = (id: string) => {
        if (selectedRelated.includes(id)) {
            setSelectedRelated(selectedRelated.filter(i => i !== id))
        } else {
            setSelectedRelated([...selectedRelated, id])
        }
    }

    const addVariant = () => {
        setVariants([...variants, { name: "", size: "", color: "", price: price, stock: "0", sku: "" }])
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
                // Check if this variant already exists
                const exists = variants.some(v => v.size === size && v.color === color)
                if (!exists) {
                    newVariants.push({
                        name: `${size} ${color}`.trim(),
                        size: size || null,
                        color: color || null,
                        price: price,
                        stock: "10",
                        sku: generateSKU(category, title, color, size)
                    })
                }
            })
        })

        setVariants([...variants, ...newVariants])
        // Reset selections
        setSelectedSizes([])
        setSelectedColors([])
    }

    return (
        <div className="min-h-screen bg-gray-50/50 text-gray-900">
            {/* Subtle Background Gradients - Light Mode */}
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
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{t('admin.products.add_product')}</h1>
                            <p className="text-xs text-gray-500 font-medium">{t('admin.products.new_arrival')}</p>
                        </div>
                    </div>



                    <div className="hidden sm:flex items-center gap-3">
                        <Link href="/admin/products">
                            <Button variant="ghost" className="rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900">
                                {t('admin.products.discard')}
                            </Button>
                        </Link>
                        
                        <Button
                            onClick={() => setShowAIModal(true)}
                            className="rounded-full px-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-violet-500/20 shadow-none text-white border-none font-bold"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Magic AI
                        </Button>

                        <Button
                            onClick={handlePublish}
                            disabled={isPublishing || showSuccess}
                            className="rounded-full px-6 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white border-none transition-all"
                        >
                            {isPublishing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('admin.products.uploading')}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> {t('admin.products.publish')}
                                </>
                            )}
                        </Button>
                    </div>
                </header>

                {/* Publishing Overlay */}
                {(isPublishing || showSuccess) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-500">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center border border-gray-100 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-300">
                            {showSuccess ? (
                                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                        <Check className="w-10 h-10" strokeWidth={3} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.products.published_title')}</h3>
                                    <p className="text-gray-500">{t('admin.products.published_redirect')}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="relative w-20 h-20 mb-6">
                                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                        <Package className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('admin.products.publishing_title')}</h3>
                                    <p className="text-gray-500">{t('admin.products.publishing_desc')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mb-8 px-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-lg shadow-blue-500/30">
                                {currentStep}
                            </span>
                            <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Étape {currentStep} sur 5</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                            {currentStep === 1 && t('admin.products.basic_info')}
                            {currentStep === 2 && t('admin.products.product_media')}
                            {currentStep === 3 && t('admin.products.variants_section')}
                            {currentStep === 4 && t('admin.products.category')}
                            {currentStep === 5 && t('admin.products.pricing_section')}
                        </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/50 shadow-inner">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
                            style={{ width: `${(currentStep / 5) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-8">
                        {currentStep === 1 && (
                            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-amber-600" />
                                        </div>
                                        {t('admin.products.basic_info')}
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">{t('admin.products.product_title')}</label>
                                        <Input
                                            value={title || ""}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={t('admin.products.title_placeholder')}
                                            className="bg-white border-gray-200 h-12 text-base focus:ring-blue-500/20 focus:border-blue-500 rounded-xl shadow-sm text-gray-900 pr-4"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">{t('admin.products.description')}</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full min-h-[180px] rounded-xl bg-white border border-gray-200 p-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-gray-700 resize-none shadow-sm"
                                            placeholder={t('admin.products.description_placeholder')}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {currentStep === 2 && (
                            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <ImageIcon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        {t('admin.products.product_media')}
                                    </h3>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 px-3 py-1 rounded-full">{images.length} images</Badge>
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
                        )}

                        {currentStep === 3 && (
                            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                            <Layers className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        {t('admin.products.variants_section')}
                                    </h3>
                                    <Button
                                        type="button"
                                        onClick={addVariant}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Ajouter manuellement
                                    </Button>
                                </div>
                                <div className="p-6">
                                    <div className="mb-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-indigo-900">Sélectionner les tailles</label>
                                            <div className="flex flex-wrap gap-2">
                                                {COMMON_SIZES.map(s => {
                                                    const isSelected = selectedSizes.includes(s)
                                                    return (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => toggleSizeSelection(s)}
                                                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-400"}`}
                                                        >
                                                            {s}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-indigo-900">Sélectionner les couleurs</label>
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
                                                            <div className="w-8 h-8 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }}>
                                                                {isSelected && <Check className={`w-4 h-4 m-auto mt-2 ${c.name === 'White' ? 'text-black' : 'text-white'}`} />}
                                                            </div>
                                                            <span className="text-[10px] uppercase font-bold text-gray-400">{c.name}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={generateCombinations}
                                            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                        >
                                            Générer les combinaisons
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {variants.map((v, i) => (
                                            <div key={i} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 relative group">
                                                <button onClick={() => removeVariant(i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-gray-400 uppercase">Taille</label>
                                                        <Input value={v.size || ""} onChange={(e) => updateVariant(i, "size", e.target.value)} className="h-10 bg-white" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-gray-400 uppercase">Couleur</label>
                                                        <Input value={v.color || ""} onChange={(e) => updateVariant(i, "color", e.target.value)} className="h-10 bg-white" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-gray-400 uppercase">Prix</label>
                                                        <Input type="number" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} className="h-10 bg-white" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-gray-400 uppercase">Stock</label>
                                                        <Input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} className="h-10 bg-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {currentStep === 4 && (
                            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                            <Tags className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        {t('admin.products.category')}
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Sélectionner la catégorie</label>
                                        <div className="relative">
                                            <select
                                                value={category || ""}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 appearance-none shadow-sm"
                                            >
                                                <option value="" disabled>Choisir une catégorie</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.slug || cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Statut du produit</label>
                                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                                            {['Draft', 'Active'].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => setStatus(s)}
                                                    className={`py-2 rounded-lg text-sm font-medium transition-all ${status === s ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}
                                                >
                                                    {s === 'Draft' ? 'Brouillon' : 'Actif'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {currentStep === 5 && (
                            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                        </div>
                                        {t('admin.products.pricing_section')}
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Prix de vente</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">MAD</span>
                                            <Input
                                                type="number"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                placeholder="0.00"
                                                className="bg-white border-gray-200 h-12 pl-14 text-lg font-mono rounded-xl shadow-sm focus:ring-blue-500/20 text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Prix de comparaison (Barré)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">MAD</span>
                                            <Input
                                                type="number"
                                                value={compareAtPrice}
                                                onChange={(e) => setCompareAtPrice(e.target.value)}
                                                placeholder="0.00"
                                                className="bg-white border-gray-200 h-12 pl-14 text-lg font-mono rounded-xl shadow-sm focus:ring-blue-500/20 text-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-lg">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={currentStep === 1}
                                className="rounded-xl px-6"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                            </Button>
                            
                            {currentStep < 6 ? (
                                <Button
                                    onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
                                    className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Suivant <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handlePublish}
                                    disabled={isPublishing || showSuccess}
                                    className="rounded-xl px-8 bg-green-600 hover:bg-green-700 text-white border-none"
                                >
                                    {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                    Publier le produit
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Magic AI Modal - Dedicated Premium Experience */}
                {showAIModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !aiAnalyzing && setShowAIModal(false)} />
                        
                        <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                            {/* Header */}
                            <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-indigo-50/50 to-white">
                                <div className="flex items-center justify-between pointer-events-auto">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                            <Wand2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Product Creator</h2>
                                            <p className="text-sm text-gray-500 font-medium">Capturez ou uploadez, l'IA fait le reste.</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => !aiAnalyzing && setShowAIModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-8">
                                {aiAnalyzing ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center pointer-events-none">
                                        <div className="relative mb-8">
                                            <div className="w-24 h-24 rounded-full border-4 border-indigo-100 flex items-center justify-center">
                                                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                                                <Zap className="w-10 h-10 text-indigo-600 animate-pulse" />
                                            </div>
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-bounce opacity-50" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-widest">{aiProcessingStage}</h3>
                                        <p className="text-gray-500 max-w-xs mx-auto font-medium">Gemini est en train de transformer votre image en un chef-d'œuvre marketing.</p>
                                        
                                        {capturedImage && (
                                            <div className="mt-8 relative w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-indigo-50 border-4 border-white rotate-2 grayscale-50 scale-95 opacity-50 transition-all duration-1000">
                                                <Image src={capturedImage} alt="Analysis" fill className="object-cover" />
                                            </div>
                                        )}
                                    </div>
                                ) : aiResult ? (
                                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="w-full md:w-1/3 aspect-square relative rounded-2xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-gray-100">
                                                <Image src={aiResult.proImage} alt="AI Generated" fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Titre suggéré</label>
                                                    <Input 
                                                        value={aiResult.title} 
                                                        onChange={(e) => setAIResult({...aiResult, title: e.target.value})}
                                                        className="font-bold text-gray-900 bg-gray-50/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Description</label>
                                                    <textarea 
                                                        value={aiResult.description} 
                                                        onChange={(e) => setAIResult({...aiResult, description: e.target.value})}
                                                        className="w-full min-h-[100px] p-3 text-sm rounded-xl bg-gray-50/50 border border-input focus:ring-2 focus:ring-indigo-500/20 text-gray-700 font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button 
                                                onClick={applyAIResult}
                                                className="flex-1 rounded-2xl h-14 text-lg font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 border-none"
                                            >
                                                <Check className="w-5 h-5 mr-2" /> APPLIQUER
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                onClick={() => handleAILoader(capturedImage!)}
                                                className="rounded-2xl h-14 px-8 border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 hover:text-indigo-600 transition-all"
                                            >
                                                <RefreshCw className="w-5 h-5 mr-2" /> RE-GÉNÉRER
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Camera Option */}
                                        <label className="flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-violet-500 hover:bg-violet-50/50 transition-all cursor-pointer group relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/0 group-hover:to-violet-500/5 transition-all" />
                                            <Camera className="w-12 h-12 text-gray-300 group-hover:text-violet-600 mb-4 transition-transform group-hover:scale-110 duration-300" />
                                            <span className="text-lg font-black text-gray-700 group-hover:text-violet-700">Appareil Photo</span>
                                            <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-wider">Prendre en direct</p>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                capture="environment" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        const reader = new FileReader()
                                                        reader.onload = (re) => handleAILoader(re.target?.result as string)
                                                        reader.readAsDataURL(file)
                                                    }
                                                }}
                                            />
                                        </label>

                                        {/* Upload Option */}
                                        <label className="flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer group relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/0 group-hover:to-indigo-500/5 transition-all" />
                                            <Upload className="w-12 h-12 text-gray-300 group-hover:text-indigo-600 mb-4 transition-transform group-hover:scale-110 duration-300" />
                                            <span className="text-lg font-black text-gray-700 group-hover:text-indigo-700">Galerie Photos</span>
                                            <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-wider">Importer fichier</p>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        const reader = new FileReader()
                                                        reader.onload = (re) => handleAILoader(re.target?.result as string)
                                                        reader.readAsDataURL(file)
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                )}

                                <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex items-center gap-3 text-gray-500">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Powered by Droutfit.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
