"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCart } from "@/components/cart-provider"
import { useLanguage } from "@/components/language-provider"
import { getProductById, getProducts, type Product } from "@/lib/supabase-api"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
    ShoppingBag, 
    Star, 
    Minus, 
    Plus, 
    Truck, 
    ShieldCheck, 
    RotateCcw, 
    Check, 
    Sparkles, 
    Search,
    Share2,
    Heart,
    X,
    Maximize2
} from "lucide-react"
import { ProductDetailsSkeleton } from "@/components/ui/store-skeletons"
import { motion, AnimatePresence } from "framer-motion"

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  const router = useRouter()
  const { addItem, cartCount } = useCart()
  const { t, language } = useLanguage()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  
  // VTO State
  const [showVTO, setShowVTO] = useState(false)
  const MERCHANT_ID = "dr_8a95106b85940e83d121d818513a06f57164d7b858084a59"

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    async function loadData() {
      // Prevent fetching if params aren't ready (Next.js [id] literal or empty)
      if (!productId || productId === '[id]' || productId.length < 10) {
        console.log(`[DEBUG] Syncing params... (Current: ${productId})`)
        return
      }

      setLoading(true)
      setProduct(null) // Reset while loading
      
      try {
        console.log(`[DEBUG] Initiating product fetch for: ${productId}`)
        const data = await getProductById(productId)
        setProduct(data)

        if (data) {
          const related = await getProducts({
            category: data.category || undefined,
            limit: 4,
            status: 'active'
          })
          setRelatedProducts(related.filter(p => p.id !== data.id))
        }
      } catch (err) {
        console.error("[DEBUG] Fetch failed:", err)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [productId])

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0]
      setSelectedSize(firstVariant.size)
      setSelectedColor(firstVariant.color)
    }
  }, [product])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
    setSelectedImage(0)
    setQuantity(1)
  }, [productId])

  // Listen for close message from the VTO Widget
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
        if (e.data && e.data.type === 'droutfit-close') {
            setShowVTO(false)
        }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleImageScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft
    const width = e.currentTarget.offsetWidth
    const newIdx = Math.round(scrollLeft / width)
    if (newIdx !== selectedImage) setSelectedImage(newIdx)
  }

  if (loading) return <div className="min-h-screen bg-background"><ProductDetailsSkeleton /></div>

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">{t('product.not_found')}</h2>
            <p className="text-muted-foreground mb-8 font-medium">This product might have been moved or removed.</p>
            <Button asChild variant="outline" className="rounded-2xl px-8 h-12 font-bold hover:bg-primary hover:text-white border-primary/20">
                <Link href="/">{t('product.return_home')}</Link>
            </Button>
        </div>
      </div>
    )
  }

  const isArabic = language === 'ar'
  const displayTitle = isArabic && product.title_ar ? product.title_ar : product.title
  const displayDescription = isArabic && product.description_ar ? product.description_ar : product.description || ""
  const displayBenefits = isArabic && product.benefits_ar ? product.benefits_ar : product.benefits || []
  const displaySizeGuide = isArabic && product.size_guide_ar ? product.size_guide_ar : product.size_guide || ""
  const productImages = (product.images && product.images.length > 0) ? product.images : ["/placeholder.svg?height=800&width=800"]
  
  const selectedVariant = product.variants?.find(v => {
    const sizeMatch = selectedSize ? v.size === selectedSize : (v.size === null || v.size === "")
    const colorMatch = selectedColor ? v.color === selectedColor : (v.color === null || v.color === "")
    return sizeMatch && colorMatch
  })

  const displayPrice = selectedVariant ? selectedVariant.price : product.price
  const displayStock = selectedVariant
    ? selectedVariant.stock
    : (product.variants && product.variants.length > 0)
      ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
      : product.stock || 0
  const currentInStock = displayStock > 0

  const COMMON_COLORS_MAP: Record<string, string> = {
    "Black": "#000000", "White": "#FFFFFF", "Navy": "#000080", "Beige": "#F5F5DC",
    "Pink": "#FFC0CB", "Red": "#FF0000", "Green": "#008000", "Blue": "#0000FF",
    "Grey": "#808080", "Gold": "#FFD700", "Silver": "#C0C0C0"
  }

  const sizes = Array.from(new Set(product.variants?.map(v => v.size).filter(s => s !== null && s !== "") as string[]))
  const colors = Array.from(new Set(product.variants?.map(v => v.color).filter(c => c !== null && c !== "") as string[]))

  // DrOutfit Widget URL Construction - Local Dev Mode
  const productImg = productImages[0]
  const localHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const fullImagePath = productImg?.startsWith('http') ? productImg : `${localHost}${productImg}`
  const vtoUrl = `http://localhost:3001/widget/${productId}?merchant_id=${MERCHANT_ID}&name=${encodeURIComponent(displayTitle)}&image=${encodeURIComponent(fullImagePath)}`

  return (
    <div className="min-h-screen bg-white pb-32 lg:pb-20 overflow-x-hidden">
      {/* Dynamic Header */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b ${
        scrolled ? "bg-white/80 backdrop-blur-xl border-gray-100 py-3" : "bg-transparent border-transparent py-5"
      }`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0 transition-transform active:scale-95">
            <Image src="/logo.webp" alt="Logo" width={100} height={50} className={`h-8 sm:h-10 w-auto transition-all ${!scrolled && "brightness-100"}`} />
          </Link>

          <div className="flex items-center gap-2">
            <button onClick={() => {}} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <Search className="w-5 h-5 text-gray-900" />
            </button>
            <Link href="/cart" className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <ShoppingBag className="w-5 h-5 text-gray-900" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg transform translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-0 sm:px-4 lg:pt-32 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 items-start">
          
          {/* Mobile Image Slider / Desktop Gallery */}
          <div className="relative lg:sticky lg:top-32 self-start mb-8 lg:mb-0">
            {/* Desktop thumbnails (Hidden on mobile) */}
            <div className="hidden lg:flex absolute -left-20 top-0 flex-col gap-4">
              {productImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all p-1 ${
                    selectedImage === idx ? "border-primary shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover rounded-lg" alt="" />
                </button>
              ))}
            </div>

            {/* Main Content (Snap Slider on Mobile) */}
            <div className="relative group overflow-hidden bg-gray-50 lg:rounded-[2.5rem] lg:shadow-2xl lg:shadow-black/5">
                <div 
                    ref={scrollRef}
                    onScroll={handleImageScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide lg:overflow-hidden"
                >
                    {productImages.map((img, idx) => (
                        <div key={idx} className="flex-none w-full snap-center aspect-[4/5] lg:aspect-square relative">
                            <Image 
                                src={img} 
                                alt={displayTitle} 
                                fill 
                                className="object-cover lg:group-hover:scale-105 transition-transform duration-700"
                                priority={idx === 0}
                            />
                        </div>
                    ))}
                </div>

                {/* Navigation Dots (Mobile) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 lg:hidden">
                    {productImages.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`transition-all duration-300 rounded-full h-1.5 ${
                                selectedImage === idx ? "w-6 bg-primary" : "w-1.5 bg-gray-300"
                            }`} 
                        />
                    ))}
                </div>

                {/* Share/Wishlist buttons */}
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                    <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-900 active:scale-90 transition-transform">
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-900 active:scale-90 transition-transform">
                        <Heart className="w-4 h-4" />
                    </button>
                </div>

                {/* DrOutfit VTO floating trigger for mobile (On top of image) */}
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowVTO(true)}
                    className="absolute bottom-10 right-6 lg:hidden bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center gap-2 text-xs font-black uppercase tracking-widest z-20"
                >
                    <Sparkles className="w-4 h-4 animate-pulse" /> Try It On
                </motion.button>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="px-6 sm:px-0">
            {/* Tag/Category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-3 py-1 rounded-full">
                        {product.category || 'Collection'}
                    </span>
                    <div className="h-4 w-px bg-gray-100" />
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-gray-900">5.0</span>
                    </div>
                </div>

                {/* Desktop VTO Trigger */}
                <Button 
                    variant="outline" 
                    onClick={() => setShowVTO(true)}
                    className="hidden lg:flex rounded-2xl border-indigo-100 bg-indigo-50/20 text-indigo-600 font-black uppercase tracking-widest text-[10px] h-10 px-6 hover:bg-indigo-600 hover:text-white transition-all gap-2"
                >
                    <Sparkles className="w-3.5 h-3.5" /> Virtual Try-On ✨
                </Button>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-tight">
                {displayTitle}
            </h1>

            <div className="flex items-baseline gap-4 mb-8">
                <span className="text-5xl font-black text-primary tracking-tighter">{displayPrice}<span className="text-sm italic uppercase ml-1">{t('common.currency')}</span></span>
                {product.compare_at_price && (
                  <span className="text-2xl text-gray-300 line-through font-bold">
                    {product.compare_at_price}
                  </span>
                )}
            </div>

            {/* Description (Mobile optimized) */}
            <div className="mb-10 p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">
                    {displayDescription}
                </p>
            </div>

            {/* Variant Selectors */}
            <div className="space-y-10 mb-12">
               {sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('product.select_size')}</span>
                    <button className="text-[10px] font-black text-primary uppercase underline underline-offset-4">{t('product.size_guide')}</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[4rem] h-14 rounded-2xl border-2 transition-all font-black flex items-center justify-center text-sm ${
                          selectedSize === size
                          ? "border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-[1.05]"
                          : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
               )}

               {colors.length > 0 && (
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">{t('product.select_color')}</span>
                  <div className="flex flex-wrap gap-4">
                    {colors.map(color => {
                      const hex = COMMON_COLORS_MAP[color] || '#CCCCCC';
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`flex flex-col items-center gap-3 transition-opacity ${!isSelected && "opacity-60 hover:opacity-100"}`}
                        >
                          <div 
                            className={`w-14 h-14 rounded-full border-4 shadow-sm flex items-center justify-center transition-all ${
                                isSelected ? "border-primary scale-110 shadow-lg shadow-primary/10" : "border-white"
                            }`}
                            style={{ backgroundColor: hex }}
                          >
                            {isSelected && <Check className={`w-6 h-6 ${color === 'White' || color === 'Beige' ? 'text-black' : 'text-white'}`} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
               )}
            </div>

            {/* Details Accordion */}
            <Accordion type="single" collapsible className="space-y-4 mb-16">
              {displayBenefits.length > 0 && (
                <AccordionItem value="benefits" className="border-none">
                  <AccordionTrigger className="h-16 px-8 rounded-3xl bg-gray-50 border-none hover:no-underline font-black text-sm uppercase tracking-widest text-gray-900 group">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-primary" />
                      {t('product.key_benefits')}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-8 pt-4">
                    <ul className="space-y-4">
                      {displayBenefits.map((benefit, idx) => (
                        <li key={idx} className="flex gap-4 items-start text-sm font-medium text-gray-500">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {displaySizeGuide && (
                <AccordionItem value="size" className="border-none">
                  <AccordionTrigger className="h-16 px-8 rounded-3xl bg-gray-50 border-none hover:no-underline font-black text-sm uppercase tracking-widest text-gray-900 group">
                    <div className="flex items-center gap-3">
                      <RotateCcw className="w-5 h-5 text-primary" />
                      Size Guide & Measurements
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-8 pt-4 text-sm font-medium text-gray-500 leading-relaxed whitespace-pre-line">
                    {displaySizeGuide}
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {/* Trust Factors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Truck, label: "LIVRAISON PARTOUT", sub: "Expédition en 24/48h" },
                  { icon: ShieldCheck, label: "QUALITÉ GARANTIE", sub: "Produits authentiques" },
                  { icon: RotateCcw, label: "RETOUR SIMPLE", sub: "14 jours pour échanger" }
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white border border-gray-50 shadow-sm flex flex-col items-center text-center">
                    <item.icon className="w-6 h-6 text-primary mb-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-1">{item.label}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{item.sub}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="mt-32 px-6 sm:px-4">
                <div className="flex items-end justify-between mb-12">
                   <div>
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-2 block">DISCOVER MORE</span>
                       <h2 className="text-4xl font-black text-gray-900 tracking-tighter">You May Also Like</h2>
                   </div>
                   <Link href="/#shop" className="text-sm font-black text-primary uppercase underline underline-offset-8">Browse All</Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map(item => (
                        <Link key={item.id} href={`/product/${item.id}`} className="group">
                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-50 mb-6 relative shadow-lg shadow-black/5">
                                <Image 
                                    src={item.images?.[0] || "/placeholder.svg"} 
                                    alt={item.title} 
                                    fill 
                                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="font-black text-gray-900 text-sm md:text-lg mb-2 truncate group-hover:text-primary transition-colors">
                                {isArabic && item.title_ar ? item.title_ar : item.title}
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-black text-primary">{item.price}<span className="text-[10px] ml-0.5">MAD</span></span>
                                {item.compare_at_price && <span className="text-sm text-gray-300 line-through font-bold">{item.compare_at_price}</span>}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}
      </main>

      {/* Floating Action Bar (Optimized for Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-[110] lg:pb-8 pb-4 px-4 pointer-events-none">
        <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="container mx-auto max-w-2xl bg-white/90 backdrop-blur-2xl p-4 rounded-[2.5rem] shadow-2xl shadow-indigo-200 border border-white/40 pointer-events-auto flex gap-3 h-20 items-center"
        >
          {/* Quantity Micro-control */}
          <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-2xl h-full border border-gray-100">
            <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-gray-900 active:scale-90 transition-all"
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-black text-lg text-gray-900">{quantity}</span>
            <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-gray-900 active:scale-90 transition-all"
            >
                <Plus className="w-4 h-4" />
            </button>
          </div>

          <Button
            size="lg"
            disabled={!currentInStock}
            className={`flex-1 h-full rounded-2xl text-base font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                currentInStock ? "bg-primary hover:bg-black shadow-primary/20" : "bg-gray-200 cursor-not-allowed text-gray-400 shadow-none"
            }`}
            onClick={() => {
              addItem({
                id: product.id,
                name: product.title,
                nameAr: product.title_ar || undefined,
                price: Number(displayPrice),
                image: productImages[0],
                quantity: quantity,
                size: selectedSize || undefined,
                color: selectedColor || undefined,
                inStock: currentInStock,
              })
              router.push("/cart")
            }}
          >
            <ShoppingBag className="w-5 h-5 mr-3" />
            {currentInStock ? (
                <>
                    <span className="hidden sm:inline">{t('product.add_to_cart')} • </span> 
                    { (displayPrice * quantity).toFixed(0) } <span className="text-[10px] ml-1">MAD</span>
                </>
            ) : "Out of Stock"}
          </Button>
        </motion.div>
      </div>

      {/* DrOutfit VTO Overlay */}
      <AnimatePresence>
        {showVTO && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            >
                <div className="absolute inset-0" onClick={() => setShowVTO(false)} />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-[480px] h-full max-h-[90vh] bg-white rounded-[2rem] overflow-hidden shadow-2xl"
                >
                    {/* Header with close button */}
                    <div className="absolute top-4 right-4 z-10">
                        <button 
                            onClick={() => setShowVTO(false)}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all border border-gray-100/50 backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* VTO Iframe */}
                    <iframe 
                        src={vtoUrl}
                        title="Virtual Try-On"
                        className="w-full h-full border-none"
                        allow="camera"
                    />

                    {/* Branding/Tip */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                        <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">Powered by Droutfit.com</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
