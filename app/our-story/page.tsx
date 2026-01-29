"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Globe2, MapPin, Droplets, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export default function OurStoryPage() {
  const { language } = useLanguage()
  const isArabic = language === "ar"

  return (
    <div className={`min-h-screen bg-background ${isArabic ? "font-[var(--font-almarai)]" : ""}`}>
      {/* Top Bar */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isArabic ? "العودة إلى الصفحة الرئيسية" : "Back to Home"}</span>
            </Link>
          <Link href="/" className="flex-shrink-0 relative group">
            <Image
              src="/logo.webp"
              alt="Azana boutique logo"
              width={120}
              height={60}
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary/10">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />
        </div>

          <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className={`space-y-6 ${isArabic ? "text-right" : ""}`}>
            <p className="text-xs font-semibold tracking-[0.35em] uppercase text-primary/80">
              {isArabic ? "منذ 2010 • أزياء نسائية راقية" : "Since 2010 • Boutique Women’s Fashion"}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {isArabic ? (
                <>
                  حكايتنا في <span className="text-primary">أزانا</span>
                </>
              ) : (
                <>
                  Our Story at <span className="text-primary">Azana</span>
                </>
              )}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {isArabic
                ? "أزانا بدأت كفكرة بسيطة: متجر صغير يقدم فساتين نسائية أنيقة ومريحة تناسب الحياة اليومية والمناسبات الخاصة. بمرور الوقت تحوّل هذا الشغف بالأقمشة والتفاصيل إلى علامة متخصصة في الأزياء الراقية للمرأة."
                : "Azana began as a small boutique with one clear dream: create elegant, comfortable women’s clothing that feels special every day. Over time, that love for fabrics, fit, and detail grew into a dedicated brand for boutique & luxury women’s fashion."}
            </p>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {isArabic
                ? "اليوم نقدّم مجموعات متجددة من الفساتين والقطع الأساسية والقطع المميزة التي صُممت بعناية لتعبّر عن أسلوبك وتبرز ثقتك. في أزانا، الجودة والقصّة المريحة هما جوهر كل تصميم."
                : "Today, we design curated drops of dresses, elevated basics, and statement pieces that help you express your style and feel confident. At Azana, thoughtful quality and a flattering fit sit at the heart of every design."}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.2em]">
                <Droplets className="w-3.5 h-3.5" />
                {isArabic ? "خامات مختارة بعناية" : "Carefully selected fabrics"}
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold uppercase tracking-[0.2em]">
                <Sparkles className="w-3.5 h-3.5" />
                {isArabic ? "تفاصيل أنثوية فاخرة" : "Feminine, luxury details"}
              </div>
            </div>
            <div className={`mt-4 space-y-2 ${isArabic ? "text-right" : ""}`}>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isArabic
                  ? "نعمل مع مورّدين موثوقين وخياطات محترفات لنضمن أن كل قطعة تلتزم بمعايير عالية من الجودة والراحة."
                  : "We partner with trusted fabric suppliers and experienced ateliers to ensure every piece meets our standards for comfort, quality, and longevity."}
              </p>
              <div className="flex flex-wrap items-center gap-4 opacity-80">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <Image
                    src="/certifications/1.png"
                    alt={isArabic ? "شهادة جودة" : "Quality certification logo"}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <Image
                    src="/certifications/2.png"
                    alt={isArabic ? "شهادة نقاء" : "Purity certification logo"}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <Image
                    src="/certifications/3.png"
                    alt={isArabic ? "شهادة مستحضرات تجميل" : "Cosmetics certification logo"}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visual Story (placeholder images – replace with Anobanana renders if desired) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
                <Image
                  src="/hero-showcase-1.jpg"
                  alt="Argan trees in the Moroccan sun"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl shadow-black/10">
                <Image
                  src="/hero-showcase-2.jpg"
                  alt="Cold-pressed argan oil in glass bottle"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 translate-y-6 sm:translate-y-10">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl shadow-black/10">
                <Image
                  src="/hero-showcase-3.jpg"
                  alt="Artisanal argan oil products"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
                <Image
                  src="/hero-showcase-4.jpg"
                  alt="Luxury argan-based care ritual"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline / Story */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          <div className="grid md:grid-cols-[1fr_minmax(0,2fr)] gap-8 md:gap-12 items-start">
            <div className={`space-y-4 ${isArabic ? "text-right" : ""}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.2em]">
                <Globe2 className="w-3.5 h-3.5" />
                {isArabic ? "من البوتيك إلى خزانتك" : "From our boutique to your wardrobe"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isArabic ? "نصمم أزياءً تعيش معك طويلاً" : "Designing pieces that live in your wardrobe"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {isArabic
                  ? "منذ انطلاقة أزانا، تركّزنا على تصميم قطع يمكن ارتداؤها بطرق متعددة وتبقى أنيقة عاماً بعد عام. ما بدأ بفستان واحد مميز أصبح اليوم مجموعات كاملة تناسب أسلوب حياة المرأة العصرية."
                  : "Since the beginning, Azana has focused on clothing that can be styled many ways and still feel current season after season. What started as one signature dress has grown into full collections for the modern woman’s everyday life."}
              </p>
            </div>
            <div className={`space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed ${isArabic ? "text-right" : ""}`}>
              <p>
                {isArabic
                  ? "نراجع كل تفصيلة – من اختيار القصّة والقماش إلى اللمسات النهائية – لنضمن أن القطعة مريحة بقدر ما هي أنيقة. هدفنا أن تشعري أنك ترتدين شيئاً صُمم خصيصاً لك."
                  : "We obsess over every detail – from the cut and fabric to the finishing touches – to make sure each piece feels as comfortable as it is beautiful. Our goal is for every item to feel like it was made just for you."}
              </p>
              <p>
                {isArabic
                  ? "فِرق التصميم والخياطة التي نعمل معها هي قلب الحكاية. معاً نبتكر مجموعات تمنحك إحساس البوتيك الخاص أينما كنت."
                  : "The design and tailoring teams we partner with are at the heart of our story. Together, we create collections that bring the feeling of a personal boutique to your everyday wardrobe."}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-[minmax(0,2fr)_1fr] gap-8 md:gap-12 items-start">
            <div className={`space-y-4 ${isArabic ? "text-right" : ""}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-[0.2em]">
                <MapPin className="w-3.5 h-3.5" />
                {isArabic ? "أزانا أقرب إليك" : "Azana, closer to you"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isArabic ? "أزياء بوتيك بلمسة عصرية" : "Boutique fashion with a modern touch"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {isArabic
                  ? "سواء كنتِ تبحثين عن فستان سهرة لافت أو إطلالة يومية أنيقة، نقدّم لك مجموعات تجمع بين الراحة والرقي وتناسب مختلف المناسبات."
                  : "Whether you are dressing for a special evening or your everyday routine, our collections blend comfort and polish so you always feel put together."}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {isArabic
                  ? "من أول زيارة لك حتى كل طلبية جديدة، وعدنا أن تبقي أزانا مساحة لاكتشاف أزياء جديدة تعبّر عنك وتمنحك شعور البوتيك الخاص أينما كنت."
                  : "From your first visit to every new order, our promise is that Azana remains a place to discover new styles that feel like you and bring the boutique experience closer to home."}
              </p>
            </div>
            <div className={`glass-subtle rounded-3xl p-6 space-y-3 text-sm sm:text-base ${isArabic ? "text-right" : ""}`}>
              <p className="font-semibold text-foreground">
                {isArabic ? "وعدنا لك" : "Our Style Promise"}
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  {isArabic
                    ? "• أقمشة وقصّات مختارة بعناية لتلائم جسمك وتمنحك الثقة"
                    : "• Carefully chosen fabrics and cuts that flatter your shape and feel good all day"}
                </li>
                <li>
                  {isArabic
                    ? "• تصميمات تجمع بين الراحة والأناقة في كل قطعة"
                    : "• Designs that balance comfort and elegance in every piece"}
                </li>
                <li>
                  {isArabic
                    ? "• التزام طويل الأمد بالجودة والشفافية في كل خطوة"
                    : "• A long‑term commitment to quality, transparency, and thoughtful design"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-secondary/5 border-t border-border/40">
        <div className={`container mx-auto px-4 max-w-3xl text-center space-y-6 ${isArabic ? "rtl" : ""}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isArabic ? "اكتشفي إطلالتك المفضلة مع أزانا" : "Find your new favorite outfit with Azana"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isArabic
              ? "استمتعي بمجموعتنا من الفساتين والقطع اليومية والقطع المميزة المصممة لترافقك في كل مناسبة. من الإطلالات الكلاسيكية إلى العصرية، كل قطعة تهدف لإبراز أناقتك الطبيعية."
              : "Explore our collection of dresses, everyday staples, and statement pieces designed to move with you through every occasion. From timeless classics to trend‑led looks, each piece is made to highlight your natural elegance."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/25">
              <Link href="/#shop">{isArabic ? "تسوقي مجموعتنا" : "Shop Our Collection"}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full bg-transparent">
              <Link href="/search">{isArabic ? "ابحثي عن منتجك" : "Search Products"}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

