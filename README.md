## Overview

App Meal Planner is a Progressive Web App (PWA) for meal planning with AI-driven features. It allows users to manage recipes, ingredients, shopping lists, meal history, and family preferences. The app integrates conversational AI for recipe generation, semantic search (RAG), and personalized suggestions, while supporting offline functionality and cross-platform code sharing with React Native.

This project is designed for single-user deployment on a VPS, with no authentication required. All user-related operations use a fixed `DEFAULT_USER_ID` from environment variables (see [Security Considerations in .cursorrules](.cursorrules) for details). The UI is assumed to be already implemented—focus is on backend, API routes, and business logic (as emphasized in [Project Context in .cursorrules](.cursorrules)).

Key goals:
- Build a production-ready app with Next.js 14, TypeScript, Prisma, PostgreSQL (with pgvector for vector search), OpenAI/LangChain for AI, and Redis for caching.
- Ensure high code quality: Strict TypeScript, Zod validation, error handling, and >80% test coverage (refer to [Code Style & Standards in .cursorrules](.cursorrules) and [Testing Requirements in .cursorrules](.cursorrules)).
- Follow business rules for validations (e.g., recipe coherence, duplicate checks) as defined in supporting docs (see [gestion_erreurs_critiques_meal_appHAM.md](gestion_erreurs_critiques_meal_appHAM.md) for critical validations).

This repository includes specification documents to guide development, particularly for AI-assisted coding tools like Cursor. Start by setting up the project and implementing API routes as per [Specs_API_Routes_Next.md](Specs_API_Routes_Next.md).

## Tech Stack

- **Frontend/PWA**: Next.js 14 (App Router), TypeScript, Shadcn/UI + Tailwind CSS, Framer Motion, @ducanh2912/next-pwa (see [Frontend & PWA in meal_app_allspecHAM.md](meal_app_allspecHAM.md) for details).
- **Backend/DB**: Prisma ORM, PostgreSQL 15+ with pgvector extension, Redis for caching (refer to [Base de Données & RAG in meal_app_allspecHAM.md](meal_app_allspecHAM.md) and [schema.prisma](schema.prisma) for models).
- **AI**: OpenAI API (GPT-4 Turbo, embeddings), LangChain for agents (Chef, Planner, Chat) (see [Intelligence Artificielle in meal_app_allspecHAM.md](meal_app_allspecHAM.md) and [AI Integration in .cursorrules](.cursorrules)).
- **Cross-Platform**: React Native + Expo, Solito for code sharing, Tamagui/NativeWind (detailed in [Mobile & Cross-Platform in meal_app_allspecHAM.md](meal_app_allspecHAM.md)).
- **DevOps**: Docker multi-stage, GitHub Actions CI/CD, Nginx reverse proxy (see [DevOps & Production in meal_app_allspecHAM.md](meal_app_allspecHAM.md)).
- **Tools**: ESLint, Prettier, Husky, Jest + React Testing Library, Playwright (as per [Testing Requirements in .cursorrules](.cursorrules)).
- **Validation/Security**: Zod, custom AppError, rate limiting on AI endpoints (linked to [Validation Rules in .cursorrules](.cursorrules) and [gestion_erreurs_critiques_meal_appHAM.md](gestion_erreurs_critiques_meal_appHAM.md)).

## Assumptions and Constraints

