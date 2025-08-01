// =============================================================================
// SERVICE RECETTES - ASSISTANTE BABOUNETTE
// =============================================================================

import { prisma, RecipeWithIngredients } from '../prisma';
import { ragService } from '../rag-service';
import { z } from 'zod';

// =============================================================================
// SCHÉMAS DE VALIDATION ZOD
// =============================================================================

const RecipeIngredientSchema = z.object({
  ingredientId: z.string().min(1, 'Ingrédient requis'),
  quantity: z.number().positive('Quantité doit être positive'),
  unit: z.string().min(1, 'Unité requise'),
  notes: z.string().optional(),
});

const RecipeSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
  description: z.string().optional(),
  instructions: z.array(z.string().min(1, 'Instruction requise')).min(1, 'Au moins une instruction'),
  prepTime: z.number().int().positive('Temps de préparation doit être positif'),
  cookTime: z.number().int().positive('Temps de cuisson doit être positif'),
  servings: z.number().int().positive('Nombre de portions doit être positif'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Difficulté doit être beginner, intermediate ou advanced' }),
  }),
  cuisine: z.string().optional(),
  imageUrl: z.string().url('URL d\'image invalide').optional(),
  thumbnailUrl: z.string().url('URL de miniature invalide').optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  calories: z.number().int().positive().optional(),
  protein: z.number().positive().optional(),
  carbs: z.number().positive().optional(),
  fat: z.number().positive().optional(),
  fiber: z.number().positive().optional(),
  sugar: z.number().positive().optional(),
  sodium: z.number().positive().optional(),
  ingredients: z.array(RecipeIngredientSchema).min(1, 'Au moins un ingrédient requis'),
});

const RecipeUpdateSchema = RecipeSchema.partial();

// =============================================================================
// TYPES
// =============================================================================

export type CreateRecipeData = z.infer<typeof RecipeSchema>;
export type UpdateRecipeData = z.infer<typeof RecipeUpdateSchema>;

export interface RecipeFilters {
  userId?: string;
  cuisine?: string;
  difficulty?: string;
  maxPrepTime?: number;
  maxCookTime?: number;
  maxCalories?: number;
  tags?: string[];
  categories?: string[];
  search?: string;
}

export interface RecipeStats {
  totalRecipes: number;
  totalCalories: number;
  averagePrepTime: number;
  averageCookTime: number;
  mostUsedIngredients: Array<{ name: string; count: number }>;
  cuisineDistribution: Array<{ cuisine: string; count: number }>;
}

// =============================================================================
// SERVICE RECETTES
// =============================================================================

/**
 * Service de gestion des recettes avec validation et RAG
 */
