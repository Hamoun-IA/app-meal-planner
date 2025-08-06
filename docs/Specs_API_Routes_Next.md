Specs API et Routes Next.js - Meal App Planner

Ce document définit les spécifications des routes API pour l'application Meal App Planner, basées sur les technologies Next.js 14 (App Router), Prisma ORM, OpenAI/LangChain pour l'IA, et les modèles de base de données décrits dans schema.prisma et meal_app_db_specHAM.md. Les routes sont organisées par catégorie (CRUD pour les entités DB, IA conversationnelle, recherche RAG, etc.).
Puisque l'application est destinée à un usage personnel unique sur un VPS, sans besoin de multi-utilisateurs, l'authentification est supprimée. Toutes les routes sont ouvertes et publiques. Pour les entités liées à un utilisateur (ex. : MealHistory, FamilyPreference), un userId fixe est utilisé en backend (configurable via variable d'environnement, ex. : DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'). Les responses sont au format JSON, avec gestion d'erreurs standard (ex. : { error: string, status: number }).
Conventions générales :

Authentification : Aucune. Pas de sessions ou de vérifications userId/ownership.
UserId Handling : Utiliser un userId fixe en backend pour les créations/queries impliquant MealHistory ou FamilyPreference.
Validation : Utiliser Zod pour valider les payloads entrants. Appliquer les règles d'erreurs critiques de gestion_erreurs_critiques_meal_appHAM.md (ex. : unités logiques pour ingrédients, cohérence recette, doublons).
Streaming : Pour les routes IA (ex. : chat), utiliser streaming SSE pour réponses en temps réel.
RAG : Recherche vectorielle via Prisma et pgvector (ex. : $queryRaw pour cosine similarity).
Erreur handling : Retourner HTTP 400 pour validations échouées, 500 pour serveur. Inclure messages d'erreur descriptifs.
Pagination : Pour les listes (ex. : recettes), supporter query params page (int, default 1) et limit (int, default 10).
Rate limiting : Optionnel via middleware (ex. : upstash/ratelimit) pour une sécurité basique.

