// =============================================================================
// CLIENT PRISMA - ASSISTANTE BABOUNETTE
// =============================================================================

import { PrismaClient } from '@prisma/client';

// Configuration pour éviter les connexions multiples en développement
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configuration pour la production
    ...(process.env.NODE_ENV === 'production' && {
      // Connection pooling pour la production
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    }),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// =============================================================================
// TYPES UTILITAIRES
// =============================================================================

export type RecipeWithIngredients = {
  id: string;
  title: string;
  description: string | null;
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  cuisine: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  categories: string[];
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  embedding: any | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  ingredients: {
    id: string;
    quantity: number;
    unit: string;
    notes: string | null;
    ingredient: {
      id: string;
      name: string;
      description: string | null;
      calories: number | null;
      protein: number | null;
      carbs: number | null;
      fat: number | null;
      fiber: number | null;
      sugar: number | null;
      sodium: number | null;
      category: string | null;
      allergens: string[];
    };
  }[];
};

export type UserWithPreferences = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    id: string;
    dietaryRestrictions: string[];
    allergies: string[];
    cuisinePreferences: string[];
    calorieTarget: number | null;
    proteinTarget: number | null;
    carbTarget: number | null;
    fatTarget: number | null;
    cookingTime: number | null;
    difficultyLevel: string | null;
    servingsPerMeal: number | null;
    budgetPerMeal: number | null;
  } | null;
};

export type MealPlanWithRecipes = {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  name: string | null;
  description: string | null;
  totalCalories: number | null;
  totalCost: number | null;
  createdAt: Date;
  updatedAt: Date;
  recipes: {
    id: string;
    dayOfWeek: number;
    mealType: string;
    servings: number;
    recipe: RecipeWithIngredients;
  }[];
};

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Vérifie la connexion à la base de données
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return false;
  }
}

/**
 * Ferme proprement la connexion Prisma
 */
export async function closePrismaConnection(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Nettoie les données de test (pour les tests uniquement)
 */
export async function cleanTestData(): Promise<void> {
  if (process.env.NODE_ENV === 'test') {
    await prisma.chatMessage.deleteMany();
    await prisma.favoriteRecipe.deleteMany();
    await prisma.mealPlanRecipe.deleteMany();
    await prisma.mealPlan.deleteMany();
    await prisma.shoppingListItem.deleteMany();
    await prisma.shoppingList.deleteMany();
    await prisma.recipeIngredient.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.ingredient.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.user.deleteMany();
    await prisma.embeddingCache.deleteMany();
  }
} 