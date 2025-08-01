// =============================================================================
// SCRIPT DE TEST API - PHASE 2 - ASSISTANTE BABOUNETTE
// =============================================================================

const BASE_URL = 'http://localhost:3000/api';

// =============================================================================
// FONCTIONS DE TEST
// =============================================================================

/**
 * Test de l'API des ingrédients
 */
async function testIngredientsAPI() {
  console.log('🧪 Test API Ingrédients...');
  
  try {
    // GET /api/ingredients
    const response = await fetch(`${BASE_URL}/ingredients`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ GET /api/ingredients - ${data.ingredients?.length || 0} ingrédients trouvés`);
    } else {
      console.log(`❌ GET /api/ingredients - Erreur: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test des ingrédients:', error);
  }
}

/**
 * Test de l'API des recettes
 */
async function testRecipesAPI() {
  console.log('🧪 Test API Recettes...');
  
  try {
    // GET /api/recipes
    const response = await fetch(`${BASE_URL}/recipes?userId=test-user-id`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ GET /api/recipes - ${data.recipes?.length || 0} recettes trouvées`);
    } else {
      console.log(`❌ GET /api/recipes - Erreur: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test des recettes:', error);
  }
}

/**
 * Test de l'API de recherche
 */
async function testSearchAPI() {
  console.log('🧪 Test API Recherche...');
  
  try {
    // GET /api/search
    const response = await fetch(`${BASE_URL}/search?q=risotto`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ GET /api/search - ${data.totalResults || 0} résultats trouvés`);
      if (data.results && data.results.length > 0) {
        console.log(`   Premier résultat: ${data.results[0].recipe.title}`);
      }
    } else {
      console.log(`❌ GET /api/search - Erreur: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de recherche:', error);
  }
}

/**
 * Test de création d'une recette
 */
async function testCreateRecipe() {
  console.log('🧪 Test Création Recette...');
  
  try {
    const recipeData = {
      title: 'Test Recette API',
      description: 'Recette de test pour valider l\'API',
      instructions: [
        'Étape 1: Préparer les ingrédients',
        'Étape 2: Cuire selon les instructions',
        'Étape 3: Servir chaud'
      ],
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      difficulty: 'beginner',
      cuisine: 'french',
      tags: ['test', 'api'],
      categories: ['main-dish'],
      ingredients: [
        {
          ingredientId: 'test-ingredient-id', // Sera remplacé par un vrai ID
          quantity: 100,
          unit: 'g',
          notes: 'Ingrédient de test'
        }
      ]
    };

    const response = await fetch(`${BASE_URL}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ POST /api/recipes - Recette créée: ${data.recipe?.title}`);
    } else {
      console.log(`❌ POST /api/recipes - Erreur: ${data.error}`);
      if (data.details) {
        console.log(`   Détails: ${JSON.stringify(data.details)}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création de recette:', error);
  }
}

/**
 * Test de validation Zod
 */
async function testZodValidation() {
  console.log('🧪 Test Validation Zod...');
  
  try {
    // Test avec données invalides
    const invalidData = {
      title: '', // Titre vide - invalide
      prepTime: -5, // Temps négatif - invalide
      servings: 0, // Portions à 0 - invalide
      ingredients: [] // Aucun ingrédient - invalide
    };

    const response = await fetch(`${BASE_URL}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData),
    });
    
    const data = await response.json();
    
    if (response.status === 400) {
      console.log(`✅ Validation Zod - Erreurs détectées: ${data.error}`);
      if (data.details) {
        console.log(`   Détails des erreurs: ${data.details.length} erreurs`);
      }
    } else {
      console.log(`❌ Validation Zod - Erreur attendue non détectée`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de validation:', error);
  }
}

// =============================================================================
// EXÉCUTION DES TESTS
// =============================================================================

async function runAllTests() {
  console.log('🚀 Démarrage des tests API - Phase 2');
  console.log('=====================================');
  
  // Attendre que le serveur soit prêt
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testIngredientsAPI();
  await testRecipesAPI();
  await testSearchAPI();
  await testZodValidation();
  await testCreateRecipe();
  
  console.log('=====================================');
  console.log('✅ Tests terminés !');
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('🎉 Tous les tests sont terminés');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur lors des tests:', error);
      process.exit(1);
    });
} 