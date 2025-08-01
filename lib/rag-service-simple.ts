// =============================================================================
// SERVICE RAG SIMPLIFIÉ - ASSISTANTE BABOUNETTE (SQLITE)
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
  matchType: 'text' | 'filter';
  matchedTerms?: string[];
}

// =============================================================================
// SERVICE RAG SIMPLIFIÉ
// =============================================================================

/**
 * Service RAG simplifié pour SQLite (sans embeddings)
 */
export class SimpleRAGService {
  /**
   * Recherche de recettes avec filtres textuels
   */
  async searchRecipes(
    query: string,
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SearchResult[]> {
    try {
      // Recherche textuelle simple
      const recipes = await prisma.recipe.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
          ...this.buildWhereClause(filters),
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
        take: limit,
        orderBy: { title: 'asc' },
      });

      return recipes.map(recipe => ({
        recipe: recipe as unknown as RecipeWithIngredients,
        score: 1.0,
        matchType: 'text' as const,
        matchedTerms: [query],
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
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

    return where;
  }
}

// =============================================================================
// INSTANCE GLOBALE
// =============================================================================

export const simpleRagService = new SimpleRAGService(); 