// =============================================================================
// SERVICE INGRÉDIENTS - ASSISTANTE BABOUNETTE
// =============================================================================

import { prisma } from '../prisma';
import { z } from 'zod';

// =============================================================================
// SCHÉMAS DE VALIDATION ZOD
// =============================================================================

const IngredientSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  description: z.string().optional(),
  calories: z.number().positive('Calories doivent être positives').optional(),
  protein: z.number().positive('Protéines doivent être positives').optional(),
  carbs: z.number().positive('Glucides doivent être positifs').optional(),
  fat: z.number().positive('Lipides doivent être positifs').optional(),
  fiber: z.number().positive('Fibres doivent être positives').optional(),
  sugar: z.number().positive('Sucre doit être positif').optional(),
  sodium: z.number().positive('Sodium doit être positif').optional(),
  category: z.enum(['vegetables', 'fruits', 'proteins', 'grains', 'dairy', 'spices', 'other'], {
    errorMap: () => ({ message: 'Catégorie invalide' }),
  }).optional(),
  allergens: z.any().default([]), // JSON pour SQLite
});

const IngredientUpdateSchema = IngredientSchema.partial();

// =============================================================================
// TYPES
// =============================================================================

export type CreateIngredientData = z.infer<typeof IngredientSchema>;
export type UpdateIngredientData = z.infer<typeof IngredientUpdateSchema>;

export interface IngredientFilters {
  category?: string;
  search?: string;
  allergens?: string[];
}

export interface IngredientStats {
  totalIngredients: number;
  categoryDistribution: Array<{ category: string; count: number }>;
  averageCalories: number;
  mostCommonAllergens: Array<{ allergen: string; count: number }>;
}

// =============================================================================
// DONNÉES NUTRITIONNELLES PAR DÉFAUT
// =============================================================================

const DEFAULT_INGREDIENTS = [
  {
    name: 'Poulet (blanc)',
    description: 'Viande de poulet blanche, cuite',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    category: 'proteins' as const,
    allergens: [],
  },
  {
    name: 'Riz basmati',
    description: 'Riz basmati cuit',
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    sugar: 0.1,
    sodium: 1,
    category: 'grains' as const,
    allergens: [],
  },
  {
    name: 'Tomate',
    description: 'Tomate fraîche',
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    sugar: 2.6,
    sodium: 5,
    category: 'vegetables' as const,
    allergens: [],
  },
  {
    name: 'Oignon',
    description: 'Oignon frais',
    calories: 40,
    protein: 1.1,
    carbs: 9.3,
    fat: 0.1,
    fiber: 1.7,
    sugar: 4.7,
    sodium: 4,
    category: 'vegetables' as const,
    allergens: [],
  },
  {
    name: 'Ail',
    description: 'Gousse d\'ail fraîche',
    calories: 149,
    protein: 6.4,
    carbs: 33,
    fat: 0.5,
    fiber: 2.1,
    sugar: 1,
    sodium: 17,
    category: 'vegetables' as const,
    allergens: [],
  },
  {
    name: 'Huile d\'olive',
    description: 'Huile d\'olive extra vierge',
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 2,
    category: 'other' as const,
    allergens: [],
  },
  {
    name: 'Sel',
    description: 'Sel de table',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 38758,
    category: 'spices' as const,
    allergens: [],
  },
  {
    name: 'Poivre noir',
    description: 'Poivre noir moulu',
    calories: 251,
    protein: 10.4,
    carbs: 64,
    fat: 3.3,
    fiber: 25.3,
    sugar: 0.6,
    sodium: 20,
    category: 'spices' as const,
    allergens: [],
  },
  {
    name: 'Lait',
    description: 'Lait entier',
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fat: 3.3,
    fiber: 0,
    sugar: 4.8,
    sodium: 43,
    category: 'dairy' as const,
    allergens: ['dairy'],
  },
  {
    name: 'Œuf',
    description: 'Œuf entier cru',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    sugar: 1.1,
    sodium: 124,
    category: 'proteins' as const,
    allergens: ['eggs'],
  },
];

// =============================================================================
// SERVICE INGRÉDIENTS
// =============================================================================

/**
 * Service de gestion des ingrédients avec validation et données nutritionnelles
 */
