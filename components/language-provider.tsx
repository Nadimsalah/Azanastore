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


        "footer.contact_us": "Contactez-nous",
        "footer.shipping_info": "Informations de livraison",

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
        "product.size": "Taille",
        "product.color": "Couleur",
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

        // Common Statuses
        "status.all": "Tout",
        "status.processing": "Traitement",
        "status.delivered": "Livré",
        "status.pending": "En attente",
        "status.cancelled": "Annulé",

        "faq.a2": "Nous offrons une livraison rapide ! Les commandes locales arrivent généralement en 2 à 4 jours ouvrables. Les commandes internationales arrivent généralement dans les 5 à 8 jours ouvrables.",
        "faq.q3": "Quelle est votre politique de retour ?",
        "faq.a3": "Si quelque chose ne vous convient pas, vous pouvez retourner les articles non portés avec leurs étiquettes dans les 14 jours suivant la livraison pour un échange ou un remboursement, selon notre politique.",
        "faq.q4": "Un article sera-t-il réapprovisionné ?",
        "faq.a4": "Certaines de nos pièces sont des séries limitées. Si un article est épuisé, vous pouvez rejoindre la liste d'attente sur la page produit et nous vous avertirons s'il revient.",

        "faq.q5": "Comment dois-je entretenir mes pièces Azana ?",
        "faq.a5": "La plupart des articles peuvent être lavés en machine à cycle délicat à l'eau froide et séchés à l'air. Vérifiez toujours l'étiquette d'entretien sur chaque vêtement pour des instructions spécifiques.",
        "faq.q6": "Puis-je modifier ou annuler ma commande ?",
        "faq.a6": "Nous commençons à préparer votre commande rapidement, mais vous pouvez nous contacter dès que possible et nous ferons de notre mieux pour la mettre à jour ou l'annuler avant l'expédition.",

        // Admin Navigation
        "admin.nav.dashboard": "Tableau de bord",
        "admin.nav.orders": "Commandes",
        "admin.nav.products": "Produits",
        "admin.nav.customers": "Clients",
        "admin.nav.analytics": "Analyses",
        "admin.nav.carousel": "Carrousel",
        "admin.nav.whatsapp": "Prospects WhatsApp",
        "admin.nav.contacts": "Messages",
        "admin.nav.careers": "Candidatures",
        "admin.nav.settings": "Paramètres",
        "admin.nav.logout": "Déconnexion",

        // Admin Dashboard
        "admin.dashboard.title": "Tableau de bord",
        "admin.dashboard.subtitle": "Vue d'ensemble détaillée",
        "admin.dashboard.search": "Rechercher...",

        // Admin Login
        "admin.login.title": "Accès Admin",
        "admin.login.subtitle": "Entrez votre code PIN sécurisé",
        "admin.login.authorized": "Personnel autorisé uniquement",
        "admin.login.invalid": "PIN invalide",
        "admin.login.access_granted": "Accès autorisé",

        // Admin Stats & Recent Orders
        "admin.stats.total_revenue": "Revenu total",
        "admin.stats.total_orders": "Total des commandes",
        "admin.stats.total_products": "Total des produits",
        "admin.stats.total_customers": "Total des clients",
        "admin.stats.active": "Actif",
        "admin.stats.sync": "Synchronisation",
        "admin.recent_orders.title": "Commandes récentes",
        "admin.recent_orders.view_all": "Voir tout",
        "admin.recent_orders.order_id": "ID Commande",
        "admin.recent_orders.customer": "Client",
        "admin.recent_orders.email": "Email",
        "admin.recent_orders.amount": "Montant",
        "admin.recent_orders.status": "Statut",
        "admin.recent_orders.action": "Action",
        "admin.recent_orders.loading": "Chargement...",
        "admin.recent_orders.empty": "Aucune commande récente.",

        // Admin Customers
        "admin.customers.title": "Clients",
        "admin.customers.subtitle": "Gérer votre base de clients",
        "admin.customers.export": "Exporter",
        "admin.customers.filters": "Filtres",
        "admin.customers.search": "Rechercher des clients...",
        "admin.customers.total_customers": "Total Clients",
        "admin.customers.active_customers": "Clients Actifs",
        "admin.customers.table_customer": "Client",
        "admin.customers.table_orders": "Commandes",
        "admin.customers.table_spent": "Total Dépensé",
        "admin.customers.table_joined": "Date d'inscription",
        "admin.customers.no_customers": "Aucun client trouvé.",
        "admin.customers.loading": "Chargement des clients...",

        // Admin Products
        "admin.products.title": "Produits",
        "admin.products.manage_inventory": "Gérez votre inventaire",
        "admin.products.manage_categories": "Gérer les catégories",
        "admin.products.add_product": "Ajouter un produit",
        "admin.products.total_products": "Total Produits",
        "admin.products.total_inventory": "Inventaire Total",
        "admin.products.low_stock": "Stock Faible",
        "admin.products.out_of_stock": "Rupture de Stock",
        "admin.products.new_arrival": "Nouvel Arrivage",
        "admin.products.discard": "Annuler",
        "admin.products.publish": "Publier le produit",
        "admin.products.basic_info": "Informations de base",
        "admin.products.essential": "Essentiel",
        "admin.products.product_title": "Titre du produit",
        "admin.products.title_placeholder": "ex. Huile d'Argan Pure Rateb",
        "admin.products.description": "Description",
        "admin.products.description_placeholder": "Description en anglais",
        "admin.products.media_gallery": "Galerie Média",
        "admin.products.upload_image": "Télécharger Image",
        "admin.products.specifics": "Spécificités",
        "admin.products.key_benefits": "Avantages Clés",
        "admin.products.benefit_placeholder": "Description de l'avantage (Anglais)",
        "admin.products.no_benefits": "Aucun avantage ajouté.",
        "admin.products.size_guide": "Guide des tailles",
        "admin.products.size_guide_placeholder": "Informations sur le guide des tailles (ex. XS: Buste 32-34...)",
        "admin.products.status": "Statut",
        "admin.products.status_draft": "Brouillon",
        "admin.products.status_active": "Actif",
        "admin.products.category": "Catégorie",
        "admin.products.select_category": "Sélectionner une catégorie",
        "admin.products.product_type": "Type de produit",
        "admin.products.product_type_placeholder": "ex. Sérum",
        "admin.products.pricing": "Prix",
        "admin.products.price": "Prix (MAD)",
        "admin.products.compare_at": "Prix comparatif (Optionnel)",
        "admin.products.inventory": "Inventaire",
        "admin.products.stock": "Stock",
        "admin.products.sku": "SKU",
        "admin.products.auto_generated": "Généré automatiquement",
        "admin.products.cross_sells": "Ventes croisées",
        "admin.products.auto_select": "Sélection Auto",
        "admin.products.recommended_desc": "Produits recommandés basés sur la description.",
        "admin.products.uploading": "Téléchargement...",
        "admin.products.polish": "Améliorer",


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
        "validation.phone": "Veuillez entrer un numéro de téléphone valide (min 9 caractères)",
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


        "footer.contact_us": "اتصل بنا",
        "footer.shipping_info": "معلومات الشحن",

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
        "product.size": "المقاس",
        "product.color": "اللون",
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

        // Common Statuses
        "status.all": "الكل",
        "status.processing": "قيد المعالجة",
        "status.delivered": "تم التوصيل",
        "status.pending": "قيد الانتظار",
        "status.cancelled": "ملغى",

        "faq.a2": "نوفر شحن سريع! الطلبات المحلية تصل عادة خلال 2-4 أيام عمل، والطلبات الدولية خلال 5-8 أيام عمل تقريباً.",
        "faq.q3": "ما هي سياسة الاسترجاع؟",
        "faq.a3": "إذا كان المنتج غير مناسب، يمكنك إرجاعه خلال 14 يوماً من الاستلام بشرط أن يكون بحالته الأصلية ومعه التذكرة، وفقاً لسياسة الاسترجاع.",
        "faq.q4": "هل القطع تتكرر أم أنها محدودة؟",
        "faq.a4": "كثير من قطع أزانا تكون بكميات محدودة. إذا نفد مقاسك، يمكنك الانضمام لقائمة الانتظار من صفحة المنتج وسنرسل لك رسالة إذا عاد مرة أخرى.",
        "faq.q5": "كيف أعتني بقطعي من أزانا؟",
        "faq.a5": "معظم القطع يُنصح بغسلها على دورة لطيفة بمياه باردة وتركها تجف في الهواء. دائماً اتبعي تعليمات العناية المكتوبة على كل قطعة.",
        "faq.q6": "هل أستطيع تعديل أو إلغاء طلبي؟",
        "faq.a6": "نبدأ بتحضير الطلبات بسرعة، فإذا كنتِ ترغبين بتعديل أو إلغاء طلبك، اتصلي بنا بأسرع وقت وسنحاول مساعدتك قبل أن يتم شحن الطلب.",

        // Admin Navigation
        "admin.nav.dashboard": "لوحة القيادة",
        "admin.nav.orders": "الطلبات",
        "admin.nav.products": "المنتجات",
        "admin.nav.customers": "العملاء",
        "admin.nav.analytics": "التحليلات",
        "admin.nav.carousel": "الشريط الإعلاني",
        "admin.nav.whatsapp": "عملاء واتساب",
        "admin.nav.contacts": "الرسائل",
        "admin.nav.careers": "الوظائف",
        "admin.nav.settings": "الإعدادات",
        "admin.nav.logout": "تسجيل الخروج",

        // Admin Dashboard
        "admin.dashboard.title": "لوحة القيادة",
        "admin.dashboard.subtitle": "نظرة عامة مفصلة",
        "admin.dashboard.search": "بحث...",

        // Admin Login
        "admin.login.title": "دخول المسؤول",
        "admin.login.subtitle": "أدخل رمز PIN الآمن",
        "admin.login.authorized": "للموظفين المصرح لهم فقط",
        "admin.login.invalid": "رمز غير صحيح",
        "admin.login.access_granted": "تم السماح بالدخول",

        // Admin Stats & Recent Orders
        "admin.stats.total_revenue": "إجمالي الإيرادات",
        "admin.stats.total_orders": "إجمالي الطلبات",
        "admin.stats.total_products": "إجمالي المنتجات",
        "admin.stats.total_customers": "إجمالي العملاء",
        "admin.stats.active": "نشط",
        "admin.stats.sync": "مزامنة",
        "admin.recent_orders.title": "أحدث الطلبات",
        "admin.recent_orders.view_all": "عرض الكل",
        "admin.recent_orders.order_id": "رقم الطلب",
        "admin.recent_orders.customer": "العميل",
        "admin.recent_orders.email": "البريد الإلكتروني",
        "admin.recent_orders.amount": "المبلغ",
        "admin.recent_orders.status": "الحالة",
        "admin.recent_orders.action": "إجراء",
        "admin.recent_orders.loading": "جاري التحميل...",
        "admin.recent_orders.empty": "لا توجد طلبات حديثة.",

        // Admin Customers
        "admin.customers.title": "العملاء",
        "admin.customers.subtitle": "إدارة قاعدة عملائك",
        "admin.customers.export": "تصدير",
        "admin.customers.filters": "تصفية",
        "admin.customers.search": "بحث عن العملاء...",
        "admin.customers.total_customers": "إجمالي العملاء",
        "admin.customers.active_customers": "العملاء النشطين",
        "admin.customers.table_customer": "العميل",
        "admin.customers.table_orders": "الطلبات",
        "admin.customers.table_spent": "إجمالي المصروفات",
        "admin.customers.table_joined": "تاريخ الانضمام",
        "admin.customers.no_customers": "لم يتم العثور على عملاء.",
        "admin.customers.loading": "جاري تحميل العملاء...",

        // Admin Products
        "admin.products.title": "المنتجات",
        "admin.products.manage_inventory": "إدارة المخزون",
        "admin.products.manage_categories": "إدارة الأقسام",
        "admin.products.add_product": "إضافة منتج",
        "admin.products.total_products": "إجمالي المنتجات",
        "admin.products.total_inventory": "إجمالي المخزون",
        "admin.products.low_stock": "مخزون منخفض",
        "admin.products.out_of_stock": "نفذ المخزون",
        "admin.products.new_arrival": "وصول جديد",
        "admin.products.discard": "إلغاء",
        "admin.products.publish": "نشر المنتج",
        "admin.products.basic_info": "معلومات أساسية",
        "admin.products.essential": "أساسي",
        "admin.products.product_title": "اسم المنتج",
        "admin.products.title_placeholder": "مثال: زيت أركان نقي راتب",
        "admin.products.description": "الوصف",
        "admin.products.description_placeholder": "الوصف بالإنجليزية",
        "admin.products.media_gallery": "معرض الوسائط",
        "admin.products.upload_image": "رفع صورة",
        "admin.products.specifics": "التفاصيل",
        "admin.products.key_benefits": "الفوائد الرئيسية",
        "admin.products.benefit_placeholder": "وصف الفائدة (إنجليزية)",
        "admin.products.no_benefits": "لم يتم إضافة فوائد.",
        "admin.products.size_guide": "دليل المقاسات",
        "admin.products.size_guide_placeholder": "معلومات دليل القياسات...",
        "admin.products.status": "الحالة",
        "admin.products.status_draft": "مسودة",
        "admin.products.status_active": "نشط",
        "admin.products.category": "القسم",
        "admin.products.select_category": "اختر القسم",
        "admin.products.product_type": "نوع المنتج",
        "admin.products.product_type_placeholder": "مثال: مصل",
        "admin.products.pricing": "التسعير",
        "admin.products.price": "السعر (درهم)",
        "admin.products.compare_at": "السعر المقارن (اختياري)",
        "admin.products.inventory": "المخزون",
        "admin.products.stock": "الكمية",
        "admin.products.sku": "SKU",
        "admin.products.auto_generated": "توليد تلقائي",
        "admin.products.cross_sells": "منتجات مقترحة",
        "admin.products.auto_select": "تحديد تلقائي",
        "admin.products.recommended_desc": "منتجات موصى بها بناءً على الوصف.",
        "admin.products.uploading": "جاري الرفع...",
        "admin.products.polish": "تحسين",


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
        "validation.phone": "يرجى إدخال رقم هاتف صحيح (أكثر من 9 أرقام)",
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
        const savedLang = localStorage.getItem("language")
        if (savedLang === "ar" || savedLang === "fr") {
            setLanguage(savedLang)
        } else {
            // If invalid or 'en', force French and update storage
            setLanguage("fr")
            localStorage.setItem("language", "fr")
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