1. Routes CRUD pour Recettes (/api/recipes/*)
Liées au model Recipe. Supporte embeddings pour RAG.

Endpoint : /api/recipes (GET)

Description : Lister les recettes (avec pagination et filtres).
Query Params : page (int), limit (int), dishType (enum DishType), difficulty (enum Difficulty), search (string pour recherche textuelle simple).
Response : { recipes: Recipe[], total: int } (200 OK).


Endpoint : /api/recipes (POST)

Description : Créer une nouvelle recette (manuellement ou via IA).
Body : { name: string, prepTime: int, cookTime: int, difficulty: Difficulty, dishType: DishType, instructions: string[], tips: string, ingredients: { ingredientId: uuid, quantity: float, unit: UnitType }[] }.
Validations : Champs obligatoires (nom, au moins 2 instructions, 1 ingrédient). Vérifier logique (ex. : instructions ordonnées, unités compatibles via Ingredient.units). Détecter doublons (similarité >=85% via cosine sur embeddings).
Actions : Générer embedding via OpenAI, vérifier cohérence type/contenu (ex. : dessert sans viande).
Response : { recipe: Recipe } (201 Created).


Endpoint : /api/recipes/[id] (GET)

Description : Récupérer une recette par ID.
Params : id (uuid).
Response : { recipe: Recipe } (200 OK) ou 404 Not Found.


Endpoint : /api/recipes/[id] (PUT)

Description : Mettre à jour une recette.
Params : id (uuid).
Body : Partial<recipe> (champs modifiables).</recipe>
Validations : Comme POST.
Actions : Mettre à jour embedding si contenu change.
Response : { recipe: Recipe } (200 OK).


Endpoint : /api/recipes/[id] (DELETE)

Description : Supprimer une recette.
Params : id (uuid).
Response : { message: "Deleted" } (200 OK).



2. Routes CRUD pour Ingrédients (/api/ingredients/*)
Liées au model Ingredient.

Endpoint : /api/ingredients (GET)

Description : Lister les ingrédients (pagination, filtres par category).
Query Params : page, limit, category (string), search (string).
Response : { ingredients: Ingredient[], total: int }.


Endpoint : /api/ingredients (POST)

Description : Ajouter un ingrédient.
Body : { name: string, category: string, units: UnitType[] }.
Validations : Nom normalisé (minuscule, singularisé), pas de doublons (recherche floue via Levenshtein).
Actions : Générer embedding optionnel.
Response : { ingredient: Ingredient } (201 Created).


Endpoint : /api/ingredients/[id] (GET)

Description : Récupérer un ingrédient par ID.
Params : id (uuid).
Response : { ingredient: Ingredient } (200 OK) ou 404 Not Found.


Endpoint : /api/ingredients/[id] (PUT)

Description : Mettre à jour un ingrédient.
Params : id (uuid).
Body : Partial<ingredient> (champs modifiables).</ingredient>
Validations : Comme POST.
Actions : Mettre à jour embedding si nécessaire.
Response : { ingredient: Ingredient } (200 OK).


Endpoint : /api/ingredients/[id] (DELETE)

Description : Supprimer un ingrédient.
Params : id (uuid).
Response : { message: "Deleted" } (200 OK).



3. Routes pour Liste de Courses et Catégories (/api/shopping/* et /api/categories/*)

Endpoint : /api/shopping/items (GET)

Description : Lister les items de la liste de courses.
Query Params : page, limit, categoryId (uuid).
Response : { items: ShoppingItem[], total: int } (200 OK).


Endpoint : /api/shopping/items (POST)

Description : Ajouter un item à la liste de courses.
Body : { name: string, categoryId: uuid }.
Validations : Fusionner doublons, convertir unités si possible.
Response : { item: ShoppingItem } (201 Created).


Endpoint : /api/shopping/items/[id] (GET/PUT/DELETE)

Description : Récupérer/Mettre à jour/Supprimer un item par ID.
Params : id (uuid).
Body (PUT) : Partial<shoppingitem>.</shoppingitem>
Response : { item: ShoppingItem } ou { message: "Deleted" }.


Endpoint : /api/categories (GET)

Description : Lister les catégories.
Query Params : page, limit, search (string).
Response : { categories: Category[], total: int } (200 OK).


Endpoint : /api/categories (POST)

Description : Ajouter une catégorie.
Body : { name: string, linkedItemId: uuid?, linkedItemType: string? }.
Validations : Nom unique, liaison valide si fournie.
Response : { category: Category } (201 Created).


Endpoint : /api/categories/[id] (GET/PUT/DELETE)

Description : Récupérer/Mettre à jour/Supprimer une catégorie par ID.
Params : id (uuid).
Body (PUT) : Partial<category>.</category>
Response : { category: Category } ou { message: "Deleted" }.



4. Routes pour Historique Repas et Préférences Familiales (/api/meal-history/* et /api/family-preferences/*)

Endpoint : /api/meal-history (GET)

Description : Lister l'historique des repas (filtration par date).
Query Params : page, limit, fromDate (DateTime), toDate (DateTime).
Response : { histories: MealHistory[], total: int } (200 OK).


Endpoint : /api/meal-history (POST)

Description : Ajouter une entrée à l'historique.
Body : { recipeId: uuid, date: DateTime, notes: string }.
Validations : Pas de doublons le même jour sans confirmation (alerte), dates logiques (pas futures sauf planification).
Actions : Utiliser userId fixe.
Response : { history: MealHistory } (201 Created).


Endpoint : /api/meal-history/[id] (GET/PUT/DELETE)

Description : Récupérer/Mettre à jour/Supprimer une entrée par ID.
Params : id (uuid).
Body (PUT) : Partial<mealhistory>.</mealhistory>
Response : { history: MealHistory } ou { message: "Deleted" }.


Endpoint : /api/family-preferences (GET)

Description : Lister les préférences familiales.
Query Params : page, limit, familyMember (string), type (PreferenceType).
Response : { preferences: FamilyPreference[], total: int } (200 OK).


Endpoint : /api/family-preferences (POST)

Description : Ajouter une préférence familiale.
Body : { familyMember: string, type: PreferenceType, targetType: TargetType, targetId: uuid, notes: string }.
Validations : Traduire ambiguïtés (ex. : "viande rouge" → ingrédients spécifiques), marquer comme "à valider" si vague.
Actions : Utiliser userId fixe.
Response : { preference: FamilyPreference } (201 Created).


Endpoint : /api/family-preferences/[id] (GET/PUT/DELETE)

Description : Récupérer/Mettre à jour/Supprimer une préférence par ID.
Params : id (uuid).
Body (PUT) : Partial<familypreference>.</familypreference>
Response : { preference: FamilyPreference } ou { message: "Deleted" }.



5. Routes IA Conversationnelle et RAG (/api/ai/*)
Intégration LangChain/OpenAI. Utiliser agents spécialisés (Chef, Planificateur, Chat). Vérifications sur historique et préférences utilisent le userId fixe.

Endpoint : /api/ai/chat (POST)

Description : Chat conversationnel avec streaming (ex. : suggestions recettes, enregistrement prefs).
Body : { message: string, context: object (historique chat) }.
Actions : Vérifier historique (MealHistory <7 jours), prefs familiales. Fallback web si recette non trouvée. Utiliser agents pour orchestration.
Response : Stream SSE { chunk: string } ou JSON final { response: string, recipe?: Recipe }.
Validations : Gérer ambiguïtés prefs, valider extractions (ex. : ingrédients normalisés).


Endpoint : /api/ai/generate-recipe (POST)

Description : Générer recette via IA.
Body : { prompt: string (ex. : "Dessert avec tomates"), preferences: FamilyPreference[] }.
Actions : Utiliser Chef Agent, générer embedding, valider (incomplètes, incohérences), sauvegarder si validé.
Response : { recipe: Recipe }.


Endpoint : /api/ai/search-rag (POST)

Description : Recherche sémantique recettes/ingrédients.
Body : { query: string, k: int (top K résultats), filters: { dishType?: DishType } }.
Actions : Embed query via OpenAI, query Prisma avec cosine similarity (HNSW index). Fusion hybride textuelle/vectorielle.
Response : { results: { item: Recipe|Ingredient, score: float }[] }.


Endpoint : /api/ai/plan-meals (POST)

Description : Générer plan hebdomadaire.
Body : { weekStart: Date, budget: float?, timeConstraints: object }.
Actions : Utiliser Planificateur Agent, optimiser via prefs/historique.
Response : { plan: { day: Date, meals: Recipe[] }[] }.



6. Routes Utilitaires

Endpoint : /api/embeddings/generate (POST)

Description : Générer embeddings pour recette/ingrédient (interne ou manuel).
Body : { text: string }.
Response : { embedding: float[] }.


Endpoint : /api/notifications (POST)

Description : Envoyer notifications push (ex. : via Expo pour mobile).
Body : { message: string }.
Response : { message: "Sent" } (200 OK).



Notes Supplémentaires

Intégration Cross-Platform : Les routes sont accessibles depuis web (Next.js) et mobile (React Native via Solito). Utiliser React Query pour caching/sync offline.
Performance : Cache Redis pour requêtes fréquentes (ex. : RAG). Bundle splitting pour API routes.
Sécurité : CSP/HSTS headers, Zod validation, rate limiting optionnel. Activer HTTPS sur VPS.
Tests : Couvrir avec Jest (unitaires pour validations) et Playwright (E2E pour flows IA).
Schema Prisma Optionnel : Si désiré, supprimer User model et relations userId pour simplifier davantage (rendre tables globales).