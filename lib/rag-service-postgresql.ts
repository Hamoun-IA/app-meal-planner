// =============================================================================
// SERVICE RAG POSTGRESQL - ASSISTANTE BABOUNETTE
// =============================================================================

import { prisma } from './prisma';
import { RecipeWithIngredients } from './prisma';

// =============================================================================
// TYPES ET INTERFACES
// =============================================================================

export interface SearchFilters {
  cuisine?: string;
  difficulty?: string;
  maxPrepTime?: number;
  maxCookTime?: number;
  maxCalories?: number;
  tags?: string[];
  categories?: string[];
  allergens?: string[];
}

export interface SearchResult {
  recipe: RecipeWithIngredients;
  score: number;
  matchType: 'vector' | 'text' | 'hybrid';
  matchedTerms?: string[];
  similarity?: number;
  textRank?: number;
}

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

export interface VectorSearchResult {
  id: string;
  title: string;
  description: string | null;
  similarity: number;
}

export interface HybridSearchResult {
  id: string;
  title: string;
  description: string | null;
  similarity: number;
  textRank: number;
}

// =============================================================================
// SERVICE D'EMBEDDINGS
// =============================================================================

/**
 * Service pour gérer les embeddings OpenAI
 */
class EmbeddingService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = 'text-embedding-3-small';
  }

  /**
   * Génère un embedding pour un texte donné
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      // Vérifier le cache d'abord
      const cached = await this.getCachedEmbedding(text);
      if (cached) {
        return cached;
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: this.model,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur OpenAI: ${response.statusText}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;
      const tokens = data.usage.total_tokens;

      // Mettre en cache
      await this.cacheEmbedding(text, embedding, tokens);

      return { embedding, tokens };
    } catch (error) {
      console.error('Erreur lors de la génération d\'embedding:', error);
      throw error;
    }
  }

  /**
   * Récupère un embedding depuis le cache
   */
  private async getCachedEmbedding(text: string): Promise<EmbeddingResult | null> {
    try {
      const cached = await prisma.embeddingCache.findUnique({
        where: { text },
      });

      if (cached) {
        return {
          embedding: cached.embedding as number[],
          tokens: 0, // Non stocké en cache
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }

  /**
   * Met en cache un embedding
   */
  private async cacheEmbedding(text: string, embedding: number[], tokens: number): Promise<void> {
    try {
      await prisma.embeddingCache.upsert({
        where: { text },
        update: {
          embedding: embedding as any,
          model: this.model,
        },
        create: {
          text,
          embedding: embedding as any,
          model: this.model,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la mise en cache:', error);
    }
  }
}

// =============================================================================
// SERVICE DE RECHERCHE RAG POSTGRESQL
// =============================================================================

/**
 * Service RAG PostgreSQL pour la recherche hybride vectorielle + textuelle
 */
export class PostgreSQLRAGService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Recherche hybride de recettes avec PostgreSQL
   */
  async searchRecipes(
    query: string,
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SearchResult[]> {
    try {
      // Générer l'embedding de la requête
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Recherche hybride avec PostgreSQL
      const hybridResults = await this.hybridSearch(query, queryEmbedding.embedding, filters, limit);

      // Récupérer les recettes complètes
      const recipeIds = hybridResults.map(result => result.id);
      const recipes = await prisma.recipe.findMany({
        where: { id: { in: recipeIds } },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      // Mapper les résultats
      return hybridResults.map(result => {
        const recipe = recipes.find(r => r.id === result.id);
        if (!recipe) {
          throw new Error(`Recette ${result.id} non trouvée`);
        }

        return {
          recipe: recipe as unknown as RecipeWithIngredients,
          score: result.similarity + result.textRank,
          matchType: 'hybrid' as const,
          similarity: result.similarity,
          textRank: result.textRank,
        };
      });
    } catch (error) {
      console.error('Erreur lors de la recherche RAG PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Recherche vectorielle pure avec PostgreSQL
   */
  async vectorSearch(
    query: string,
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SearchResult[]> {
    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      
      // Utiliser la fonction PostgreSQL pour la recherche vectorielle
      const results = await prisma.$queryRaw<VectorSearchResult[]>`
        SELECT 
          id,
          title,
          description,
          similarity
        FROM search_recipes_vector(${queryEmbedding.embedding}::vector(768), 0.7, ${limit})
        WHERE similarity > 0.7
        ORDER BY similarity DESC
      `;

      // Récupérer les recettes complètes
      const recipeIds = results.map(result => result.id);
      const recipes = await prisma.recipe.findMany({
        where: { id: { in: recipeIds } },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      return results.map(result => {
        const recipe = recipes.find(r => r.id === result.id);
        if (!recipe) {
          throw new Error(`Recette ${result.id} non trouvée`);
        }

        return {
          recipe: recipe as unknown as RecipeWithIngredients,
          score: result.similarity,
          matchType: 'vector' as const,
          similarity: result.similarity,
        };
      });
    } catch (error) {
      console.error('Erreur lors de la recherche vectorielle:', error);
      return [];
    }
  }

  /**
   * Recherche hybride avec PostgreSQL
   */
  private async hybridSearch(
    query: string,
    embedding: number[],
    filters: SearchFilters,
    limit: number
  ): Promise<HybridSearchResult[]> {
    try {
      // Construire les conditions de filtrage
      const filterConditions = this.buildFilterConditions(filters);
      
      // Utiliser la fonction PostgreSQL pour la recherche hybride
      const results = await prisma.$queryRaw<HybridSearchResult[]>`
        SELECT 
          id,
          title,
          description,
          similarity,
          text_rank
        FROM search_recipes_hybrid(${query}, ${embedding}::vector(768), 0.7, ${limit})
        WHERE similarity > 0.7 OR text_rank > 0
        ${filterConditions}
        ORDER BY (similarity + text_rank) DESC
        LIMIT ${limit}
      `;

      return results;
    } catch (error) {
      console.error('Erreur lors de la recherche hybride:', error);
      return [];
    }
  }

  /**
   * Construit les conditions de filtrage pour PostgreSQL
   */
  private buildFilterConditions(filters: SearchFilters): any {
    const conditions = [];

    if (filters.cuisine) {
      conditions.push(`AND cuisine = '${filters.cuisine}'`);
    }

    if (filters.difficulty) {
      conditions.push(`AND difficulty = '${filters.difficulty}'`);
    }

    if (filters.maxPrepTime) {
      conditions.push(`AND prep_time <= ${filters.maxPrepTime}`);
    }

    if (filters.maxCookTime) {
      conditions.push(`AND cook_time <= ${filters.maxCookTime}`);
    }

    if (filters.maxCalories) {
      conditions.push(`AND calories <= ${filters.maxCalories}`);
    }

    if (filters.tags && filters.tags.length > 0) {
      const tagsJson = JSON.stringify(filters.tags);
      conditions.push(`AND tags @> '${tagsJson}'::jsonb`);
    }

    if (filters.categories && filters.categories.length > 0) {
      const categoriesJson = JSON.stringify(filters.categories);
      conditions.push(`AND categories @> '${categoriesJson}'::jsonb`);
    }

    return conditions.length > 0 ? conditions.join(' ') : '';
  }

  /**
   * Met à jour les embeddings d'une recette
   */
  async updateRecipeEmbedding(recipeId: string): Promise<void> {
    try {
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      if (!recipe) {
        throw new Error('Recette non trouvée');
      }

      // Créer le texte pour l'embedding
      const searchText = this.createSearchText(recipe as unknown as RecipeWithIngredients);

      // Générer l'embedding
      const embedding = await this.embeddingService.generateEmbedding(searchText);

      // Mettre à jour la recette
      await prisma.recipe.update({
        where: { id: recipeId },
        data: {
          embedding: embedding.embedding as any,
        },
      });

      // Mettre à jour l'index de recherche
      await this.updateSearchIndex(recipeId, searchText, embedding.embedding);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'embedding:', error);
      throw error;
    }
  }

  /**
   * Met à jour l'index de recherche
   */
  private async updateSearchIndex(recipeId: string, searchText: string, embedding: number[]): Promise<void> {
    try {
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
      });

      if (!recipe) {
        throw new Error('Recette non trouvée');
      }

      await prisma.recipeSearchIndex.upsert({
        where: { recipeId },
        update: {
          searchText,
          embedding: embedding as any,
          tags: recipe.tags,
          categories: recipe.categories,
          cuisine: recipe.cuisine,
          difficulty: recipe.difficulty,
        },
        create: {
          recipeId,
          searchText,
          embedding: embedding as any,
          tags: recipe.tags,
          categories: recipe.categories,
          cuisine: recipe.cuisine,
          difficulty: recipe.difficulty,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'index:', error);
    }
  }

  /**
   * Crée le texte de recherche pour une recette
   */
  private createSearchText(recipe: RecipeWithIngredients): string {
    const parts = [
      recipe.title,
      recipe.description,
      ...recipe.tags,
      ...recipe.categories,
      recipe.cuisine,
      recipe.difficulty,
      ...recipe.ingredients.map(ri => ri.ingredient.name),
      ...recipe.instructions,
    ];

    return parts.filter(Boolean).join(' ');
  }

  /**
   * Met à jour les embeddings de toutes les recettes
   */
  async updateAllRecipeEmbeddings(): Promise<void> {
    try {
      console.log('🔄 Mise à jour des embeddings pour toutes les recettes...');
      
      const recipes = await prisma.recipe.findMany({
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      let updated = 0;
      for (const recipe of recipes) {
        try {
          await this.updateRecipeEmbedding(recipe.id);
          updated++;
          
          if (updated % 10 === 0) {
            console.log(`✅ ${updated}/${recipes.length} recettes mises à jour`);
          }
        } catch (error) {
          console.error(`❌ Erreur pour la recette ${recipe.id}:`, error);
        }
      }

      console.log(`🎉 Mise à jour terminée: ${updated}/${recipes.length} recettes`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des embeddings:', error);
      throw error;
    }
  }

  /**
   * Recherche par similarité d'ingrédients
   */
  async searchByIngredients(ingredients: string[], limit: number = 20): Promise<SearchResult[]> {
    try {
      const searchText = ingredients.join(' ');
      const queryEmbedding = await this.embeddingService.generateEmbedding(searchText);

      // Recherche vectorielle avec focus sur les ingrédients
      const results = await prisma.$queryRaw<VectorSearchResult[]>`
        SELECT 
          r.id,
          r.title,
          r.description,
          1 - (r.embedding <=> ${queryEmbedding.embedding}::vector(768)) as similarity
        FROM recipes r
        WHERE r.embedding IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE ri.recipe_id = r.id
              AND i.name ILIKE ANY(${ingredients}::text[])
          )
        ORDER BY r.embedding <=> ${queryEmbedding.embedding}::vector(768)
        LIMIT ${limit}
      `;

      // Récupérer les recettes complètes
      const recipeIds = results.map(result => result.id);
      const recipes = await prisma.recipe.findMany({
        where: { id: { in: recipeIds } },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      return results.map(result => {
        const recipe = recipes.find(r => r.id === result.id);
        if (!recipe) {
          throw new Error(`Recette ${result.id} non trouvée`);
        }

        return {
          recipe: recipe as unknown as RecipeWithIngredients,
          score: result.similarity,
          matchType: 'vector' as const,
          similarity: result.similarity,
        };
      });
    } catch (error) {
      console.error('Erreur lors de la recherche par ingrédients:', error);
      return [];
    }
  }

  /**
   * Statistiques de recherche
   */
  async getSearchStats(): Promise<{
    totalRecipes: number;
    recipesWithEmbeddings: number;
    cacheSize: number;
    indexSize: number;
  }> {
    try {
      const [totalRecipes, recipesWithEmbeddings, cacheSize, indexSize] = await Promise.all([
        prisma.recipe.count(),
        prisma.recipe.count({ where: { embedding: { not: null } } }),
        prisma.embeddingCache.count(),
        prisma.recipeSearchIndex.count(),
      ]);

      return {
        totalRecipes,
        recipesWithEmbeddings,
        cacheSize,
        indexSize,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

// =============================================================================
// INSTANCE GLOBALE
// =============================================================================

export const postgreSQLRAGService = new PostgreSQLRAGService(); 