// =============================================================================
// SCRIPT DE TEST API SIMPLE - ASSISTANTE BABOUNETTE
// =============================================================================

import { ingredientService } from '../lib/services/ingredient-service';

async function testIngredientService() {
  console.log('🔍 Test du service d\'ingrédients...');

  try {
    // Test 1: Récupérer tous les ingrédients
    console.log('1. Test getIngredients...');
    const ingredients = await ingredientService.getIngredients();
    console.log(`✅ ${ingredients.length} ingrédients récupérés`);

    // Test 2: Rechercher des ingrédients
    console.log('2. Test searchIngredients...');
    const searchResults = await ingredientService.searchIngredients('poulet', 5);
    console.log(`✅ ${searchResults.length} résultats de recherche`);

    // Test 3: Récupérer un ingrédient par nom
    console.log('3. Test getIngredientByName...');
    const ingredient = await ingredientService.getIngredientByName('Poulet (blanc)');
    if (ingredient) {
      console.log(`✅ Ingrédient trouvé: ${ingredient.name}`);
    }

    console.log('🎉 Tous les tests du service passés !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

if (require.main === module) {
  testIngredientService()
    .then(() => {
      console.log('✅ Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
} 