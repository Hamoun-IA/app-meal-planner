// =============================================================================
// SCRIPT D'INITIALISATION BASE DE DONNÉES - ASSISTANTE BABOUNETTE
// =============================================================================

import { prisma } from '../lib/prisma';
import { ingredientService } from '../lib/services/ingredient-service';

// =============================================================================
// FONCTIONS D'INITIALISATION
// =============================================================================

/**
 * Initialise la base de données avec les données par défaut
 */
async function initializeDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données...');

    // Vérifier la connexion
    const isConnected = await prisma.$queryRaw`SELECT 1`;
    if (!isConnected) {
      throw new Error('Impossible de se connecter à la base de données');
    }
    console.log('✅ Connexion à la base de données établie');

    // Initialiser les ingrédients par défaut
    await ingredientService.initializeDefaultIngredients();

    // Créer un utilisateur de test
    const testUser = await createTestUser();
    console.log(`✅ Utilisateur de test créé: ${testUser.email}`);

    // Créer quelques recettes de test
    await createTestRecipes(testUser.id);
    console.log('✅ Recettes de test créées');

    console.log('🎉 Initialisation terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Crée un utilisateur de test
 */
async function createTestUser() {
  const existingUser = await prisma.user.findUnique({
    where: { email: 'test@babounette.com' },
  });

  if (existingUser) {
    return existingUser;
  }

  const user = await prisma.user.create({
    data: {
      email: 'test@babounette.com',
      name: 'Utilisateur Test',
      preferences: {
        create: {
          dietaryRestrictions: ['vegetarian'],
          allergies: ['nuts'],
          cuisinePreferences: ['french', 'italian'],
          calorieTarget: 2000,
          proteinTarget: 150,
          carbTarget: 200,
          fatTarget: 65,
          cookingTime: 45,
          difficultyLevel: 'intermediate',
          servingsPerMeal: 4,
          budgetPerMeal: 15,
        },
      },
    },
  });

  return user;
}

/**
 * Crée quelques recettes de test
 */
async function createTestRecipes(userId: string) {
  const recipes = [
    {
      title: 'Risotto aux Champignons',
      description: 'Un risotto crémeux aux champignons de Paris',
      instructions: [
        'Faire revenir les oignons dans l\'huile d\'olive',
        'Ajouter le riz et le faire toaster',
        'Verser le vin blanc et laisser absorber',
        'Ajouter le bouillon progressivement',
        'Ajouter les champignons et le parmesan',
      ],
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: 'intermediate',
      cuisine: 'italian',
      tags: ['vegetarian', 'creamy', 'comfort'],
      categories: ['main-dish', 'rice'],
      ingredients: [
        { ingredientId: await getIngredientId('Riz basmati'), quantity: 300, unit: 'g' },
        { ingredientId: await getIngredientId('Oignon'), quantity: 100, unit: 'g' },
        { ingredientId: await getIngredientId('Huile d\'olive'), quantity: 30, unit: 'ml' },
        { ingredientId: await getIngredientId('Sel'), quantity: 5, unit: 'g' },
      ],
    },
    {
      title: 'Salade César',
      description: 'Une salade César classique avec croûtons maison',
      instructions: [
        'Préparer la vinaigrette avec l\'ail et l\'anchois',
        'Faire griller les croûtons',
        'Mélanger la laitue avec la vinaigrette',
        'Ajouter les croûtons et le parmesan',
      ],
      prepTime: 20,
      cookTime: 10,
      servings: 2,
      difficulty: 'beginner',
      cuisine: 'french',
      tags: ['salad', 'quick', 'healthy'],
      categories: ['starter', 'salad'],
      ingredients: [
        { ingredientId: await getIngredientId('Laitue'), quantity: 200, unit: 'g' },
        { ingredientId: await getIngredientId('Œuf'), quantity: 100, unit: 'g' },
        { ingredientId: await getIngredientId('Huile d\'olive'), quantity: 20, unit: 'ml' },
        { ingredientId: await getIngredientId('Sel'), quantity: 3, unit: 'g' },
      ],
    },
  ];

  for (const recipeData of recipes) {
    const existingRecipe = await prisma.recipe.findFirst({
      where: { title: recipeData.title, userId },
    });

    if (!existingRecipe) {
      await prisma.recipe.create({
        data: {
          ...recipeData,
          userId,
          ingredients: {
            create: recipeData.ingredients,
          },
        },
      });
      console.log(`✅ Recette créée: ${recipeData.title}`);
    }
  }
}

/**
 * Récupère l'ID d'un ingrédient par nom
 */
async function getIngredientId(name: string): Promise<string> {
  const ingredient = await prisma.ingredient.findUnique({
    where: { name },
  });

  if (!ingredient) {
    throw new Error(`Ingrédient non trouvé: ${name}`);
  }

  return ingredient.id;
}

// =============================================================================
// EXÉCUTION
// =============================================================================

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Script d\'initialisation terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
} 