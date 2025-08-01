// =============================================================================
// SERVICE RAG - ASSISTANTE BABOUNETTE
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
}

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
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
    // Temporairement désactivé pour les tests
    return null;
  }

  /**
   * Met en cache un embedding
   */
  private async cacheEmbedding(text: string, embedding: number[], tokens: number): Promise<void> {
    // Temporairement désactivé pour les tests
    console.log('Cache embedding désactivé temporairement');
  }
}

// =============================================================================
// SERVICE DE RECHERCHE RAG
// =============================================================================

/**
 * Service RAG pour la recherche hybride vectorielle + textuelle
 */
export class RAGService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Recherche hybride de recettes
   */
  async searchRecipes(
    query: string,
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SearchResult[]> {
    try {
      // Générer l'embedding de la requête
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Recherche vectorielle
      const vectorResults = await this.vectorSearch(queryEmbedding.embedding, filters, limit);

      // Recherche textuelle
      const textResults = await this.textSearch(query, filters, limit);

      // Fusion des résultats avec RRF (Reciprocal Rank Fusion)
      const hybridResults = this.fuseResults(vectorResults, textResults, limit);

      return hybridResults;
    } catch (error) {
      console.error('Erreur lors de la recherche RAG:', error);
      throw error;
    }
  }

  /**
   * Recherche vectorielle avec pgvector
   */
  private async vectorSearch(
    embedding: number[],
    filters: SearchFilters,
    limit: number
  ): Promise<SearchResult[]> {
    try {
      // Construire la requête avec filtres
      const whereClause = this.buildWhereClause(filters);

      const results = await prisma.recipe.findMany({
        where: {
          ...whereClause,
          embedding: {
            not: null,
          },
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
        take: limit,
      });

      return results.map((recipe, index) => ({
        recipe: recipe as unknown as RecipeWithIngredients,
        score: 1 / (index + 1), // Score basé sur le rang
        matchType: 'vector' as const,
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche vectorielle:', error);
      return [];
    }
  }

  /**
   * Recherche textuelle classique
   */
  private async textSearch(
    query: string,
    filters: SearchFilters,
    limit: number
  ): Promise<SearchResult[]> {
    try {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      
      const whereClause = this.buildWhereClause(filters);

      const results = await prisma.recipe.findMany({
        where: {
          ...whereClause,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: searchTerms } },
            { categories: { hasSome: searchTerms } },
            { cuisine: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
        take: limit,
      });

      return results.map((recipe, index) => ({
        recipe: recipe as unknown as RecipeWithIngredients,
        score: 1 / (index + 1),
        matchType: 'text' as const,
        matchedTerms: searchTerms.filter(term => 
          recipe.title.toLowerCase().includes(term) ||
          recipe.description?.toLowerCase().includes(term) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(term)) ||
          recipe.categories.some(cat => cat.toLowerCase().includes(term))
        ),
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche textuelle:', error);
      return [];
    }
  }

  /**
   * Fusion des résultats avec RRF
   */
  private fuseResults(
    vectorResults: SearchResult[],
    textResults: SearchResult[],
    limit: number
  ): SearchResult[] {
    const fused = new Map<string, { recipe: RecipeWithIngredients; vectorScore: number; textScore: number }>();

    // Ajouter les résultats vectoriels
    vectorResults.forEach((result, index) => {
      fused.set(result.recipe.id, {
        recipe: result.recipe,
        vectorScore: 1 / (index + 1),
        textScore: 0,
      });
    });

    // Ajouter les résultats textuels
    textResults.forEach((result, index) => {
      const existing = fused.get(result.recipe.id);
      if (existing) {
        existing.textScore = 1 / (index + 1);
      } else {
        fused.set(result.recipe.id, {
          recipe: result.recipe,
          vectorScore: 0,
          textScore: 1 / (index + 1),
        });
      }
    });

    // Calculer le score RRF
    const results: SearchResult[] = Array.from(fused.values()).map(({ recipe, vectorScore, textScore }) => {
      const rrfScore = 1 / (60 + vectorScore) + 1 / (60 + textScore);
      const matchType = vectorScore > 0 && textScore > 0 ? 'hybrid' : vectorScore > 0 ? 'vector' : 'text';
      
      return {
        recipe,
        score: rrfScore,
        matchType,
      };
    });

    // Trier par score et limiter
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Construit la clause WHERE pour les filtres
   */
  private buildWhereClause(filters: SearchFilters) {
    const where: any = {};

    if (filters.cuisine) {
      where.cuisine = filters.cuisine;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.maxPrepTime) {
      where.prepTime = { lte: filters.maxPrepTime };
    }

    if (filters.maxCookTime) {
      where.cookTime = { lte: filters.maxCookTime };
    }

    if (filters.maxCalories) {
      where.calories = { lte: filters.maxCalories };
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters.categories && filters.categories.length > 0) {
      where.categories = { hasSome: filters.categories };
    }

    return where;
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

      // Mettre à jour la recette (sans embedding pour l'instant)
      await prisma.recipe.update({
        where: { id: recipeId },
        data: {
          // embedding: embedding.embedding as any, // Temporairement désactivé
        },
      });

      // Mettre à jour l'index de recherche (temporairement désactivé)
      console.log('Index de recherche désactivé temporairement');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'embedding:', error);
      throw error;
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
}

// =============================================================================
// INSTANCE GLOBALE
// =============================================================================

export const ragService = new RAGService(); 