export class RecipeService {
  /**
   * Crée une nouvelle recette
   */
  async createRecipe(userId: string, data: CreateRecipeData): Promise<RecipeWithIngredients> {
    try {
      // Validation des données
      const validatedData = RecipeSchema.parse(data);

      // Vérifier que tous les ingrédients existent
      const ingredientIds = validatedData.ingredients.map(ing => ing.ingredientId);
      const existingIngredients = await prisma.ingredient.findMany({
        where: { id: { in: ingredientIds } },
      });

      if (existingIngredients.length !== ingredientIds.length) {
        throw new Error('Certains ingrédients n\'existent pas');
      }

      // Créer la recette avec transaction
      const recipe = await prisma.$transaction(async (tx) => {
        // Créer la recette
        const newRecipe = await tx.recipe.create({
          data: {
            ...validatedData,
            userId,
            ingredients: {
              create: validatedData.ingredients,
            },
          },
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        });

        // Générer l'embedding en arrière-plan
        this.updateRecipeEmbedding(newRecipe.id).catch(console.error);

        return newRecipe as unknown as RecipeWithIngredients;
      });

      return recipe;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation échouée: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Met à jour une recette existante
   */
  async updateRecipe(
    recipeId: string,
    userId: string,
    data: UpdateRecipeData
  ): Promise<RecipeWithIngredients> {
    try {
      // Vérifier que la recette appartient à l'utilisateur
      const existingRecipe = await prisma.recipe.findFirst({
        where: { id: recipeId, userId },
      });

      if (!existingRecipe) {
        throw new Error('Recette non trouvée ou accès refusé');
      }

      // Validation des données
      const validatedData = RecipeUpdateSchema.parse(data);

      // Mettre à jour avec transaction
      const recipe = await prisma.$transaction(async (tx) => {
        // Supprimer les anciens ingrédients si de nouveaux sont fournis
        if (validatedData.ingredients) {
          await tx.recipeIngredient.deleteMany({
            where: { recipeId },
          });
        }

        // Mettre à jour la recette
        const updatedRecipe = await tx.recipe.update({
          where: { id: recipeId },
          data: {
            title: validatedData.title,
            description: validatedData.description,
            instructions: validatedData.instructions,
            prepTime: validatedData.prepTime,
            cookTime: validatedData.cookTime,
            servings: validatedData.servings,
            difficulty: validatedData.difficulty,
            cuisine: validatedData.cuisine,
            imageUrl: validatedData.imageUrl,
            thumbnailUrl: validatedData.thumbnailUrl,
            tags: validatedData.tags,
            categories: validatedData.categories,
            calories: validatedData.calories,
            protein: validatedData.protein,
            carbs: validatedData.carbs,
            fat: validatedData.fat,
            fiber: validatedData.fiber,
            sugar: validatedData.sugar,
            sodium: validatedData.sodium,
            ...(validatedData.ingredients && {
              ingredients: {
                create: validatedData.ingredients,
              },
            }),
          },
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        });

        // Mettre à jour l'embedding
        this.updateRecipeEmbedding(recipeId).catch(console.error);

        return updatedRecipe as unknown as RecipeWithIngredients;
      });

      return recipe;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation échouée: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Récupère une recette par ID
   */
  async getRecipeById(recipeId: string): Promise<RecipeWithIngredients | null> {
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
    return recipe as unknown as RecipeWithIngredients | null;
  }

  /**
   * Récupère les recettes d'un utilisateur avec filtres
   */
  async getUserRecipes(userId: string, filters: RecipeFilters = {}): Promise<RecipeWithIngredients[]> {
    const where: any = { userId };

    if (filters.cuisine) where.cuisine = filters.cuisine;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.maxPrepTime) where.prepTime = { lte: filters.maxPrepTime };
    if (filters.maxCookTime) where.cookTime = { lte: filters.maxCookTime };
    if (filters.maxCalories) where.calories = { lte: filters.maxCalories };
    if (filters.tags && filters.tags.length > 0) where.tags = { hasSome: filters.tags };
    if (filters.categories && filters.categories.length > 0) where.categories = { hasSome: filters.categories };

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return recipes as unknown as RecipeWithIngredients[];
  }

  /**
   * Recherche de recettes avec RAG
   */
  async searchRecipes(
    query: string,
    filters: RecipeFilters = {},
    limit: number = 20
  ): Promise<RecipeWithIngredients[]> {
    const searchFilters = {
      cuisine: filters.cuisine,
      difficulty: filters.difficulty,
      maxPrepTime: filters.maxPrepTime,
      maxCookTime: filters.maxCookTime,
      maxCalories: filters.maxCalories,
      tags: filters.tags,
      categories: filters.categories,
    };

    const results = await ragService.searchRecipes(query, searchFilters, limit);
    return results.map(result => result.recipe);
  }

  /**
   * Supprime une recette
   */
  async deleteRecipe(recipeId: string, userId: string): Promise<void> {
    const recipe = await prisma.recipe.findFirst({
      where: { id: recipeId, userId },
    });

    if (!recipe) {
      throw new Error('Recette non trouvée ou accès refusé');
    }

    await prisma.recipe.delete({
      where: { id: recipeId },
    });
  }

  /**
   * Ajoute/retire une recette des favoris
   */
  async toggleFavorite(recipeId: string, userId: string): Promise<boolean> {
    const existing = await prisma.favoriteRecipe.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    if (existing) {
      await prisma.favoriteRecipe.delete({
        where: { userId_recipeId: { userId, recipeId } },
      });
      return false;
    } else {
      await prisma.favoriteRecipe.create({
        data: { userId, recipeId },
      });
      return true;
    }
  }

  /**
   * Récupère les recettes favorites d'un utilisateur
   */
  async getFavoriteRecipes(userId: string): Promise<RecipeWithIngredients[]> {
    const favorites = await prisma.favoriteRecipe.findMany({
      where: { userId },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map(fav => fav.recipe as unknown as RecipeWithIngredients);
  }

  /**
   * Récupère les statistiques des recettes d'un utilisateur
   */
  async getRecipeStats(userId: string): Promise<RecipeStats> {
    const recipes = await prisma.recipe.findMany({
      where: { userId },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    const totalRecipes = recipes.length;
    const totalCalories = recipes.reduce((sum, recipe) => sum + (recipe.calories || 0), 0);
    const averagePrepTime = recipes.reduce((sum, recipe) => sum + recipe.prepTime, 0) / totalRecipes || 0;
    const averageCookTime = recipes.reduce((sum, recipe) => sum + recipe.cookTime, 0) / totalRecipes || 0;

    // Ingrédients les plus utilisés
    const ingredientCounts = new Map<string, number>();
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ri => {
        const name = ri.ingredient.name;
        ingredientCounts.set(name, (ingredientCounts.get(name) || 0) + 1);
      });
    });

    const mostUsedIngredients = Array.from(ingredientCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Distribution des cuisines
    const cuisineCounts = new Map<string, number>();
    recipes.forEach(recipe => {
      if (recipe.cuisine) {
        cuisineCounts.set(recipe.cuisine, (cuisineCounts.get(recipe.cuisine) || 0) + 1);
      }
    });

    const cuisineDistribution = Array.from(cuisineCounts.entries())
      .map(([cuisine, count]) => ({ cuisine, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRecipes,
      totalCalories,
      averagePrepTime,
      averageCookTime,
      mostUsedIngredients,
      cuisineDistribution,
    };
  }

  /**
   * Met à jour l'embedding d'une recette
   */
  private async updateRecipeEmbedding(recipeId: string): Promise<void> {
    try {
      await ragService.updateRecipeEmbedding(recipeId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'embedding:', error);
    }
  }
}

// =============================================================================
// INSTANCE GLOBALE
// =============================================================================

export const recipeService = new RecipeService(); 