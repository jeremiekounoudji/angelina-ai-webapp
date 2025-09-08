import { Feature } from '@/interfaces/components';

export const featuresData: Feature[] = [
  {
    id: 'automated-orders',
    icon: 'order',
    title: 'Prise de Commandes Automatisée',
    description: 'L\'agent présente votre menu, prend les commandes via numéros, demande les spécificités et vérifie les stocks automatiquement. Facture numérique envoyée instantanément.',
    highlight: true,
  },
  {
    id: 'stock-management',
    icon: 'inventory',
    title: 'Gestion Intelligente des Stocks',
    description: 'Vérification des stocks en temps réel via Excel ou API. Propose des alternatives en cas de rupture et met à jour automatiquement après chaque commande.',
  },
  {
    id: 'complaint-handling',
    icon: 'complaints',
    title: 'Traitement des Plaintes',
    description: 'Analyse automatique des problèmes clients. Propose des solutions (remboursement, réduction) et transfère au manager pour les cas complexes.',
  },
  {
    id: 'delivery-coordination',
    icon: 'delivery',
    title: 'Coordination des Livraisons',
    description: 'Planification des livraisons selon l\'urgence et la localisation. Notifications clients à chaque étape : préparation, sortie, livraison.',
  },
  {
    id: 'priority-management',
    icon: 'analytics',
    title: 'Gestion des Priorités',
    description: 'Suivi intelligent des commandes et alertes quotidiennes sur les stocks disponibles. Permet l\'ajout rapide de nouveaux produits.',
  },
  {
    id: 'marketplace-integration',
    icon: 'automation',
    title: 'Intégration Marketplace',
    description: 'Votre agent rejoint le réseau Angelina AI pour que les clients puissent découvrir, discuter et commander dans votre restaurant depuis n\'importe où.',
  },
];

export const featuresContent = {
  title: 'Tout ce dont vous avez besoin pour gérer votre restaurant',
  subtitle: 'Fonctionnalités puissantes conçues pour automatiser vos opérations et ravir vos clients via WhatsApp.',
};