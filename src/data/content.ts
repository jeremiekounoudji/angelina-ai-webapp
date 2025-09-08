import { LandingPageContent } from '@/interfaces/content';
import { featuresData } from './features';

export const landingPageContent: LandingPageContent = {
  hero: {
    title: 'Révolutionnez votre restaurant avec Angelina AI',
    subtitle: 'Transformez les opérations de votre restaurant avec notre assistant IA basé sur WhatsApp. Gérez les commandes, les stocks, les livraisons et les plaintes de manière fluide.',
    ctaPrimary: 'Commencer l\'essai gratuit',
    ctaSecondary: 'Voir la démo',
    videoUrl: '/demo-video.mp4', // Optional video URL
  },
  features: featuresData,
  howItWorks: [
    {
      id: 'configure',
      number: 1,
      title: 'Configurez Angelina AI',
      description: 'Fournissez les détails de votre restaurant : menu, horaires, localisation et préférences en quelques minutes.',
    },
    {
      id: 'generate',
      number: 2,
      title: 'Agent généré automatiquement',
      description: 'Votre agent IA personnalisé est créé avec un lien et un QR code pour vos clients.',
    },
    {
      id: 'deploy',
      number: 3,
      title: 'Déployez dans votre restaurant',
      description: 'Utilisez l\'agent dans votre restaurant et partagez le lien avec vos clients pour commencer à recevoir des commandes.',
    },
    {
      id: 'marketplace',
      number: 4,
      title: 'Rejoignez le Marketplace',
      description: 'Votre agent Angelina AI est ajouté au réseau pour que les clients puissent découvrir, discuter et commander dans votre restaurant.',
    },
  ],
  benefits: {
    statistics: [
      {
        value: '500+',
        label: 'Restaurants Actifs',
        description: 'Restaurants au Bénin font confiance à Angelina AI',
      },
      {
        value: '50K+',
        label: 'Commandes Traitées',
        description: 'Commandes mensuelles gérées sans problème',
      },
      {
        value: '45%',
        label: 'Augmentation d\'Efficacité',
        description: 'Amélioration opérationnelle moyenne',
      },
      {
        value: '99.9%',
        label: 'Garantie de Disponibilité',
        description: 'Service fiable sur lequel vous pouvez compter',
      },
    ],
    list: [
      'Réduisez le temps de traitement des commandes de 60%',
      'Éliminez les commandes manquées et les erreurs humaines',
      'Offrez un support client 24/7 automatiquement',
      'Augmentez la satisfaction client avec des réponses instantanées',
      'Optimisez la gestion des stocks et réduisez le gaspillage',
      'Développez vos opérations sans embaucher de personnel supplémentaire',
      'Intégrez facilement avec vos systèmes existants',
      'Obtenez des analyses détaillées et des insights business',
    ],
  },
  demo: {
    title: 'Voir Angelina AI en Action',
    description: 'Découvrez comment notre assistant IA gère les scénarios réels de restaurant avec des réponses intelligentes et contextuelles.',
    mediaUrl: '/demo-video.mp4',
  },
  testimonials: [
    {
      id: 'amadou',
      name: 'Amadou Fall',
      role: 'Propriétaire',
      company: 'Restaurant Le Soleil, Cotonou',
      content: 'Angelina AI a complètement transformé les opérations de notre restaurant. Nous avons vu une augmentation de 45% de l\'efficacité et nos clients adorent l\'expérience de commande WhatsApp fluide.',
      rating: 5,
      avatar: '/testimonials/amadou.jpg',
    },
    {
      id: 'fatou',
      name: 'Fatou Diallo',
      role: 'Gérante',
      company: 'Chez Fatou, Porto-Novo',
      content: 'La fonction de gestion des stocks nous a fait économiser des milliers en gaspillage alimentaire. L\'IA est incroyablement intelligente et apprend nos habitudes.',
      rating: 5,
      avatar: '/testimonials/fatou.jpg',
    },
    {
      id: 'jean',
      name: 'Jean-Baptiste Koffi',
      role: 'Chef',
      company: 'Restaurant La Paillote, Abomey',
      content: 'Les plaintes clients sont maintenant résolues en minutes au lieu d\'heures. Nos scores de satisfaction n\'ont jamais été aussi élevés.',
      rating: 5,
      avatar: '/testimonials/jean.jpg',
    },
  ],
  pricing: [
    {
      id: 'starter',
      name: 'Débutant',
      price: '49€',
      period: 'par mois',
      features: [
        'Jusqu\'à 500 commandes/mois',
        'Gestion des stocks basique',
        'Intégration WhatsApp',
        'Support email',
        'Analytics basiques',
      ],
      ctaText: 'Commencer l\'essai gratuit',
    },
    {
      id: 'professional',
      name: 'Professionnel',
      price: '99€',
      period: 'par mois',
      features: [
        'Jusqu\'à 2,000 commandes/mois',
        'Gestion des stocks avancée',
        'Support multi-locations',
        'Support prioritaire',
        'Analytics avancés',
        'Intégrations personnalisées',
      ],
      highlighted: true,
      ctaText: 'Commencer l\'essai gratuit',
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      price: 'Personnalisé',
      period: 'nous contacter',
      features: [
        'Commandes illimitées',
        'Solution white-label',
        'Gestionnaire de compte dédié',
        'Support téléphonique 24/7',
        'Formation IA personnalisée',
        'Accès API',
      ],
      ctaText: 'Contacter les ventes',
    },
  ],
};