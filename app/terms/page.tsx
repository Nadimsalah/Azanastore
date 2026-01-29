"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function TermsPage() {
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
            {isArabic ? "شروط الخدمة" : "Conditions de service"}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 sm:py-14 max-w-4xl">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-6 ${isArabic ? "text-right" : ""}`}>
          {isArabic ? "شروط وأحكام استخدام موقع أزانا – المغرب" : "Azana Maroc – Conditions de service"}
        </h1>
        <div className={`space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed ${isArabic ? "text-right" : ""}`}>
          <p>
            {isArabic
              ? "باستخدامك لموقع أزانا في المغرب أو إجرائك لأي طلب شراء، فأنت توافق على الشروط والأحكام الموضحة أدناه، والمطبقة وفقًا لأحكام القانون المغربي."
              : "En accédant au site web d'Azana au Maroc ou en passant commande, vous acceptez les conditions ci-dessous, appliquées conformément à la loi marocaine."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "١. استخدام الموقع" : "1. Utilisation du site web"}
          </h2>
          <p>
            {isArabic
              ? "يُسمح لك باستخدام الموقع لعرض المنتجات وطلبها لأغراض شخصية وغير تجارية فقط. لا يُسمح بأي استخدام غير قانوني أو يضر بديار أرجان أو بعملائها."
              : "Vous pouvez utiliser le site pour naviguer et acheter des produits à des fins personnelles et non commerciales. Toute utilisation illégale ou préjudiciable à Diar Argan ou à ses clients est interdite."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "٢. الأسعار والدفع" : "2. Prix et paiement"}
          </h2>
          <p>
            {isArabic
              ? "جميع الأسعار بالدرهم المغربي (د.م) وتشمل الضرائب المطبقة ما لم يُذكر خلاف ذلك. يتم السداد باستخدام الوسائل المتاحة على الموقع أو عند الاستلام وفقًا لشروط كل عرض."
              : "Tous les prix sont en dirhams marocains (MAD) et incluent les taxes applicables sauf indication contraire. Le paiement s'effectue via les méthodes disponibles sur le site ou en espèces à la livraison, selon l'offre."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "٣. الشحن والتسليم" : "3. Expédition et livraison"}
          </h2>
          <p>
            {isArabic
              ? "نقوم بتوصيل الطلبات داخل المملكة المغربية فقط. يتم تقدير مواعيد التسليم وطرق الشحن في صفحة الدفع، وقد تختلف بحسب المنطقة وشركات الشحن."
              : "Nous livrons les commandes au sein du Royaume du Maroc uniquement. Les délais et méthodes de livraison sont indiqués lors du paiement et peuvent varier selon la région et le transporteur."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "٤. المسؤولية" : "4. Responsabilité"}
          </h2>
          <p>
            {isArabic
              ? "نحرص على أن تكون جميع المعلومات المعروضة دقيقة، ومع ذلك لا نتحمل مسؤولية أي أضرار غير مباشرة ناتجة عن استخدام الموقع أو المنتجات بما يتجاوز ما يسمح به القانون المصري لحماية المستهلك."
              : "Nous nous efforçons d'assurer que toutes les informations affichées sont exactes ; cependant, nous ne sommes pas responsables des dommages indirects résultant de l'utilisation du site Web ou des produits au-delà de ce qui est autorisé par la loi marocaine sur la protection des consommateurs."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "٥. التعديلات على الشروط" : "5. Modifications des conditions"}
          </h2>
          <p>
            {isArabic
              ? "يحق لدیار أرجان تعديل هذه الشروط من وقت لآخر. يسري أي تحديث من تاريخ نشره على هذه الصفحة، ويُعد استمرار استخدامك للموقع بعد التعديل موافقة ضمنية على الشروط المحدثة."
              : "Diar Argan peut mettre à jour ces conditions de temps à autre. Tout changement prend effet dès sa publication sur cette page, et votre utilisation continue du site constitue une acceptation des conditions mises à jour."}
          </p>
        </div>
      </main>
    </div>
  )
}

