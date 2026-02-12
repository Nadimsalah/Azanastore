"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Upload, Save, RotateCcw, Loader2, Image as ImageIcon, Plus, Trash2, CheckCircle2, XCircle, Sparkles } from "lucide-react"
import { toast } from "sonner"
import {
    getHeroCarouselItems,
    updateHeroCarouselItem,
    uploadHeroCarouselImage,
    addHeroCarouselItem,
    deleteHeroCarouselItem,
    type HeroCarouselItem
} from "@/lib/supabase-api"
import { supabase } from "@/lib/supabase"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useLanguage } from "@/components/language-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function HeroCarouselPage() {
    const { t, language } = useLanguage()
    const [items, setItems] = useState<HeroCarouselItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)
    const [uploading, setUploading] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [products, setProducts] = useState<{ id: string, title: string }[]>([])

    useEffect(() => {
        loadCarouselItems()
        loadProducts()
    }, [])

    async function loadProducts() {
        const { data } = await supabase.from('products').select('id, title').eq('status', 'active')
        if (data) {
            setProducts(data)
        }
    }

    async function loadCarouselItems() {
        setLoading(true)
        const data = await getHeroCarouselItems(true)
        setItems(data)
        setLoading(false)
    }

    async function handleImageUpload(itemId: string, position: number, file: File) {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB')
            return
        }

        setUploading(itemId)
        const uploadToast = toast.loading(t('admin.carousel.uploading'))

        const result = await uploadHeroCarouselImage(file, position)

        if (result.success && result.url) {
            const updateResult = await updateHeroCarouselItem(itemId, { image_url: result.url })

            if (updateResult.success) {
                toast.success('Image uploaded successfully', { id: uploadToast })
                loadCarouselItems()
            } else {
                toast.error('Failed to update image', { id: uploadToast })
            }
        } else {
            toast.error(result.error || 'Failed to upload image', { id: uploadToast })
        }
        setUploading(null)
    }

    async function handleAddSlide() {
        const addToast = toast.loading('Adding new slide...')

        // Shift all existing slides down by 1 position
        const updatePromises = items.map(item =>
            updateHeroCarouselItem(item.id, { position: item.position + 1 })
        )
        await Promise.all(updatePromises)

        // Create new slide at position 1
        const newItem = {
            title: 'New Slide',
            subtitle: 'Add a description',
            image_url: '',
            position: 1,
            is_active: true
        }

        const result = await addHeroCarouselItem(newItem)

        if (result.success && result.data) {
            toast.success('Slide added! Now upload an image.', { id: addToast })
            // Reload all items to get updated positions
            loadCarouselItems()
            setEditingId(result.data.id)
        } else {
            toast.error(result.error || 'Failed to add slide', { id: addToast })
        }
    }

    async function handleDeleteSlide(id: string) {
        if (!confirm('Are you sure you want to delete this slide?')) return

        setDeleting(id)
        const deleteToast = toast.loading(t('admin.carousel.deleting'))
        const result = await deleteHeroCarouselItem(id)

        if (result.success) {
            toast.success('Slide deleted', { id: deleteToast })
            setItems(prev => prev.filter(item => item.id !== id))
        } else {
            toast.error(result.error || 'Failed to delete slide', { id: deleteToast })
        }
        setDeleting(null)
    }

    async function handleToggleActive(item: HeroCarouselItem) {
        const newStatus = !item.is_active
        if (newStatus && !item.image_url) {
            toast.error('Cannot activate a slide without an image')
            return
        }

        const updateToast = toast.loading(newStatus ? 'Activating...' : 'Deactivating...')
        const result = await updateHeroCarouselItem(item.id, { is_active: newStatus })

        if (result.success) {
            toast.success(newStatus ? 'Slide activated' : 'Slide deactivated', { id: updateToast })
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: newStatus } : i))
        } else {
            toast.error(result.error || 'Failed to update status', { id: updateToast })
        }
    }

    async function handleSaveItem(item: HeroCarouselItem) {
        setSaving(item.id)
        const result = await updateHeroCarouselItem(item.id, {
            title: item.title,
            subtitle: item.subtitle,
            link: item.link
        })

        if (result.success) {
            toast.success('Saved successfully')
            setEditingId(null)
        } else {
            toast.error(result.error || 'Failed to save')
        }
        setSaving(null)
    }

    function handleInputChange(id: string, field: 'title' | 'subtitle' | 'link', value: string) {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
        if (editingId !== id) setEditingId(id)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <AdminSidebar />

            <main className="lg:pl-72 lg:rtl:pl-0 lg:rtl:pr-72 p-4 sm:p-6 lg:p-8 min-h-screen relative z-10 transition-all duration-300">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-4 z-40 glass-strong p-4 rounded-3xl border border-white/5 shadow-lg shadow-black/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{t('admin.carousel.title')}</h1>
                            <p className="text-xs text-muted-foreground">{t('admin.carousel.subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={loadCarouselItems}
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {t('admin.carousel.refresh')}
                        </Button>
                        <Button
                            onClick={handleAddSlide}
                            size="sm"
                            className="rounded-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('admin.carousel.add_slide')}
                        </Button>
                    </div>
                </header>

                {/* Carousel Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="glass-strong rounded-3xl overflow-hidden border border-white/5 transition-all duration-300 hover:border-white/10 flex flex-col"
                        >
                            {/* Image Section */}
                            <div className="relative aspect-[4/3] bg-muted/20">
                                {/* Position Badge */}
                                <div className="absolute top-3 left-3 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {item.position}
                                </div>

                                {/* Status Badge */}
                                <button
                                    onClick={() => handleToggleActive(item)}
                                    className="absolute top-3 right-3 z-10"
                                >
                                    <Badge
                                        className={`${item.is_active
                                            ? 'bg-green-500/20 text-green-500 border-green-500/30'
                                            : 'bg-white/10 text-white/60 border-white/20'
                                            } backdrop-blur-md cursor-pointer hover:scale-105 transition-transform`}
                                    >
                                        {item.is_active ? (
                                            <><CheckCircle2 className="w-3 h-3 mr-1" /> {t('admin.carousel.active')}</>
                                        ) : (
                                            <><XCircle className="w-3 h-3 mr-1" /> {t('admin.carousel.inactive')}</>
                                        )}
                                    </Badge>
                                </button>

                                {/* Image or Placeholder */}
                                {item.image_url ? (
                                    <>
                                        <Image
                                            src={item.image_url}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                        {/* Upload Overlay */}
                                        <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center gap-2">
                                            <Upload className="w-8 h-8 text-white" />
                                            <span className="text-sm font-medium text-white px-4 py-2 rounded-full bg-white/10 border border-white/20">
                                                {t('admin.carousel.change_image')}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) handleImageUpload(item.id, item.position, file)
                                                }}
                                                disabled={uploading === item.id}
                                            />
                                        </label>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors">
                                        <ImageIcon className="w-12 h-12 text-muted-foreground/30 mb-2" />
                                        <span className="text-sm text-muted-foreground">{t('admin.carousel.no_image')}</span>
                                        <span className="text-xs text-muted-foreground/60 mt-1">{t('admin.carousel.upload_image')}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleImageUpload(item.id, item.position, file)
                                            }}
                                            disabled={uploading === item.id}
                                        />
                                    </label>
                                )}

                                {/* Uploading Overlay */}
                                {uploading === item.id && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-4 space-y-3 flex-1 flex flex-col">
                                {/* Title */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        {t('admin.carousel.slide_title')}
                                    </label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => handleInputChange(item.id, 'title', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-all text-sm"
                                        placeholder="Slide Title"
                                    />
                                </div>

                                {/* Subtitle */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        {t('admin.carousel.slide_subtitle')}
                                    </label>
                                    <input
                                        type="text"
                                        value={item.subtitle || ''}
                                        onChange={(e) => handleInputChange(item.id, 'subtitle', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-all text-sm"
                                        placeholder="Small text above title"
                                    />
                                </div>

                                {/* Product Link */}
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        {t('admin.carousel.linked_product')}
                                    </label>
                                    <select
                                        value={item.link || ''}
                                        onChange={(e) => handleInputChange(item.id, 'link', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-all text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-background">{t('admin.carousel.no_link')}</option>
                                        {products.map(p => (
                                            <option key={p.id} value={`/product/${p.id}`} className="bg-background">
                                                {p.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-4 border-t border-white/5 flex gap-2">
                                <Button
                                    onClick={() => handleSaveItem(item)}
                                    disabled={saving === item.id || editingId !== item.id}
                                    className="flex-1 rounded-xl"
                                    size="sm"
                                >
                                    {saving === item.id ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('admin.carousel.saving')}</>
                                    ) : (
                                        <><Save className="w-4 h-4 mr-2" /> {t('admin.carousel.save')}</>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleDeleteSlide(item.id)}
                                    disabled={deleting === item.id}
                                    variant="destructive"
                                    className="rounded-xl"
                                    size="sm"
                                >
                                    {deleting === item.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {items.length === 0 && (
                    <div className="text-center py-16">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                        <p className="text-muted-foreground mb-4">No slides yet. Add your first slide!</p>
                        <Button onClick={handleAddSlide} className="rounded-full">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('admin.carousel.add_slide')}
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}
