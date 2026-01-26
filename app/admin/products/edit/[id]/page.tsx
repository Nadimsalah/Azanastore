"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    ArrowLeft,
    Save,
    Sparkles,
    Upload,
    X,
    ChevronDown
} from "lucide-react"
import Link from "next/link"
import { getProductById } from "@/lib/supabase-api"
import { supabase } from "@/lib/supabase"

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
    const [ingredients, setIngredients] = useState("")
    const [howToUse, setHowToUse] = useState("")

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
                setIngredients(product.ingredients || "")
                setHowToUse(product.how_to_use || "")
            }

            setLoading(false)
        }

        if (productId) {
            loadProduct()
        }
    }, [productId])

    const handleSave = async () => {
        setSaving(true)

        const { error } = await supabase
            .from('products')
            .update({
                title,
                description,
                category,
                price: parseFloat(price),
                compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
                stock: parseInt(stock),
                sku,
                status,
                benefits,
                ingredients,
                how_to_use: howToUse,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId)

        setSaving(false)

        if (error) {
            alert('Error updating product: ' + error.message)
        } else {
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

            <main className="lg:pl-72 p-4 sm:p-6 lg:p-8 min-h-screen relative z-10 pb-24">
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
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Pure Argan Oil"
                                    className="h-12 text-base bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Description</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your product..."
                                    className="min-h-[120px] text-base bg-gray-50/50 border-gray-200 focus:bg-white transition-colors resize-none"
                                />
                            </div>
                        </section>

                        {/* Product Attributes */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Product Attributes</h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-gray-700">Key Benefits</label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={addBenefit}
                                        className="h-8 text-xs rounded-lg"
                                    >
                                        <Sparkles className="w-3 h-3 mr-1" /> Add Benefit
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {benefits.map((benefit, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={benefit}
                                                onChange={(e) => updateBenefit(index, e.target.value)}
                                                placeholder="e.g., Deeply moisturizes skin"
                                                className="flex-1 h-10 text-sm bg-gray-50/50 border-gray-200"
                                            />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => removeBenefit(index)}
                                                className="h-10 w-10 text-red-500 hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Ingredients</label>
                                <Textarea
                                    value={ingredients}
                                    onChange={(e) => setIngredients(e.target.value)}
                                    placeholder="List all ingredients..."
                                    className="min-h-[100px] text-sm bg-gray-50/50 border-gray-200 resize-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">How to Use</label>
                                <Textarea
                                    value={howToUse}
                                    onChange={(e) => setHowToUse(e.target.value)}
                                    placeholder="Usage instructions..."
                                    className="min-h-[100px] text-sm bg-gray-50/50 border-gray-200 resize-none"
                                />
                            </div>
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
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 appearance-none shadow-sm"
                                    >
                                        <option value="" disabled>Select Category</option>
                                        <option value="face">Face Care</option>
                                        <option value="body">Body Care</option>
                                        <option value="hair">Hair Care</option>
                                        <option value="gift">Gift Sets</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Status</label>
                                <div className="relative">
                                    <select
                                        value={status}
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
                                <label className="text-sm font-semibold text-gray-700">Price (EGP)</label>
                                <Input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="h-12 text-base bg-gray-50/50 border-gray-200"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Compare at Price (Optional)</label>
                                <Input
                                    type="number"
                                    value={compareAtPrice}
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
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    placeholder="0"
                                    className="h-12 text-base bg-gray-50/50 border-gray-200"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">SKU</label>
                                <Input
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="PROD-001"
                                    className="h-12 text-base bg-gray-50/50 border-gray-200"
                                />
                            </div>
                        </section>

                    </div>

                </div>

            </main>
        </div>
    )
}