- **Single-User App**: No authentication or multi-user support. Use `DEFAULT_USER_ID` (UUID) from `.env` for all operations involving `MealHistory` or `FamilyPreference` (see [Database & Prisma in .cursorrules](.cursorrules) and [meal_app_db_specHAM.md](meal_app_db_specHAM.md) for simplified models without User relations).
- **UI Already Implemented**: Do not create or modify UI components—focus solely on backend services, API routes, and logic (as per [DO NOT in .cursorrules](.cursorrules)).
- **Environment**: Runs on a VPS with HTTPS (Let's Encrypt). No internet access needed beyond API calls (OpenAI) (refer to [Sécurité in meal_app_allspecHAM.md](meal_app_allspecHAM.md)).
- **Data Handling**: Embeddings (768 dims) generated via OpenAI `text-embedding-3-small`. Use HNSW indexes for vector search (see [Recherche Vectorielle in meal_app_allspecHAM.md](meal_app_allspecHAM.md) and [schema.prisma](schema.prisma) for indexes).
- **DO NOT**: Implement sync file operations, skip validations, hardcode configs, or expose internal errors (from [DO NOT in .cursorrules](.cursorrules)).
- **ALWAYS**: Validate inputs (Zod + business rules), handle errors with try/catch, generate embeddings for searchable content, consider family preferences and meal history in AI suggestions (linked to [ALWAYS in .cursorrules](.cursorrules) and [## Cas d'utilisation IA (chat).md](## Cas d'utilisation IA (chat).md)).

## Project Structure

Recommended folder structure (using Next.js App Router):

```
app-meal-planner/
├── app/                  # Next.js App Router pages (UI already done)
├── components/           # Shared UI components (do not modify)
├── lib/                  # Utilities, services, db (Prisma)
│   ├── db/               # Prisma client and schema (see [schema.prisma](schema.prisma))
│   ├── utils/            # Validation, error handling (as per [Error Handling in .cursorrules](.cursorrules))
│   └── ai/               # LangChain agents, prompts (refer to [Common Patterns in .cursorrules](.cursorrules))
├── api/                  # API routes (implement as per [Specs_API_Routes_Next.md](Specs_API_Routes_Next.md))
├── public/               # Static assets, PWA manifest
├── prisma/               # schema.prisma and migrations
├── tests/                # Unit, integration, E2E tests (see [Testing Requirements in .cursorrules](.cursorrules))
├── docker/               # Dockerfile, compose (from [Docker & Orchestration in meal_app_allspecHAM.md](meal_app_allspecHAM.md))
├── .github/workflows/    # CI/CD pipelines (as per [Phase 7 in roadmapHAM.md](roadmapHAM.md))
├── .env.example          # Environment variables template
└── docs/                 # Specification documents (see below)
```

## Setup Instructions

1. **Clone and Install**:
   ```
   git clone https://github.com/Hamoun-IA/app-meal-planner.git
   cd app-meal-planner
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in (see [Setup des variables d'environnement in roadmapHAM.md](roadmapHAM.md)):
   ```
   DATABASE_URL=postgresql://user:pass@localhost:5432/mealdb?pgbouncer=true
   OPENAI_API_KEY=sk-...
   REDIS_URL=redis://localhost:6379
   DEFAULT_USER_ID=00000000-0000-0000-0000-000000000000  # Fixed UUID for single-user (as per [Database & Prisma in .cursorrules](.cursorrules))
   ```

3. **Database Setup**:
   - Install PostgreSQL 15+ with pgvector extension (from [Configuration PostgreSQL in roadmapHAM.md](roadmapHAM.md)).
   - Run:
     ```
     npx prisma generate
     npx prisma migrate dev --name init
     ```

4. **Run Development Server**:
   ```
   npm run dev
   ```

5. **Build and Deploy**:
   - Build: `npm run build`
   - Docker: See `docker/Dockerfile` for multi-stage build (detailed in [Docker & Orchestration in meal_app_allspecHAM.md](meal_app_allspecHAM.md)).
   - CI/CD: GitHub Actions runs tests, builds, and deploys (blue-green strategy, as per [Phase 7 in roadmapHAM.md](roadmapHAM.md)).

6. **Tests**:
   - Unit/Integration: `npm run test` (cover >80% as in [Testing Requirements in .cursorrules](.cursorrules))
   - E2E: `npx playwright test` (multi-browser/devices, from [Phase 6 in roadmapHAM.md](roadmapHAM.md))

## Development Roadmap

Follow [roadmapHAM.md](roadmapHAM.md) for phased implementation (Days 1-21):
- Phase 1: Project setup (links to [Structure de dossiers in roadmapHAM.md](roadmapHAM.md)).
- Phase 2: DB and RAG models (integrates [schema.prisma](schema.prisma) and [meal_app_db_specHAM.md](meal_app_db_specHAM.md)).
- ... up to Phase 7: CI/CD (see [DevOps & Production in meal_app_allspecHAM.md](meal_app_allspecHAM.md)).

## Key Documents

| Document | Description |
|----------|-------------|
| [.cursorrules](.cursorrules) | Coding rules, style guide, patterns for services/routes (for Cursor/AI assistants; see [Code Style & Standards](.cursorrules) for TypeScript details). |
| [meal_app_allspecHAM.md](meal_app_allspecHAM.md) | Overall tech stack, features, architecture details (links to [Agents IA Spécialisés](meal_app_allspecHAM.md) for AI agents). |
| [gestion_erreurs_critiques_meal_appHAM.md](gestion_erreurs_critiques_meal_appHAM.md) | Critical error handling and validation rules (e.g., recipe coherence, units; extends with examples from [Validation Rules in .cursorrules](.cursorrules)). |
| [meal_app_db_specHAM.md](meal_app_db_specHAM.md) | Database specs (tables, columns, relations; aligns with [schema.prisma](schema.prisma)). |
| [Specs_API_Routes_Next.md](Specs_API_Routes_Next.md) | API endpoints, methods, bodies, validations (references [gestion_erreurs_critiques_meal_appHAM.md](gestion_erreurs_critiques_meal_appHAM.md) for error rules). |
| [ai_use_case.md](ai_use_case.md) | AI use cases (e.g., suggestions, fallbacks; integrates with [AI Integration in .cursorrules](.cursorrules)). |
| [schema.prisma](schema.prisma) | Prisma schema with models, enums, indexes (see [Additional notes](schema.prisma) for embedding generation). |
| [roadmapHAM.md](roadmapHAM.md) | Phased development plan (links to [Phase 3: Intégration IA](roadmapHAM.md) for AI setup). |

## Contributing with AI (e.g., Cursor)

- Adhere strictly to [.cursorrules](.cursorrules): Use service patterns, Zod schemas, streaming for AI routes (see [File Structure Pattern](.cursorrules)).
- Implement one endpoint/service at a time, starting with CRUD for Recipes/Ingredients (from [Specs_API_Routes_Next.md](Specs_API_Routes_Next.md), section 1-2).
- Test thoroughly: Cover validations, errors, and AI integrations (as per [Testing Requirements in .cursorrules](.cursorrules) and [Phase 6 in roadmapHAM.md](roadmapHAM.md)).
- For AI features: Use LangChain agents, check `MealHistory` (<7 days) and `FamilyPreference` before suggestions (linked to [## Cas d'utilisation IA (chat).md](## Cas d'utilisation IA (chat).md) and [Vérification historique](## Cas d'utilisation IA (chat).md)).

## License

MIT License. See LICENSE file for details.

---