'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Upload, Save, RotateCcw, Loader2, Image as ImageIcon, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import {
    getHeroCarouselItems,
    updateHeroCarouselItem,
    uploadHeroCarouselImage,
    type HeroCarouselItem
} from '@/lib/supabase-api'

export default function HeroCarouselPage() {
    const [items, setItems] = useState<HeroCarouselItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    useEffect(() => {
        loadCarouselItems()
    }, [])

    async function loadCarouselItems() {
        setLoading(true)
        const data = await getHeroCarouselItems()
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

        const uploadToast = toast.loading('Uploading image...')

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
    }

    async function handleSaveItem(item: HeroCarouselItem) {
        setSaving(true)
        const result = await updateHeroCarouselItem(item.id, {
            title: item.title,
            subtitle: item.subtitle
        })

        if (result.success) {
            toast.success('Saved successfully')
            setEditingId(null)
        } else {
            toast.error(result.error || 'Failed to save')
        }
        setSaving(false)
    }

    function handleInputChange(id: string, field: 'title' | 'subtitle', value: string) {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Hero Carousel
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage the showcase images and content for your hero section
                    </p>
                </div>
                <button
                    onClick={loadCarouselItems}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Carousel Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="group relative rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 p-6 hover:border-primary/30 transition-all duration-300"
                    >
                        {/* Position Badge */}
                        <div className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{item.position}</span>
                        </div>

                        {/* Image Upload Area */}
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30 mb-4">
                            {item.image_url ? (
                                <Image
                                    src={item.image_url}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                                </div>
                            )}

                            {/* Upload Overlay */}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                                <div className="text-center">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-white" />
                                    <span className="text-sm text-white font-medium">Upload Image</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleImageUpload(item.id, item.position, file)
                                    }}
                                />
                            </label>
                        </div>

                        {/* Title Input */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleInputChange(item.id, 'title', e.target.value)}
                                    onFocus={() => setEditingId(item.id)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-colors text-sm"
                                    placeholder="Enter title"
                                />
                            </div>

                            {/* Subtitle Input */}
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Subtitle</label>
                                <input
                                    type="text"
                                    value={item.subtitle || ''}
                                    onChange={(e) => handleInputChange(item.id, 'subtitle', e.target.value)}
                                    onFocus={() => setEditingId(item.id)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none transition-colors text-sm"
                                    placeholder="Enter subtitle (optional)"
                                />
                            </div>

                            {/* Save Button */}
                            {editingId === item.id && (
                                <button
                                    onClick={() => handleSaveItem(item)}
                                    disabled={saving}
                                    className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Card */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                    Image Guidelines
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Recommended size: 800x800px (square aspect ratio)</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Supported formats: JPG, PNG, WebP</li>
                    <li>• Use high-quality, minimalist brand imagery for best results</li>
                </ul>
            </div>
        </div>
    )
}
