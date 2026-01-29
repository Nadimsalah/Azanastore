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
            <span>{isArabic ? "العودة إلى الصفحة الرئيسية" : "Retour à l'accueil"}</span>
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
              {isArabic ? "منذ 2010 • أزياء نسائية راقية" : "Depuis 2010 • Mode Féminine Boutique"}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {isArabic ? (
                <>
                  حكايتنا في <span className="text-primary">أزانا</span>
                </>
              ) : (
                <>
                  Notre histoire chez <span className="text-primary">Azana</span>
                </>
              )}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {isArabic
                ? "أزانا بدأت كفكرة بسيطة: متجر صغير يقدم فساتين نسائية أنيقة ومريحة تناسب الحياة اليومية والمناسبات الخاصة. بمرور الوقت تحوّل هذا الشغف بالأقمشة والتفاصيل إلى علامة متخصصة في الأزياء الراقية للمرأة."
                : "Azana a commencé comme une petite boutique avec un rêve clair : créer des vêtements féminins élégants et confortables qui rendent chaque jour spécial. Au fil du temps, cet amour pour les tissus, la coupe et les détails s'est transformé en une marque dédiée à la mode féminine de luxe et de boutique."}
            </p>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {isArabic
                ? "اليوم نقدّم مجموعات متجددة من الفساتين والقطع الأساسية والقطع المميزة التي صُممت بعناية لتعبّر عن أسلوبك وتبرز ثقتك. في أزانا، الجودة والقصّة المريحة هما جوهر كل تصميم."
                : "Aujourd'hui, nous concevons des collections de robes, de basiques élégants et de pièces maîtresses qui vous aident à exprimer votre style et à vous sentir confiante. Chez Azana, la qualité réfléchie et une coupe flatteuse sont au cœur de chaque création."}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.2em]">
                <Droplets className="w-3.5 h-3.5" />
                {isArabic ? "خامات مختارة بعناية" : "Tissus sélectionnés avec soin"}
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold uppercase tracking-[0.2em]">
                <Sparkles className="w-3.5 h-3.5" />
                {isArabic ? "تفاصيل أنثوية فاخرة" : "Détails féminins et luxueux"}
              </div>
            </div>
            <div className={`mt-4 space-y-2 ${isArabic ? "text-right" : ""}`}>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isArabic
                  ? "نعمل مع مورّدين موثوقين وخياطات محترفات لنضمن أن كل قطعة تلتزم بمعايير عالية من الجودة والراحة."
                  : "Nous travaillons avec des fournisseurs de confiance et des ateliers expérimentés pour garantir que chaque pièce répond à nos normes de confort, de qualité et de longévité."}
              </p>
              <div className="flex flex-wrap items-center gap-4 opacity-80">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <Image
                    src="/certifications/1.png"
                    alt={isArabic ? "شهادة جودة" : "Logo de certification de qualité"}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <Image
                    src="/certifications/2.png"
                    alt={isArabic ? "شهادة نقاء" : "Logo de certification de pureté"}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <Image
                    src="/certifications/3.png"
                    alt={isArabic ? "شهادة مستحضرات تجميل" : "Logo de certification cosmétique"}
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
                {isArabic ? "من البوتيك إلى خزانتك" : "De notre boutique à votre garde-robe"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isArabic ? "نصمم أزياءً تعيش معك طويلاً" : "Concevoir des pièces qui durent"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {isArabic
                  ? "منذ انطلاقة أزانا، تركّزنا على تصميم قطع يمكن ارتداؤها بطرق متعددة وتبقى أنيقة عاماً بعد عام. ما بدأ بفستان واحد مميز أصبح اليوم مجموعات كاملة تناسب أسلوب حياة المرأة العصرية."
                  : "Depuis le début, Azana se concentre sur des vêtements qui peuvent être portés de multiples façons et rester actuels saison après saison. Ce qui a commencé par une robe signature est devenu des collections complètes pour la vie quotidienne de la femme moderne."}
              </p>
            </div>
            <div className={`space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed ${isArabic ? "text-right" : ""}`}>
              <p>
                {isArabic
                  ? "نراجع كل تفصيلة – من اختيار القصّة والقماش إلى اللمسات النهائية – لنضمن أن القطعة مريحة بقدر ما هي أنيقة. هدفنا أن تشعري أنك ترتدين شيئاً صُمم خصيصاً لك."
                  : "Nous soignons chaque détail – de la coupe et du tissu aux finitions – pour nous assurer que chaque pièce est aussi confortable qu'elle est belle. Notre objectif est que chaque article donne l'impression d'avoir été fait juste pour vous."}
              </p>
              <p>
                {isArabic
                  ? "فِرق التصميم والخياطة التي نعمل معها هي قلب الحكاية. معاً نبتكر مجموعات تمنحك إحساس البوتيك الخاص أينما كنت."
                  : "Les équipes de design et de couture avec lesquelles nous travaillons sont au cœur de notre histoire. Ensemble, nous créons des collections qui apportent l'expérience d'une boutique personnelle à votre garde-robe quotidienne."}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-[minmax(0,2fr)_1fr] gap-8 md:gap-12 items-start">
            <div className={`space-y-4 ${isArabic ? "text-right" : ""}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-[0.2em]">
                <MapPin className="w-3.5 h-3.5" />
                {isArabic ? "أزانا أقرب إليك" : "Azana, plus proche de vous"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isArabic ? "أزياء بوتيك بلمسة عصرية" : "Mode boutique avec une touche moderne"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {isArabic
                  ? "سواء كنتِ تبحثين عن فستان سهرة لافت أو إطلالة يومية أنيقة، نقدّم لك مجموعات تجمع بين الراحة والرقي وتناسب مختلف المناسبات."
                  : "Que vous vous habilliez pour une soirée spéciale ou pour votre routine quotidienne, nos collections allient confort et élégance pour que vous vous sentiez toujours impeccable."}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {isArabic
                  ? "من أول زيارة لك حتى كل طلبية جديدة، وعدنا أن تبقي أزانا مساحة لاكتشاف أزياء جديدة تعبّر عنك وتمنحك شعور البوتيك الخاص أينما كنت."
                  : "De votre première visite à chaque nouvelle commande, notre promesse est qu'Azana reste un lieu pour découvrir de nouveaux styles qui vous ressemblent et rapprochent l'expérience boutique de chez vous."}
              </p>
            </div>
            <div className={`glass-subtle rounded-3xl p-6 space-y-3 text-sm sm:text-base ${isArabic ? "text-right" : ""}`}>
              <p className="font-semibold text-foreground">
                {isArabic ? "وعدنا لك" : "Notre promesse de style"}
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  {isArabic
                    ? "• أقمشة وقصّات مختارة بعناية لتلائم جسمك وتمنحك الثقة"
                    : "• Tissus et coupes choisis avec soin pour flatter votre silhouette et vous sentir bien toute la journée"}
                </li>
                <li>
                  {isArabic
                    ? "• تصميمات تجمع بين الراحة والأناقة في كل قطعة"
                    : "• Des designs qui équilibrent confort et élégance dans chaque pièce"}
                </li>
                <li>
                  {isArabic
                    ? "• التزام طويل الأمد بالجودة والشفافية في كل خطوة"
                    : "• Un engagement à long terme envers la qualité, la transparence et un design réfléchi"}
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
            {isArabic ? "اكتشفي إطلالتك المفضلة مع أزانا" : "Trouvez votre nouvelle tenue préférée avec Azana"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isArabic
              ? "استمتعي بمجموعتنا من الفساتين والقطع اليومية والقطع المميزة المصممة لترافقك في كل مناسبة. من الإطلالات الكلاسيكية إلى العصرية، كل قطعة تهدف لإبراز أناقتك الطبيعية."
              : "Découvrez notre collection de robes, de basiques quotidiens et de pièces maîtresses conçues pour vous accompagner en toute occasion. Des classiques intemporels aux looks tendances, chaque pièce est faite pour souligner votre élégance naturelle."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/25">
              <Link href="/#shop">{isArabic ? "تسوقي مجموعتنا" : "Voir la collection"}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full bg-transparent">
              <Link href="/search">{isArabic ? "ابحثي عن منتجك" : "Rechercher des produits"}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

