import { MarketingPageData } from '@/interfaces/marketing';

export const marketingData: MarketingPageData = {
  header: {
    logo: "Aangelina AI",
    links: [
      { id: "home", label: "Accueil", href: "#home" },
      { id: "pricing", label: "Tarifs", href: "#pricing" },
      { id: "features", label: "Fonctionnalités", href: "#features" },
      { id: "how-it-works", label: "Comment ça marche", href: "#how-it-works" },
      { id: "marketplace", label: "Marketplace", href: "#marketplace" },
      { id: "login", label: "Connexion", href: "#login" },
      { id: "signup", label: "Inscription", href: "#signup" }
    ],
    ctaText: "Commencer gratuitement",
    language: "🇫🇷"
  },
  hero: {
    title: "Aangelina AI : L'agent IA qui révolutionne la gestion de votre restaurant",
    subtitle: "Automatisez vos commandes, gérez vos stocks, traitez les plaintes et coordonnez vos livraisons avec notre agent IA intelligent spécialisé pour les restaurants",
    ctaText: "Commencer gratuitement",
    rating: 4.9,
    userCount: "+500 restaurants",
    userAvatars: ["avatar1", "avatar2", "avatar3", "avatar4"]
  },
  pricing: {
    title: "Tarifs",
    subtitle: "Choisissez le plan qui correspond à votre restaurant",
    annualDiscount: "Économisez 20%!",
    plans: [
      {
        id: "starter",
        name: "Débutant",
        price: "49€",
        period: "/mois",
        features: [
          "500 commandes/mois",
          "1 agent IA restaurant",
          "Gestion des stocks basique",
          "Support email",
          "Intégration WhatsApp"
        ],
        ctaText: "Commencer"
      },
      {
        id: "pro",
        name: "Professionnel",
        price: "99€",
        period: "/mois",
        isPopular: true,
        features: [
          "2000 commandes/mois",
          "Agent IA avancé",
          "Gestion des stocks intelligente",
          "Traitement des plaintes",
          "Support prioritaire",
          "Analytics détaillés"
        ],
        ctaText: "Commencer"
      },
      {
        id: "business",
        name: "Entreprise",
        price: "199€",
        period: "/mois",
        features: [
          "Commandes illimitées",
          "Agents IA multiples",
          "Gestion multi-restaurants",
          "Marketplace intégré",
          "Support dédié",
          "API personnalisée"
        ],
        ctaText: "Commencer"
      }
    ]
  },
  faq: {
    title: "Questions fréquentes",
    items: [
      {
        id: "orders",
        question: "Comment l'agent gère-t-il les commandes ?",
        answer: "Aangelina AI présente votre menu, prend les commandes via numéros, vérifie les stocks automatiquement et envoie la facture numérique."
      },
      {
        id: "stocks",
        question: "Comment fonctionne la gestion des stocks ?",
        answer: "L'agent vérifie vos stocks en temps réel via Excel ou API, propose des alternatives en cas de rupture et met à jour automatiquement après chaque commande."
      },
      {
        id: "complaints",
        question: "Que se passe-t-il avec les plaintes clients ?",
        answer: "L'agent analyse les problèmes, propose des solutions automatiques (remboursement, réduction) et transfère au manager pour les cas complexes."
      },
      {
        id: "marketplace",
        question: "Qu'est-ce que le Marketplace Mode ?",
        answer: "Le mode Marketplace permet à l'assistant principal Aangelina AI de gérer tous les agents restaurants pour aider les clients à voir, discuter et commander dans n'importe quel restaurant."
      }
    ]
  },
  testimonials: {
    title: "Ce que disent nos restaurateurs",
    testimonials: [
      {
        id: "amadou",
        name: "Amadou Fall",
        role: "Propriétaire",
        company: "Restaurant Le Soleil, Cotonou",
        content: "Aangelina AI a révolutionné notre service client. Les commandes sont prises automatiquement, plus de perte de clients ! Nos ventes ont augmenté de 45%.",
        rating: 5,
        avatar: "amadou-avatar"
      },
      {
        id: "fatou",
        name: "Fatou Diallo",
        role: "Gérante",
        company: "Chez Fatou, Porto-Novo",
        content: "La gestion des stocks est maintenant automatique. L'agent propose des alternatives quand un plat n'est plus disponible. Nos clients adorent !",
        rating: 5,
        avatar: "fatou-avatar"
      },
      {
        id: "jean",
        name: "Jean-Baptiste Koffi",
        role: "Chef",
        company: "Restaurant La Paillote, Abomey",
        content: "Les plaintes sont traitées instantanément. L'agent propose des solutions et ne nous dérange que pour les cas vraiment importants. Parfait !",
        rating: 5,
        avatar: "jean-avatar"
      },
      {
        id: "marie",
        name: "Marie Agbessi",
        role: "Propriétaire",
        company: "Snack Marie, Parakou",
        content: "Aangelina AI coordonne nos livraisons selon l'urgence et la localisation. Plus de retard, plus de clients mécontents !",
        rating: 5,
        avatar: "marie-avatar"
      },
      {
        id: "kossi",
        name: "Kossi Togbe",
        role: "Manager",
        company: "Restaurant Le Béninois, Natitingou",
        content: "L'agent nous informe en temps réel sur les stocks disponibles et permet l'ajout rapide de nouveaux produits. Un gain de temps énorme !",
        rating: 5,
        avatar: "kossi-avatar"
      },
      {
        id: "grace",
        name: "Grace Lawson",
        role: "Propriétaire",
        company: "Café Grace, Ouidah",
        content: "Nos clients reçoivent des notifications à chaque étape : préparation, sortie de cuisine, livraison. L'expérience client est exceptionnelle !",
        rating: 5,
        avatar: "grace-avatar"
      }
    ]
  },
  howItWorks: {
    title: "Comment ça marche",
    steps: [
      {
        id: "configure",
        number: "1",
        title: "Configurez Aangelina AI",
        description: "Fournissez les détails de votre restaurant : menu, horaires, localisation et préférences",
        videoUrl: "configure-restaurant.mp4"
      },
      {
        id: "generate",
        number: "2",
        title: "Agent généré automatiquement",
        description: "Votre agent IA personnalisé est créé avec un lien et un QR code pour vos clients",
        videoUrl: "generate-agent.mp4"
      },
      {
        id: "deploy",
        number: "3",
        title: "Déployez dans votre restaurant",
        description: "Utilisez l'agent dans votre restaurant et partagez le lien avec vos clients",
        videoUrl: "deploy-restaurant.mp4"
      },
      {
        id: "marketplace",
        number: "4",
        title: "Rejoignez le Marketplace",
        description: "Votre agent Aangelina AI est ajouté au réseau pour que les clients puissent découvrir, discuter et commander dans votre restaurant",
        videoUrl: "marketplace-mode.mp4"
      }
    ]
  },
  enterprise: {
    title: "Prêt pour l'Entreprise!",
    subtitle: "Sécurité et conformité pour votre restaurant",
    features: [
      {
        id: "privacy",
        title: "Confidentialité Garantie",
        description: "Vos données clients et de commandes sont protégées et chiffrées",
        icon: "shield"
      },
      {
        id: "compliance",
        title: "Conformité Alimentaire",
        description: "Respect des réglementations sanitaires et de sécurité alimentaire",
        icon: "globe"
      },
      {
        id: "trust",
        title: "Service Fiable",
        description: "SLA 99.9% et support 24/7 pour votre restaurant",
        icon: "heart"
      }
    ]
  },
  footer: {
    rgpd: "RGPD",
    company: "Aangelina AI - Tous droits réservés",
    socialLinks: [
      { id: "twitter", label: "Twitter", href: "#" },
      { id: "linkedin", label: "LinkedIn", href: "#" },
      { id: "facebook", label: "Facebook", href: "#" }
    ],
    copyright: "© 2024 Aangelina AI. Tous droits réservés."
  }
};

