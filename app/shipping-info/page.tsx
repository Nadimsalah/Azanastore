"use client"

import Link from "next/link"
import { ArrowLeft, Truck } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function ShippingInfoPage() {
  const { language } = useLanguage()
  const isArabic = language === "ar"

  return (
    <div className={`min-h-screen bg-background ${isArabic ? "font-[var(--font-almarai)]" : ""}`}>
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isArabic ? "العودة إلى الرئيسية" : "Retour à l'accueil"}</span>
          </Link>
          <span className="text-xs text-muted-foreground uppercase tracking-[0.25em]">
            {isArabic ? "معلومات الشحن" : "Infos de livraison"}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 sm:py-14 max-w-4xl">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-6 ${isArabic ? "text-right" : ""}`}>
          {isArabic ? "سياسة الشحن لدى أزانا – المغرب" : "Azana Maroc – Informations de livraison"}
        </h1>
        <div className={`space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed ${isArabic ? "text-right" : ""}`}>
          <p>
            {isArabic
              ? "نقدم خدمة توصيل للطلبات داخل المملكة المغربية من خلال شركاء شحن موثوقين، مع الحرص على توصيل منتجات أزانا بأفضل حالة."
              : "Nous livrons les commandes dans tout le Maroc via des partenaires de messagerie de confiance, garantissant que vos produits Azana arrivent dans les meilleures conditions."}
          </p>

          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            {isArabic ? "1. مدة التوصيل" : "1. Délais de livraison"}
          </h2>
          <p>
            {isArabic
              ? "عادةً ما يتم توصيل الطلبات داخل القاهرة والجيزة خلال 1–3 أيام عمل، وداخل باقي المحافظات خلال 2–5 أيام عمل، حسب شركة الشحن والمنطقة."
              : "Les commandes à Casablanca et Rabat sont généralement livrées sous 1 à 3 jours ouvrables, et sous 2 à 5 jours ouvrables pour les autres villes, selon le transporteur et la localisation."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "2. رسوم الشحن" : "2. Frais de port"}
          </h2>
          <p>
            {isArabic
              ? "رسوم الشحن تختلف حسب المحافظة وقيمة الطلب. في بعض العروض، قد نقدم شحنًا مجانيًا للطلبات التي تتجاوز مبلغًا معينًا كما هو موضح في صفحة الدفع."
              : "Les frais de port varient selon la ville et la valeur de la commande. Lors de certaines promotions, nous pouvons offrir la livraison gratuite au-dessus d'un certain montant, comme indiqué lors du paiement."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "3. متابعة الشحنة" : "3. Suivi de votre commande"}
          </h2>
          <p>
            {isArabic
              ? "بعد شحن الطلب، يمكن أن تتلقى رسالة نصية أو WhatsApp من شركة الشحن برقم التتبع أو تفاصيل التوصيل. في حال وجود أي استفسار، يمكنك التواصل معنا عبر صفحة اتصل بنا."
              : "Une fois votre commande expédiée, vous pouvez recevoir un SMS ou un message WhatsApp du transporteur avec les détails de suivi. Pour toute question, vous pouvez nous joindre via la page Contactez-nous."}
          </p>
        </div>
      </main>
    </div>
  )
}

