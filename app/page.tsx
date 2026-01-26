"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/components/cart-provider"
import { useLanguage } from "@/components/language-provider"
import { getProducts, getHeroCarouselItems, type Product } from "@/lib/supabase-api"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Search,
  ShoppingBag,
  Menu,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Leaf,
  Heart,
  Award,
  ChevronUp,
  ArrowRight,
  ChevronDown,
  X,
} from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { GlassCarousel3D } from "@/components/glass-carousel-3d"

// Countdown Timer Component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          hours = 23
          days--
        }
        if (days < 0) {
          return { days: 3, hours: 12, minutes: 45, seconds: 30 }
        }
        return { days, hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex gap-3 sm:gap-4">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="glass-strong rounded-2xl px-3 py-2 sm:px-4 sm:py-3 min-w-[50px] sm:min-w-[60px]">
            <span className="text-xl sm:text-2xl font-bold text-foreground">
              {value.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 capitalize">{unit}</span>
        </div>
      ))}
    </div>
  )
}

function CartCount() {
  const { cartCount } = useCart()
  if (cartCount === 0) return null
  return <>{cartCount}</>
}

// Product Card Component
function ProductCard(product: Product) {
  const { t } = useLanguage()
  const rating = 5 // Default rating since it's not in DB yet
  return (
    <Link href={`/product/${product.id}`} className="group glass rounded-3xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 block">
      <div className="aspect-square bg-gradient-to-br from-secondary to-muted rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{product.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < rating ? "fill-primary text-primary" : "text-muted"}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({rating}.0)</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-foreground">EGP {product.price}</span>
          <Button size="sm" className="rounded-full text-xs pointer-events-none">
            {t('product.add_to_cart')}
          </Button>
        </div>
      </div>
    </Link>
  )
}



