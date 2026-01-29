"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function CookiesPage() {
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
            {isArabic ? "سياسة الكوكيز" : "Politique des cookies"}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 sm:py-14 max-w-4xl">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-6 ${isArabic ? "text-right" : ""}`}>
          {isArabic ? "سياسة الكوكيز لأزانا – المغرب" : "Azana Maroc – Politique de cookies"}
        </h1>
        <div className={`space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed ${isArabic ? "text-right" : ""}`}>
          <p>
            {isArabic
              ? "يستخدم موقع أزانا ملفات تعريف الارتباط (الكوكيز) لتحسين تجربة التصفح وقياس الأداء، بما يتوافق مع القوانين المغربية المنظمة لاستخدام البيانات الإلكترونية."
              : "Le site Azana utilise des cookies pour améliorer votre expérience de navigation et mesurer les performances, conformément à la réglementation marocaine sur l'utilisation des données électroniques."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "1. ما هي الكوكيز؟" : "1. Qu'est-ce que les cookies ?"}
          </h2>
          <p>
            {isArabic
              ? "الكوكيز هي ملفات نصية صغيرة تُخزن على متصفحك عند زيارة الموقع، وتسمح لنا بتذكّر تفضيلاتك مثل اللغة أو محتويات عربة التسوق."
              : "Les cookies sont de petits fichiers texte stockés dans votre navigateur lorsque vous visitez notre site, nous permettant de mémoriser vos préférences telles que la langue ou le contenu du panier."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "2. أنواع الكوكيز التي نستخدمها" : "2. Types de cookies utilisés"}
          </h2>
          <p>
            {isArabic
              ? "نستخدم كوكيز أساسية لعمل الموقع (مثل حفظ الجلسة وعربة التسوق)، وكوكيز تحليلية مجهولة الهوية لمساعدتنا على فهم كيفية استخدام العملاء للموقع وتحسينه."
              : "Nous utilisons des cookies essentiels au fonctionnement du site (comme ceux de session et de panier) et des cookies analytiques anonymes pour comprendre l'utilisation de notre site et l'améliorer."}
          </p>

          <h2 className="font-semibold text-foreground">
            {isArabic ? "3. التحكم في الكوكيز" : "3. Gestion des cookies"}
          </h2>
          <p>
            {isArabic
              ? "يمكنك إدارة أو تعطيل الكوكيز من إعدادات المتصفح الخاص بك. يرجى ملاحظة أن إيقاف الكوكيز الأساسية قد يؤثر على عمل بعض وظائف الموقع مثل إتمام الطلبات."
              : "Vous pouvez gérer ou désactiver les cookies dans les paramètres de votre navigateur. Veuillez noter que la désactivation des cookies essentiels peut affecter certaines fonctionnalités clés du site, comme la finalisation des commandes."}
          </p>
        </div>
      </main>
    </div>
  )
}

