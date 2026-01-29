"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function RefundPolicyPage() {
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
            {isArabic ? "سياسة الاسترجاع" : "Politique de remboursement"}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 sm:py-14 max-w-4xl">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-6 ${isArabic ? "text-right" : ""}`}>
          {isArabic ? "سياسة الاسترجاع لأزانا – المغرب" : "Azana Maroc – Politique de remboursement et de retour"}
        </h1>
        <div className={`space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed ${isArabic ? "text-right" : ""}`}>
          <p>
            {isArabic
              ? "نحرص على رضاك التام عن منتجات ديار أرجان. توضح هذه السياسة الشروط التي يتم من خلالها استرجاع أو استبدال المنتجات داخل مصر وفقًا لقانون حماية المستهلك المصري."
              : "Nous voulons que vous soyez entièrement satisfait de vos produits Azana. Cette politique explique les conditions de retour et de remboursement au Maroc, conformément à la loi marocaine sur la protection des consommateurs."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "١. فترة الاسترجاع" : "1. Période de retour"}
          </h2>
          <p>
            {isArabic
              ? "يمكنك طلب استرجاع أو استبدال المنتج خلال 14 يومًا من تاريخ الاستلام، بشرط أن يكون غير مستخدم، وفي عبوته الأصلية، وغير مفتوح لاعتبارات الصحة والعناية الشخصية."
              : "Vous pouvez demander un retour ou un échange dans un délai de 14 jours après réception, à condition que le produit soit inutilisé, non ouvert et dans son emballage d'origine, pour des raisons d'hygiène et de soins personnels."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "٢. المنتجات التالفة أو الخاطئة" : "2. Articles endommagés ou incorrects"}
          </h2>
          <p>
            {isArabic
              ? "في حال استلام منتج تالف أو غير مطابق للطلب، نتحمل تكلفة الاسترجاع أو الاستبدال بالكامل. يُرجى التواصل معنا خلال 48 ساعة من الاستلام مع صور توضح المشكلة."
              : "Si vous recevez un article endommagé ou non conforme à votre commande, nous prendrons en charge tous les frais de retour ou d'échange. Veuillez nous contacter dans les 48 heures suivant la livraison avec des photos du problème."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "٣. طريقة الاسترجاع" : "3. Traitement des remboursements"}
          </h2>
          <p>
            {isArabic
              ? "يتم رد المبلغ بنفس طريقة الدفع الأصلية إن أمكن، أو عن طريق تحويل بنكي/محفظة إلكترونية خلال مدة قد تصل إلى 14 يوم عمل بعد استلام المنتج وفحصه."
              : "Les remboursements sont effectués via le mode de paiement d'origine si possible, ou par virement bancaire / portefeuille électronique dans un délai de 14 jours ouvrables après réception et inspection de l'article retourné."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "٤. الاستثناءات" : "4. Exceptions"}
          </h2>
          <p>
            {isArabic
              ? "لا يمكن استرجاع المنتجات التي تم فتحها أو استخدامها، إلا إذا كانت هناك عيوب تصنيع واضحة. يحق لنا رفض أي طلب استرجاع لا يطابق الشروط السابقة."
              : "Nous ne pouvons accepter les retours de produits ouverts ou utilisés, sauf en cas de défaut de fabrication manifeste. Nous nous réservons le droit de refuser les retours ne respectant pas les conditions ci-dessus."}
          </p>
        </div>
      </main>
    </div>
  )
}