// Collection Card Component
function CollectionCard({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: React.ElementType
}) {
  const { t } = useLanguage()
  return (
    <div className="group glass rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Link
        href="#"
        className="inline-flex items-center text-primary font-medium group-hover:gap-2 gap-1 transition-all"
      >
        {t('section.view_collection')} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

// Hero Carousel Component - Brand Showcase
function HeroCarousel({ products }: { products: Product[] }) {
  const [carouselItems, setCarouselItems] = useState<Array<{ image: string; title: string; subtitle: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCarouselItems() {
      const items = await getHeroCarouselItems()

      if (items.length > 0) {
        // Use database items
        setCarouselItems(items.map(item => ({
          image: item.image_url,
          title: item.title,
          subtitle: item.subtitle || ''
        })))
      } else {
        // Fallback to default showcase items
        setCarouselItems([
          {
            image: '/hero-showcase-1.jpg',
            title: 'The Secret of Moroccan Beauty',
            subtitle: 'Pure • Natural • Timeless'
          },
          {
            image: '/hero-showcase-2.jpg',
            title: 'Handcrafted Excellence',
            subtitle: 'From Morocco with Love'
          },
          {
            image: '/hero-showcase-3.jpg',
            title: 'Liquid Gold',
            subtitle: 'Cold Pressed Argan Oil'
          },
          {
            image: '/hero-showcase-4.jpg',
            title: 'Natural Radiance',
            subtitle: '100% Organic • Certified'
          },
          {
            image: '/hero-showcase-5.jpg',
            title: 'Beauty Ritual',
            subtitle: 'Ancient Wisdom • Modern Care'
          },
          {
            image: '/hero-showcase-6.jpg',
            title: 'Diar Argan',
            subtitle: 'Authentic Moroccan Skincare'
          }
        ])
      }

      setLoading(false)
    }

    loadCarouselItems()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="animate-pulse text-muted-foreground">Loading carousel...</div>
      </div>
    )
  }

  return <GlassCarousel3D items={carouselItems} autoPlayInterval={3000} />
}

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [visibleProducts, setVisibleProducts] = useState(4)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const { t, language, toggleLanguage, dir } = useLanguage()

  // Cart context is now available but we need to create a client component wrapper 
  // or accept that HomePage is a client component (which it already is: "use client" is missing but useState implies it)
  // Let's check imports to see if "use client" is needed or if it's already there


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      setShowBackToTop(window.scrollY > 500)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<{ id: string, name: string, slug: string }[]>([])

  // Fetch products from Supabase
  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      const data = await getProducts({ status: 'active', limit: 20 })
      setProducts(data)
      setLoading(false)
    }
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (data) {
        setCategories(data)
      }
    }
    loadProducts()
    loadCategories()
  }, [])

  const allCategories = ["All", ...categories.map(c => c.slug)]

  const getCategoryLabel = (cat: string) => {
    if (cat === "All") return t('section.all_categories')
    const category = categories.find(c => c.slug === cat)
    if (category) return category.name
    // Fallback to translation keys for default categories
    const categoryMap: Record<string, string> = {
      face: t('header.face_care'),
      hair: t('header.hair_care'),
      body: t('header.body_care'),
      gift: t('header.gift_sets')
    }
    return categoryMap[cat] || cat
  }

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(p => p.category === selectedCategory)



  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q6'), a: t('faq.a6') },
  ]

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-secondary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
        <p>Free shipping on orders over EGP 500 | Use code <span className="font-semibold">ARGAN20</span> for 20% off</p>
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled ? "glass-strong py-2" : "bg-transparent py-4"
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 relative group">
              <Image
                src="/logo.webp"
                alt="Diar Argan"
                width={120}
                height={60}
                className="h-10 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation - Modern Mega Menu */}
            <NavigationMenu className="hidden lg:flex" delayDuration={0}>
              <NavigationMenuList className="gap-1">
                {/* Shop Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary hover:bg-primary/5 data-[state=open]:bg-primary/5 data-[state=open]:text-primary font-medium px-4 py-2 rounded-full transition-all duration-200">
                    {t('nav.shop')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="glass-liquid w-[600px] p-2 rounded-[2rem] overflow-hidden">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-6">
                          <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> {t('header.categories')}
                          </h3>
                          <div className="space-y-2">
                            {[
                              { name: t('header.face_care'), desc: t('header.face_care_desc') },
                              { name: t('header.hair_care'), desc: t('header.hair_care_desc') },
                              { name: t('header.body_care'), desc: t('header.body_care_desc') },
                              { name: t('header.gift_sets'), desc: t('header.gift_sets_desc') },
                            ].map((item) => (
                              <NavigationMenuLink key={item.name} asChild>
                                <Link
                                  href="#shop"
                                  className="block p-3 rounded-2xl hover:bg-white/20 transition-all duration-300 group"
                                >
                                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">{item.name}</span>
                                  <p className="text-sm text-foreground/60">{item.desc}</p>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-primary/10 via-secondary/20 to-primary/5 p-6 rounded-[1.5rem] flex flex-col justify-between m-2 border border-white/20">
                          <div>
                            <span className="inline-block px-3 py-1 bg-white/50 backdrop-blur-md text-primary text-xs font-bold rounded-full mb-4 shadow-sm border border-white/20">{t('header.new_arrival')}</span>
                            <h4 className="font-bold text-foreground text-xl mb-2">{t('header.argan_elixir')}</h4>
                            <p className="text-sm text-foreground/70 mb-6 leading-relaxed">{t('header.argan_elixir_desc')}</p>
                          </div>
                          <Button size="sm" className="rounded-full w-full shadow-lg shadow-primary/20">{t('nav.shop_now')}</Button>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Collections Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary hover:bg-primary/5 data-[state=open]:bg-primary/5 data-[state=open]:text-primary font-medium px-4 py-2 rounded-full transition-all duration-200">
                    {t('nav.collections')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="glass-liquid w-[500px] p-2 rounded-[2rem] overflow-hidden">
                      <div className="grid grid-cols-3 gap-2 p-2">
                        {[
                          { name: t('header.signature'), icon: Sparkles, color: "from-primary/10 to-primary/5" },
                          { name: t('header.essentials'), icon: Leaf, color: "from-secondary to-secondary/50" },
                          { name: t('header.premium'), icon: Award, color: "from-primary/5 to-secondary/10" },
                        ].map((item) => (
                          <NavigationMenuLink key={item.name} asChild>
                            <Link
                              href="#collections"
                              className="flex flex-col items-center text-center p-4 rounded-[1.5rem] hover:bg-white/20 transition-all duration-300 group hover:-translate-y-1"
                            >
                              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner border border-white/20`}>
                                <item.icon className="w-6 h-6 text-primary" />
                              </div>
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                      <div className="p-4 border-t border-white/10 bg-white/5 mx-2 mb-2 rounded-[1.25rem]">
                        <Link href="#collections" className="flex items-center justify-center gap-2 text-sm text-primary font-bold hover:gap-3 transition-all uppercase tracking-wide">
                          {t('nav.view_all_collections')} <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Simple Links */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="#about"
                      className="text-foreground/80 hover:text-primary hover:bg-primary/5 font-medium px-4 py-2 rounded-full transition-all duration-200 inline-flex"
                    >
                      {t('nav.about')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="#faq"
                      className="text-foreground/80 hover:text-primary hover:bg-primary/5 font-medium px-4 py-2 rounded-full transition-all duration-200 inline-flex"
                    >
                      {t('nav.faq')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full hover:bg-primary/5 hover:text-primary transition-all">
                <Search className="w-5 h-5" />
              </Button>

              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/5 hover:text-primary transition-all group">
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-semibold group-hover:scale-110 transition-transform">
                    <CartCount />
                  </span>
                </Button>
              </Link>
              <Button
                onClick={toggleLanguage}
                className="hidden sm:flex rounded-full ml-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 font-bold"
              >
                {language === 'en' ? 'العربية' : 'English'}
              </Button>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] p-0 border-0">
                  <div className="flex flex-col h-full bg-background">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border/50">
                      <Image
                        src="/logo.webp"
                        alt="Diar Argan"
                        width={100}
                        height={50}
                        className="h-10 w-auto"
                      />
                    </div>

                    {/* Mobile Menu Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <nav className="space-y-2">
                        {/* Shop Section */}
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="shop" className="border-0">
                            <AccordionTrigger className="py-4 text-lg font-medium text-foreground hover:text-primary hover:no-underline">
                              Shop
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <div className="space-y-2 pl-4">
                                {["Face Care", "Hair Care", "Body Care", "Gift Sets"].map((item) => (
                                  <Link
                                    key={item}
                                    href="#shop"
                                    className="block py-2 text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    {item}
                                  </Link>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="collections" className="border-0">
                            <AccordionTrigger className="py-4 text-lg font-medium text-foreground hover:text-primary hover:no-underline">
                              Collections
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <div className="space-y-2 pl-4">
                                {["Signature", "Essentials", "Premium"].map((item) => (
                                  <Link
                                    key={item}
                                    href="#collections"
                                    className="block py-2 text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    {item}
                                  </Link>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <Link
                          href="#about"
                          className="block py-4 text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          About
                        </Link>
                        <Link
                          href="#faq"
                          className="block py-4 text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          FAQ
                        </Link>
                      </nav>

                      {/* Mobile Promo Card */}
                      <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/20">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">Limited Offer</span>
                        <p className="font-medium text-foreground">20% off your first order</p>
                        <p className="text-sm text-muted-foreground mt-1">Use code ARGAN20</p>
                      </div>
                    </div>

                    {/* Mobile Menu Footer */}
                    <div className="p-6 border-t border-border/50 space-y-3">
                      <Button className="w-full rounded-full shadow-lg shadow-primary/20">
                        Shop Now
                      </Button>
                      <Button variant="outline" className="w-full rounded-full bg-transparent">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                {t('hero.title_prefix')} <span className="text-primary">{t('hero.title_suffix')}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full text-base px-8">
                  {t('hero.shop_collection')}
                </Button>
                <Button size="lg" variant="outline" className="rounded-full text-base px-8 bg-transparent">
                  {t('hero.explore_best_sellers')}
                </Button>
              </div>
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-sm">{t('hero.fast_delivery')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="text-sm">{t('hero.secure_checkout')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <span className="text-sm">{t('hero.easy_returns')}</span>
                </div>
              </div>
            </div>

            {/* Hero 3D Glass Carousel */}
            <div className="relative">
              {products.length > 0 ? (
                <HeroCarousel products={products.slice(0, 6)} />
              ) : (
                <div className="glass rounded-[2rem] p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/20" />
                  <div className="relative aspect-square bg-gradient-to-br from-secondary to-muted rounded-2xl flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-16 h-16 text-primary" />
                      </div>
                      <p className="text-xl font-semibold text-foreground">Loading Products...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>



      {/* Best Sellers */}
      <section id="shop" className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('section.best_sellers')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('section.best_sellers_desc')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {allCategories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`rounded-full px-6 transition-all duration-300 ${selectedCategory === cat
                  ? "shadow-lg shadow-primary/25 scale-105"
                  : "hover:scale-105"
                  }`}
                onClick={() => {
                  setSelectedCategory(cat)
                  setVisibleProducts(4) // Reset visible count on switch
                }}
              >
                {getCategoryLabel(cat)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-500">
            {filteredProducts.slice(0, visibleProducts).map((product, i) => (
              <ProductCard key={`${product.id}-${selectedCategory}`} {...product} />
            ))}
          </div>
          {visibleProducts < filteredProducts.length && (
            <div className="text-center mt-10">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full bg-transparent"
                onClick={() => setVisibleProducts(prev => prev + 4)}
              >
                {t('section.load_more')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="glass rounded-[2rem] p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/10" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
                {t('section.why_choose')}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { icon: Leaf, title: t('section.organic'), desc: t('section.organic_desc') },
                  { icon: Award, title: t('section.award_winning'), desc: t('section.award_winning_desc') },
                  { icon: Heart, title: t('section.cruelty_free'), desc: t('section.cruelty_free_desc') },
                  { icon: Sparkles, title: t('section.handcrafted'), desc: t('section.handcrafted_desc') },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Promo Banner */}
      <section className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="glass rounded-[2rem] p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10" />
            <div className="relative space-y-6">
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {t('section.limited_offer')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                {t('section.promo_title')}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t('section.promo_desc')}
              </p>
              <div className="flex justify-center py-4">
                <CountdownTimer />
              </div>
              <Button size="lg" className="rounded-full text-base px-8">
                {t('section.get_offer')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('faq.title')}</h2>
            <p className="text-muted-foreground">
              {t('faq.subtitle')}
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass rounded-2xl px-6 border-none"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="glass rounded-[2rem] p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10" />
            <div className="relative space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('newsletter.title')}</h2>
              <p className="text-muted-foreground">
                {t('newsletter.desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder={t('newsletter.placeholder')}
                  className="rounded-full h-12 px-6 bg-background/80"
                />
                <Button className="rounded-full h-12 px-8">{t('newsletter.subscribe')}</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('newsletter.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">{t('footer.our_story')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{t('footer.sustainability')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{t('footer.press')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{t('footer.careers')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">{t('footer.contact_us')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{t('nav.faq')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{t('footer.shipping_info')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{t('footer.track_order')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">{t('footer.privacy_policy')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{t('footer.terms')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{t('footer.refund_policy')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{t('footer.cookies')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Image
              src="/logo.webp"
              alt="Diar Argan"
              width={100}
              height={50}
              className="h-10 w-auto"
            />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Diar Argan. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 glass-strong rounded-full p-3 shadow-lg transition-all duration-300 z-50 hover:scale-110 ${showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        aria-label="Back to top"
      >
        <ChevronUp className="w-5 h-5 text-foreground" />
      </button>
    </div>
  )
}
