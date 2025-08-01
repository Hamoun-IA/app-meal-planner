# 🍽️ Assistante Babounette - PWA Gestion de Repas

Une application web progressive (PWA) moderne pour la gestion de recettes, courses, calendrier et assistance IA personnalisée.

## ✨ Fonctionnalités

- **🤖 IA Conversationnelle** : Assistant personnel avec GPT-4 pour recettes et conseils
- **📱 PWA Complète** : Installation native, fonctionnement hors ligne, notifications push
- **🍳 Gestion de Recettes** : Création, modification, recherche sémantique RAG
- **🛒 Liste de Courses** : Synchronisation intelligente avec recettes
- **📅 Calendrier** : Planning de repas hebdomadaire optimisé
- **🎨 Interface Moderne** : Design system Shadcn/UI + animations Framer Motion
- **📱 Cross-Platform** : Web + React Native avec Solito

## 🚀 Installation

### Prérequis

- Node.js 18+
- pnpm (recommandé)
- PostgreSQL 15+ avec extension pgvector
- Redis (optionnel, pour cache)

### Setup

1. **Cloner le projet**

```bash
git clone https://github.com/votre-username/app-meal-planner.git
cd app-meal-planner
```

2. **Installer les dépendances**

```bash
pnpm install
```

3. **Configuration environnement**

```bash
cp env.example .env.local
# Éditer .env.local avec vos variables
```

4. **Lancer en développement**

```bash
pnpm dev
```

## 🛠️ Scripts Disponibles

```bash
# Développement
pnpm dev          # Serveur de développement
pnpm build        # Build de production
pnpm start        # Serveur de production

# Qualité de code
pnpm lint         # ESLint
pnpm lint:fix     # ESLint avec auto-fix
pnpm format       # Prettier
pnpm format:check # Vérification formatage
pnpm type-check   # Vérification TypeScript

# Git hooks (automatiques)
# pre-commit: lint-staged
# pre-push: tests + vérifications
```

## 📁 Structure du Projet

```
app-meal-planner/
├── app/                    # Next.js App Router
│   ├── assistante/        # Chat IA conversationnel
│   ├── calendrier/        # Planning de repas
│   ├── courses/          # Liste de courses
│   ├── dashboard/        # Page d'accueil
│   ├── options/          # Paramètres utilisateur
│   └── recettes/         # Gestion des recettes
├── components/            # Composants réutilisables
│   ├── ui/              # Composants Shadcn/UI
│   └── ...              # Composants métier
├── contexts/             # Contextes React
├── hooks/               # Hooks personnalisés
├── lib/                 # Utilitaires et configs
├── public/              # Assets statiques
│   ├── icons/          # Icônes PWA
│   ├── manifest.json   # Manifest PWA
│   └── sw.js          # Service Worker
└── styles/             # Styles globaux
```

## 🔧 Configuration

### Variables d'Environnement

Voir `env.example` pour la liste complète des variables :

- **Base de données** : `DATABASE_URL`
- **OpenAI** : `OPENAI_API_KEY`, `OPENAI_MODEL`
- **PWA** : `PWA_BASE_URL`, `PWA_VERSION`
- **Auth** : `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **Monitoring** : `SENTRY_DSN`, `LOG_LEVEL`

### PWA Configuration

- **Manifest** : `/public/manifest.json`
- **Service Worker** : `/public/sw.js`
- **Icônes** : `/public/icons/`
- **Page hors ligne** : `/public/offline.html`

## 🎯 Roadmap

### ✅ Phase 1 : Setup Initial (Terminée)

- [x] Next.js 15 avec TypeScript strict
- [x] Configuration ESLint, Prettier, Husky
- [x] PWA avec Service Worker personnalisé
- [x] Variables d'environnement sécurisées
- [x] Structure App Router optimisée

### 🔄 Phase 2 : Base de Données et RAG (En cours)

- [ ] Configuration PostgreSQL + pgvector
- [ ] Modèles Prisma complets
- [ ] Service RAG avec embeddings
- [ ] Index vectoriels optimisés

### 📋 Phases Suivantes

- **Phase 3** : Intégration IA Conversationnelle
- **Phase 4** : Interface PWA avec Shadcn/UI
- **Phase 5** : Intégration Mobile React Native
- **Phase 6** : Tests et Qualité
- **Phase 7** : CI/CD et Déploiement

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests d'intégration
pnpm test:integration

# Tests E2E
pnpm test:e2e

# Couverture
pnpm test:coverage
```

## 🚀 Déploiement

### Production

```bash
# Build
pnpm build

# Démarrage
pnpm start
```

### Docker

```bash
# Build image
docker build -t babounette .

# Run container
docker run -p 3000:3000 babounette
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Shadcn/UI](https://ui.shadcn.com/) - Composants UI
- [OpenAI](https://openai.com/) - API IA
- [Prisma](https://prisma.io/) - ORM
- [Framer Motion](https://framer.com/motion/) - Animations

---

**💖 Développé avec amour pour simplifier la gestion de repas au quotidien !**
