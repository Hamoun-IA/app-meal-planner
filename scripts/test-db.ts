// =============================================================================
// SCRIPT DE TEST BASE DE DONNÉES - ASSISTANTE BABOUNETTE
// =============================================================================

import { prisma } from '../lib/prisma';

async function testDatabase() {
  console.log('🔍 Test de la base de données...');

  try {
    // Test 1: Connexion
    console.log('1. Test de connexion...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connexion OK');

    // Test 2: Compter les ingrédients
    console.log('2. Test des ingrédients...');
    const ingredientCount = await prisma.ingredient.count();
    console.log(`✅ ${ingredientCount} ingrédients trouvés`);

    // Test 3: Récupérer un ingrédient
    console.log('3. Test de récupération d\'ingrédient...');
    const ingredient = await prisma.ingredient.findFirst();
    if (ingredient) {
      console.log(`✅ Ingrédient trouvé: ${ingredient.name}`);
      console.log(`   Allergens: ${JSON.stringify(ingredient.allergens)}`);
    }

    // Test 4: Compter les recettes
    console.log('4. Test des recettes...');
    const recipeCount = await prisma.recipe.count();
    console.log(`✅ ${recipeCount} recettes trouvées`);

    // Test 5: Récupérer une recette avec ingrédients
    console.log('5. Test de récupération de recette...');
    const recipe = await prisma.recipe.findFirst({
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });
    if (recipe) {
      console.log(`✅ Recette trouvée: ${recipe.title}`);
      console.log(`   Instructions: ${JSON.stringify(recipe.instructions)}`);
      console.log(`   Tags: ${JSON.stringify(recipe.tags)}`);
      console.log(`   ${recipe.ingredients.length} ingrédients`);
    }

    console.log('🎉 Tous les tests passés !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testDatabase()
    .then(() => {
      console.log('✅ Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
} 