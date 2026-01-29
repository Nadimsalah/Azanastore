"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "fr" | "ar"
type Direction = "ltr" | "rtl"

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
    dir: Direction
    toggleLanguage: () => void
}

const translations = {
    fr: {
        "common.currency": "MAD",
        // Navigation
        "nav.shop": "Boutique",
        "nav.collections": "Collections",
        "nav.about": "À propos",
        "nav.faq": "FAQ",
        "nav.search": "Rechercher",
        "nav.shop_now": "Acheter maintenant",
        "nav.view_all_collections": "Voir toutes les collections",

        // Header Popups
        "header.categories": "Catégories",
        "header.browse_by_category": "Parcourir par catégorie",
        "header.face_care": "Soins du visage",
        "header.face_care_desc": "Sérums, crèmes et huiles",
        "header.hair_care": "Soins des cheveux",
        "header.hair_care_desc": "Traitements et masques",
        "header.body_care": "Soins du corps",
        "header.body_care_desc": "Lotions et beurres",
        "header.gift_sets": "Coffrets cadeaux",
        "header.gift_sets_desc": "Sélections spéciales",
        "header.new_arrival": "Nouveautés",
        "header.argan_elixir": "Élixir capillaire à l'argan",
        "header.argan_elixir_desc": "Formule révolutionnaire pour des cheveux soyeux",
        "header.signature": "Signature",
        "header.essentials": "Essentiels",
        "header.premium": "Premium",

        // Hero
        "hero.title_prefix": "Style",
        "hero.title_suffix": "Féminin Sans Effort",
        "hero.subtitle": "Découvrez des vêtements féminins de luxe et de boutique – des essentiels quotidiens aux robes de soirée pour chaque occasion.",
        "hero.shop_collection": "Voir la collection",
        "hero.explore_best_sellers": "Découvrir les meilleures ventes",
        "hero.fast_delivery": "Livraison rapide",
        "hero.secure_checkout": "Paiement sécurisé",
        "hero.easy_returns": "Retours faciles",
        "hero.pure_argan_oil": "Huile d'argan pure",
        "hero.cold_pressed": "Pressée à froid",

        // Sections
        "section.featured_collections": "Collections en vedette",
        "section.featured_desc": "Découvrez nos collections sélectionnées de robes, ensembles et essentiels de garde-robe.",
        "section.best_sellers": "Catégories",
        "section.best_sellers_desc": "Parcourez toutes nos catégories de vêtements.",
        "section.all_categories": "Tout",
        "section.view_all_products": "Voir tous les produits",
        "section.load_more": "Charger plus",
        "section.why_choose": "Pourquoi choisir Azana ?",
        "section.organic": "Tissus premium",
        "section.organic_desc": "Matériaux doux et respirants choisis pour le confort et la durabilité.",
        "section.award_winning": "Coupes flatteuses",
        "section.award_winning_desc": "Silhouettes conçues pour mettre en valeur chaque silhouette.",
        "section.cruelty_free": "Design conscient",
        "section.cruelty_free_desc": "Pièces réfléchies que vous pouvez porter saison après saison.",
        "section.handcrafted": "Détails boutique",
        "section.handcrafted_desc": "Finitions qui rendent chaque look spécial.",
        "section.limited_offer": "Offre limitée",
        "section.promo_title": "25% de réduction sur votre première tenue",
        "section.promo_desc": "Commencez votre garde-robe Azana avec 25% de réduction. Utilisez le code WELCOME25 à la caisse.",
        "section.get_offer": "Obtenir l'offre",
        "section.hurry_up": "Dépêchez-vous !",
        "section.view_collection": "Voir la collection",

        // Newsletter
        "newsletter.title": "Restez à la mode",
        "newsletter.desc": "Abonnez-vous pour des offres exclusives, des conseils de style et un accès anticipé aux nouveautés.",
        "newsletter.placeholder": "Entrez votre email",
        "newsletter.subscribe": "S'abonner",
        "newsletter.disclaimer": "En vous abonnant, vous acceptez notre Politique de confidentialité. Désabonnez-vous à tout moment.",

        // Footer
        "footer.company": "Entreprise",
        "footer.support": "Support",
        "footer.legal": "Légal",
        "footer.our_story": "Notre histoire",
        "footer.sustainability": "Durabilité",
        "footer.press": "Presse",
        "footer.careers": "Carrières",
        "footer.contact_us": "Contactez-nous",
        "footer.shipping_info": "Informations de livraison",
        "footer.track_order": "Suivre la commande",
        "footer.privacy_policy": "Politique de confidentialité",
        "footer.terms": "Conditions de service",
        "footer.refund_policy": "Politique de remboursement",
        "footer.cookies": "Cookies",
        "footer.rights": "Tous droits réservés.",

        // Product & Cart
        "product.add_to_cart": "Ajouter au panier",
        "product.reviews": "avis",
        "product.in_stock": "En stock",
        "product.out_of_stock": "Rupture de stock",
        "product.select_size": "Sélectionner la taille",
        "product.quantity": "Quantité",
        "product.key_benefits": "Avantages clés",
        "product.size_guide": "Guide des tailles",
        "product.you_may_also_like": "Vous pourriez aussi aimer",
        "cart.your_cart_empty": "Votre panier est vide",
        "cart.empty_desc": "Il semble que vous n'ayez pas encore ajouté d'articles à votre panier.",
        "cart.start_shopping": "Commencer les achats",
        "cart.shopping_cart": "Panier",
        "cart.items": "articles",
        "cart.order_summary": "Résumé de la commande",
        "cart.subtotal": "Sous-total",
        "cart.shipping": "Livraison",
        "cart.free": "Gratuit",
        "cart.total": "Total",
        "cart.proceed_checkout": "Passer à la caisse",
        "cart.promo_code": "Code promo",
        "cart.apply": "Appliquer",
        "cart.applied": "Appliqué",
        "cart.enter_code": "Entrer le code",
        "cart.discount_applied": "réduction appliquée !",
        "cart.add_more_shipping": "Ajoutez plus pour la livraison gratuite",
        "cart.continue_shopping": "Continuer les achats",
        "cart.trust.shipping": "Livraison gratuite à partir de 750 MAD",
        "cart.trust.secure": "Paiement sécurisé",
        "cart.trust.returns": "Retours sous 30 jours",

        // FAQ
        "faq.title": "Questions fréquemment posées",
        "faq.subtitle": "Tout ce que vous devez savoir sur nos vêtements et notre service.",
        "faq.q1": "Comment choisir la bonne taille ?",
        "faq.a1": "Vous trouverez un guide des tailles détaillé sur chaque page produit. Si vous êtes entre deux tailles, nous recommandons généralement de prendre la taille supérieure pour une coupe plus décontractée.",
        "faq.q2": "Combien de temps prend la livraison ?",
        "faq.a2": "Nous offrons une livraison rapide ! Les commandes locales arrivent généralement en 2 à 4 jours ouvrables. Les commandes internationales arrivent généralement dans les 5 à 8 jours ouvrables.",
        "faq.q3": "Quelle est votre politique de retour ?",
        "faq.a3": "Si quelque chose ne vous convient pas, vous pouvez retourner les articles non portés avec leurs étiquettes dans les 14 jours suivant la livraison pour un échange ou un remboursement, selon notre politique.",
        "faq.q4": "Un article sera-t-il réapprovisionné ?",
        "faq.a4": "Certaines de nos pièces sont des séries limitées. Si un article est épuisé, vous pouvez rejoindre la liste d'attente sur la page produit et nous vous avertirons s'il revient.",
        "faq.q5": "Comment dois-je entretenir mes pièces Azana ?",
        "faq.a5": "La plupart des articles peuvent être lavés en machine à cycle délicat à l'eau froide et séchés à l'air. Vérifiez toujours l'étiquette d'entretien sur chaque vêtement pour des instructions spécifiques.",
        "faq.q6": "Puis-je modifier ou annuler ma commande ?",
        "faq.a6": "Nous commençons à préparer votre commande rapidement, mais vous pouvez nous contacter dès que possible et nous ferons de notre mieux pour la mettre à jour ou l'annuler avant l'expédition.",

        // Checkout
        "checkout.title": "Paiement",
        "checkout.contact_info": "Informations de contact",
        "checkout.full_name": "Nom complet",
        "checkout.phone": "Numéro de téléphone",
        "checkout.email": "Email (optionnel)",
        "checkout.city": "Ville",
        "checkout.address": "Adresse",
        "checkout.pay": "Payer",
        "checkout.processing": "Traitement en cours...",
        "checkout.success_title": "Commande confirmée !",
        "checkout.success_desc": "Nous avons reçu votre commande. Nous vous appellerons sous peu pour confirmer les détails.",
        "checkout.continue_shopping": "Continuer les achats",
        "checkout.cancel_title": "Paiement annulé",
        "checkout.cancel_desc": "Votre paiement a été annulé. Aucun frais n'a été facturé.",
        "checkout.return_cart": "Retour au panier",
        "checkout.retry": "Réessayer le paiement",
        "validation.required": "Ce champ est obligatoire",
        "validation.phone": "Veuillez entrer un numéro de téléphone valide (min 10 caractères)",
        "validation.email": "Veuillez entrer une adresse email valide",

        // Success Page
        "success.thank_you": "Merci",
        "success.order_confirmed": "Votre commande est confirmée",
        "success.coupon_title": "Un cadeau spécial pour vous",
        "success.coupon_desc": "Utilisez ce code pour 20% de réduction sur votre prochain achat",
        "success.order_summary": "Résumé de la commande",
        "footer.about_desc": "Azana est une marque de vêtements féminins de luxe et de boutique, proposant des robes et des pièces quotidiennes qui sont sans effort, féminines et intemporelles.",
        "footer.privacy_short": "Confidentialité",
        "footer.terms_short": "Conditions",
        "footer.system_status": "Système normal",

        // WhatsApp
        "whatsapp.title": "Recevez les mises à jour de style sur WhatsApp",
        "whatsapp.desc": "Rejoignez notre liste VIP pour des réductions exclusives, des idées de style et un accès prioritaire aux nouvelles collections.",
        "whatsapp.placeholder": "Numéro de téléphone",
        "whatsapp.button": "Rejoindre maintenant",
        "whatsapp.success_title": "Vous êtes sur la liste !",
        "whatsapp.success_desc": "Merci de vous être abonné. Nous avons envoyé un cadeau de bienvenue sur votre WhatsApp.",
        "whatsapp.disclaimer": "En vous inscrivant, vous acceptez de recevoir des messages marketing sur WhatsApp. Désinscrivez-vous à tout moment.",
        "whatsapp.register_another": "Enregistrer un autre numéro",
        "whatsapp.verified_updates": "Mises à jour WhatsApp vérifiées",
        "whatsapp.processing": "Traitement en cours...",

        // Timer
        "timer.days": "Jours",
        "timer.hours": "Heures",
        "timer.minutes": "Minutes",
        "timer.seconds": "Secondes",
        "timer.loading": "Chargement des produits...",

        // Accessibility
        "accessibility.go_to_slide": "Aller à la diapositive",
    },
    ar: {
        "common.currency": "د.م",
        // Navigation
        "nav.shop": "المتجر",
        "nav.collections": "المجموعات",
        "nav.about": "من نحن",
        "nav.faq": "أسئلة شائعة",
        "nav.search": "بحث",
        "nav.shop_now": "تسوق الآن",
        "nav.view_all_collections": "عرض كل المجموعات",

        // Header Popups
        "header.categories": "الأقسام",
        "header.browse_by_category": "تصفح حسب القسم",
        "header.face_care": "العناية بالوجه",
        "header.face_care_desc": "سيروم، كريمات وزيوت",
        "header.hair_care": "العناية بالشعر",
        "header.hair_care_desc": "علاجات وأقنعة",
        "header.body_care": "العناية بالجسم",
        "header.body_care_desc": "لوشن وزبدة الجسم",
        "header.gift_sets": "مجموعات الهدايا",
        "header.gift_sets_desc": "باقات مختارة",
        "header.new_arrival": "وصل حديثاً",
        "header.argan_elixir": "إكسير الأرغان للشعر",
        "header.argan_elixir_desc": "تركيبة ثورية لشعر ناعم كالحرير",
        "header.signature": "المميزة",
        "header.essentials": "الأساسية",
        "header.premium": "الفاخرة",

        // Hero
        "hero.title_prefix": "أناقة",
        "hero.title_suffix": "المرأة العصرية",
        "hero.subtitle": "اكتشفي أزياء نسائية فاخرة من الفساتين إلى الإطلالات اليومية، بتصاميم مريحة وتفاصيل أنثوية مميزة.",
        "hero.shop_collection": "تسوقي المجموعة",
        "hero.explore_best_sellers": "استكشفي الأكثر مبيعاً",
        "hero.fast_delivery": "توصيل سريع",
        "hero.secure_checkout": "دفع آمن",
        "hero.easy_returns": "إرجاع سهل",
        "hero.pure_argan_oil": "زيت أرغان نقي",
        "hero.cold_pressed": "معصور على البارد",

        // Sections
        "section.featured_collections": "مجموعات مميزة",
        "section.featured_desc": "استكشفي مجموعاتنا المختارة من الفساتين والقطع الأساسية والإطلالات الكاملة.",
        "section.certifications": "معايير للجودة والراحة",
        "section.best_sellers": "الأقسام",
        "section.best_sellers_desc": "استعرضي جميع أقسام الملابس لدينا.",
        "section.all_categories": "الكل",
        "section.view_all_products": "عرض كل المنتجات",
        "section.load_more": "تحميل المزيد",
        "section.why_choose": "لماذا تختارين أزانا؟",
        "section.organic": "خامات فاخرة",
        "section.organic_desc": "أقمشة ناعمة وعملية مختارة بعناية لراحتك طوال اليوم.",
        "section.award_winning": "قصّات مريحة وجذابة",
        "section.award_winning_desc": "تصاميم تبرز جمالك وتناسب أسلوب حياتك.",
        "section.cruelty_free": "تصميم واعٍ",
        "section.cruelty_free_desc": "قطع يمكنك ارتداؤها بطرق مختلفة ومواسم متتالية.",
        "section.handcrafted": "لمسات بوتيك خاصة",
        "section.handcrafted_desc": "تفاصيل دقيقة تضيف لمسة فخامة لكل إطلالة.",
        "section.limited_offer": "عرض لفترة محدودة",
        "section.promo_title": "خصم 25% على أول إطلالة",
        "section.promo_desc": "ابدئي خزانتك من أزانا بخصم 25%. استخدمي الكود WELCOME25 عند الدفع.",
        "section.get_offer": "احصلي على العرض",
        "section.hurry_up": "سارعي!",
        "section.view_collection": "شفي المجموعة",

        // Newsletter
        "newsletter.title": "ابقي على اطلاع بأحدث الإطلالات",
        "newsletter.desc": "اشتركي ليصلك أحدث المجموعات، أفكار التنسيق، والعروض الحصرية.",
        "newsletter.placeholder": "أدخلي بريدك الإلكتروني",
        "newsletter.subscribe": "اشترك",
        "newsletter.disclaimer": "بالاشتراك، أنت توافقين على سياسة الخصوصية الخاصة بنا. يمكنك إلغاء الاشتراك في أي وقت.",

        // WhatsApp
        "whatsapp.title": "احصلي على آخر الإطلالات عبر واتساب",
        "whatsapp.desc": "انضمي لقائمتنا المميزة ليصلك خصومات حصرية، أفكار تنسيق، وأولوية الوصول للمجموعات الجديدة مباشرة على هاتفك.",
        "whatsapp.placeholder": "رقم الهاتف",
        "whatsapp.button": "انضمي الآن",
        "whatsapp.success_title": "أهلاً بك في القائمة!",
        "whatsapp.success_desc": "شكراً لاشتراكك. أرسلنا لك هدية ترحيبية على واتساب.",
        "whatsapp.disclaimer": "بالانضمام، أنت توافقين على استقبال رسائل تسويقية على واتساب. يمكنك إلغاء الاشتراك في أي وقت.",


        // Footer
        "footer.company": "الشركة",
        "footer.support": "الدعم",
        "footer.legal": "قانوني",
        "footer.our_story": "قصتنا",
        "footer.sustainability": "الاستدامة",
        "footer.press": "الصحافة",
        "footer.careers": "وظائف",
        "footer.contact_us": "اتصل بنا",
        "footer.shipping_info": "معلومات الشحن",
        "footer.track_order": "تتبع الطلب",
        "footer.privacy_policy": "سياسة الخصوصية",
        "footer.terms": "شروط الخدمة",
        "footer.refund_policy": "سياسة الاسترجاع",
        "footer.cookies": "ملفات تعريف الارتباط",
        "footer.rights": "جميع الحقوق محفوظة.",
        "footer.about_desc": "أزانا علامة أزياء نسائية تقدم قطع بوتيك فاخرة تجمع بين الراحة والأناقة وتمنحك إطلالات مميزة في كل مناسبة.",
        "footer.privacy_short": "الخصوصية",
        "footer.terms_short": "الشروط",
        "footer.system_status": "النظام يعمل",

        // Product & Cart
        "product.add_to_cart": "أضف إلى السلة",
        "product.reviews": "مراجعات",
        "product.in_stock": "متوفر",
        "product.out_of_stock": "غير متوفر",
        "product.select_size": "اختر الحجم",
        "product.quantity": "الكمية",
        "product.key_benefits": "الفوائد الرئيسية",
        "product.size_guide": "دليل المقاسات",
        "product.you_may_also_like": "قد يعجبك أيضاً",
        "cart.your_cart_empty": "سلة التسوق فارغة",
        "cart.empty_desc": "يبدو أنك لم تضف أي منتجات إلى سلتك بعد.",
        "cart.start_shopping": "ابدأ التسوق",
        "cart.shopping_cart": "سلة التسوق",
        "cart.items": "منتجات",
        "cart.order_summary": "ملخص الطلب",
        "cart.subtotal": "المجموع الفرعي",
        "cart.shipping": "الشحن",
        "cart.free": "مجاني",
        "cart.total": "المجموع",
        "cart.proceed_checkout": "إتمام الشراء",
        "cart.promo_code": "كود الخصم",
        "cart.apply": "تطبيق",
        "cart.applied": "تم التطبيق",
        "cart.enter_code": "أدخل الكود",
        "cart.discount_applied": "تم تطبيق الخصم!",
        "cart.add_more_shipping": "أضف المزيد للحصول على شحن مجاني",
        "cart.continue_shopping": "مواصلة التسوق",
        "cart.trust.shipping": "شحن مجاني فوق 750 د.م",
        "cart.trust.secure": "دفع آمن",
        "cart.trust.returns": "إرجاع خلال 30 يوم",

        // FAQ
        "faq.title": "أسئلة شائعة",
        "faq.subtitle": "كل ما تحتاجين معرفته عن أزياء وخدمة أزانا.",
        "faq.q1": "كيف أختار المقاس المناسب؟",
        "faq.a1": "ستجدين جدول مقاسات مفصل على كل صفحة منتج. إذا كنتِ بين مقاسين، ننصح باختيار المقاس الأكبر لإحساس أكثر راحة.",
        "faq.q2": "كم يستغرق الشحن؟",
        "faq.a2": "نوفر شحن سريع! الطلبات المحلية تصل عادة خلال 2-4 أيام عمل، والطلبات الدولية خلال 5-8 أيام عمل تقريباً.",
        "faq.q3": "ما هي سياسة الاسترجاع؟",
        "faq.a3": "إذا كان المنتج غير مناسب، يمكنك إرجاعه خلال 14 يوماً من الاستلام بشرط أن يكون بحالته الأصلية ومعه التذكرة، وفقاً لسياسة الاسترجاع.",
        "faq.q4": "هل القطع تتكرر أم أنها محدودة؟",
        "faq.a4": "كثير من قطع أزانا تكون بكميات محدودة. إذا نفد مقاسك، يمكنك الانضمام لقائمة الانتظار من صفحة المنتج وسنرسل لك رسالة إذا عاد مرة أخرى.",
        "faq.q5": "كيف أعتني بقطعي من أزانا؟",
        "faq.a5": "معظم القطع يُنصح بغسلها على دورة لطيفة بمياه باردة وتركها تجف في الهواء. دائماً اتبعي تعليمات العناية المكتوبة على كل قطعة.",
        "faq.q6": "هل أستطيع تعديل أو إلغاء طلبي؟",
        "faq.a6": "نبدأ بتحضير الطلبات بسرعة، فإذا كنتِ ترغبين بتعديل أو إلغاء طلبك، اتصلي بنا بأسرع وقت وسنحاول مساعدتك قبل أن يتم شحن الطلب.",

        // Checkout
        "checkout.title": "إتمام الطلب",
        "checkout.contact_info": "معلومات الاتصال",
        "checkout.full_name": "الاسم الكامل",
        "checkout.phone": "رقم الهاتف",
        "checkout.email": "البريد الإلكتروني (اختياري)",
        "checkout.city": "المدينة",
        "checkout.address": "العنوان",
        "checkout.pay": "دفع",
        "checkout.processing": "جاري المعالجة...",
        "checkout.success_title": "تم تأكيد الطلب!",
        "checkout.continue_shopping": "مواصلة التسوق",
        "checkout.cancel_title": "تم إلغاء الدفع",
        "checkout.cancel_desc": "تم إلغاء عملية الدفع. لم يتم خصم أي مبلغ.",
        "checkout.return_cart": "العودة للسلة",
        "checkout.retry": "إعادة المحاولة",
        "validation.required": "هذا الحقل مطلوب",
        "validation.phone": "يرجى إدخال رقم هاتف صحيح (أكثر من 10 أرقام)",
        "validation.email": "يرجى إدخال بريد إلكتروني صحيح",

        // Success Page
        "success.thank_you": "شكراً لك",
        "success.order_confirmed": "تم استلام طلبك",
        "checkout.success_desc": "لقد استلمنا طلبك. سنتصل بك قريباً لتأكيد التفاصيل.",
        "success.coupon_title": "هدية خاصة لك",
        "success.coupon_desc": "استخدم هذا الكود لخصم 20% على طلبك القادم",
        "success.order_summary": "ملخص الطلب",

        // WhatsApp New
        "whatsapp.register_another": "تسجيل رقم آخر",
        "whatsapp.verified_updates": "تحديثات واتساب موثقة",
        "whatsapp.processing": "جاري المعالجة...",

        // Timer
        "timer.days": "أيام",
        "timer.hours": "ساعات",
        "timer.minutes": "دقائق",
        "timer.seconds": "ثواني",
        "timer.loading": "جاري تحميل المنتجات...",

        // Accessibility
        "accessibility.go_to_slide": "اذهب للشريحة",
    }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("fr")

    useEffect(() => {
        // Check localStorage or browser preference on mount
        const savedLang = localStorage.getItem("language") as Language
        if (savedLang) {
            setLanguage(savedLang)
        }
    }, [])

    useEffect(() => {
        localStorage.setItem("language", language)

        // Update direction on document
        const dir = language === "ar" ? "rtl" : "ltr"
        document.documentElement.dir = dir
        document.documentElement.lang = language
    }, [language])

    const t = (key: string) => {
        return translations[language][key as keyof typeof translations["fr"]] || key
    }

    const toggleLanguage = () => {
        setLanguage(prev => prev === "fr" ? "ar" : "fr")
    }

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            dir: language === "ar" ? "rtl" : "ltr",
            toggleLanguage
        }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