export class IngredientService {
  /**
   * Crée un nouvel ingrédient
   */
  async createIngredient(data: CreateIngredientData) {
    try {
      const validatedData = IngredientSchema.parse(data);

      // Vérifier que l'ingrédient n'existe pas déjà
      const existing = await prisma.ingredient.findUnique({
        where: { name: validatedData.name },
      });

      if (existing) {
        throw new Error('Un ingrédient avec ce nom existe déjà');
      }

      return await prisma.ingredient.create({
        data: validatedData,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation échouée: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Met à jour un ingrédient existant
   */
  async updateIngredient(ingredientId: string, data: UpdateIngredientData) {
    try {
      const validatedData = IngredientUpdateSchema.parse(data);

      return await prisma.ingredient.update({
        where: { id: ingredientId },
        data: validatedData,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation échouée: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Récupère un ingrédient par ID
   */
  async getIngredientById(ingredientId: string) {
    return await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });
  }

  /**
   * Récupère un ingrédient par nom
   */
  async getIngredientByName(name: string) {
    return await prisma.ingredient.findUnique({
      where: { name },
    });
  }

  /**
   * Récupère tous les ingrédients avec filtres
   */
  async getIngredients(filters: IngredientFilters = {}) {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.allergens && filters.allergens.length > 0) {
      where.allergens = { hasSome: filters.allergens };
    }

    return await prisma.ingredient.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Recherche d'ingrédients par nom
   */
  async searchIngredients(query: string, limit: number = 10) {
    return await prisma.ingredient.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      orderBy: { name: 'asc' },
      take: limit,
    });
  }

  /**
   * Supprime un ingrédient
   */
  async deleteIngredient(ingredientId: string): Promise<void> {
    // Vérifier que l'ingrédient n'est pas utilisé dans des recettes
    const usageCount = await prisma.recipeIngredient.count({
      where: { ingredientId },
    });

    if (usageCount > 0) {
      throw new Error('Cet ingrédient est utilisé dans des recettes et ne peut pas être supprimé');
    }

    await prisma.ingredient.delete({
      where: { id: ingredientId },
    });
  }

  /**
   * Récupère les statistiques des ingrédients
   */
  async getIngredientStats(): Promise<IngredientStats> {
    const ingredients = await prisma.ingredient.findMany();

    const totalIngredients = ingredients.length;
    const averageCalories = ingredients.reduce((sum, ing) => sum + (ing.calories || 0), 0) / totalIngredients || 0;

    // Distribution des catégories
    const categoryCounts = new Map<string, number>();
    ingredients.forEach(ingredient => {
      if (ingredient.category) {
        categoryCounts.set(ingredient.category, (categoryCounts.get(ingredient.category) || 0) + 1);
      }
    });

    const categoryDistribution = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Allergènes les plus courants
    const allergenCounts = new Map<string, number>();
    ingredients.forEach(ingredient => {
      if (Array.isArray(ingredient.allergens)) {
        ingredient.allergens.forEach(allergen => {
          allergenCounts.set(allergen, (allergenCounts.get(allergen) || 0) + 1);
        });
      }
    });

    const mostCommonAllergens = Array.from(allergenCounts.entries())
      .map(([allergen, count]) => ({ allergen, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalIngredients,
      categoryDistribution,
      averageCalories,
      mostCommonAllergens,
    };
  }

  /**
   * Récupère les catégories d'ingrédients
   */
  async getIngredientCategories() {
    const categories = await prisma.ingredient.findMany({
      select: { category: true },
      where: { category: { not: null } },
      distinct: ['category'],
    });

    return categories.map(c => c.category).filter(Boolean);
  }

  /**
   * Récupère les allergènes
   */
  async getAllergens() {
    const allergens = await prisma.ingredient.findMany({
      select: { allergens: true },
    });

    const allAllergens = new Set<string>();
    allergens.forEach(ingredient => {
      if (Array.isArray(ingredient.allergens)) {
        ingredient.allergens.forEach(allergen => allAllergens.add(allergen));
      }
    });

    return Array.from(allAllergens).sort();
  }

  /**
   * Initialise la base de données avec les ingrédients par défaut
   */
  async initializeDefaultIngredients(): Promise<void> {
    try {
      console.log('Initialisation des ingrédients par défaut...');

      for (const ingredientData of DEFAULT_INGREDIENTS) {
        const existing = await prisma.ingredient.findUnique({
          where: { name: ingredientData.name },
        });

        if (!existing) {
          await prisma.ingredient.create({
            data: ingredientData,
          });
          console.log(`✅ Ingrédient créé: ${ingredientData.name}`);
        }
      }

      console.log('✅ Initialisation des ingrédients terminée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des ingrédients:', error);
      throw error;
    }
  }

  /**
   * Calcule les informations nutritionnelles d'une recette
   */
  async calculateRecipeNutrition(ingredients: Array<{ ingredientId: string; quantity: number }>) {
    const nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    for (const { ingredientId, quantity } of ingredients) {
      const ingredient = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });

      if (ingredient) {
        // Calculer les valeurs pour la quantité donnée (par 100g)
        const multiplier = quantity / 100;
        nutrition.calories += (ingredient.calories || 0) * multiplier;
        nutrition.protein += (ingredient.protein || 0) * multiplier;
        nutrition.carbs += (ingredient.carbs || 0) * multiplier;
        nutrition.fat += (ingredient.fat || 0) * multiplier;
        nutrition.fiber += (ingredient.fiber || 0) * multiplier;
        nutrition.sugar += (ingredient.sugar || 0) * multiplier;
        nutrition.sodium += (ingredient.sodium || 0) * multiplier;
      }
    }

    return {
      calories: Math.round(nutrition.calories),
      protein: Math.round(nutrition.protein * 10) / 10,
      carbs: Math.round(nutrition.carbs * 10) / 10,
      fat: Math.round(nutrition.fat * 10) / 10,
      fiber: Math.round(nutrition.fiber * 10) / 10,
      sugar: Math.round(nutrition.sugar * 10) / 10,
      sodium: Math.round(nutrition.sodium),
    };
  }
}

// =============================================================================
// INSTANCE GLOBALE
// =============================================================================

export const ingredientService = new IngredientService(); 