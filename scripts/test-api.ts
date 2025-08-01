// =============================================================================
// SCRIPT DE TEST API - ASSISTANTE BABOUNETTE
// =============================================================================

async function testAPI() {
  try {
    console.log('🔍 Test de l\'API de recherche...');
    
    const baseUrl = 'http://localhost:3000';
    
    // Test 1: API des ingrédients
    console.log('\n📝 Test 1: API des ingrédients');
    const ingredientsResponse = await fetch(`${baseUrl}/api/ingredients`);
    console.log(`Status: ${ingredientsResponse.status}`);
    if (ingredientsResponse.ok) {
      const data = await ingredientsResponse.json();
      console.log(`✅ ${data.ingredients.length} ingrédients trouvés`);
    } else {
      console.log(`❌ Erreur: ${ingredientsResponse.statusText}`);
    }

    // Test 2: API des recettes
    console.log('\n📝 Test 2: API des recettes');
    const recipesResponse = await fetch(`${baseUrl}/api/recipes?userId=cmdt0aojm000av1kckfgn9sun`);
    console.log(`Status: ${recipesResponse.status}`);
    if (recipesResponse.ok) {
      const data = await recipesResponse.json();
      console.log(`✅ ${data.recipes.length} recettes trouvées`);
    } else {
      console.log(`❌ Erreur: ${recipesResponse.statusText}`);
    }

    // Test 3: API de recherche
    console.log('\n📝 Test 3: API de recherche');
    const searchResponse = await fetch(`${baseUrl}/api/search?q=risotto`);
    console.log(`Status: ${searchResponse.status}`);
    if (searchResponse.ok) {
      const data = await searchResponse.json();
      console.log(`✅ ${data.results.length} résultats trouvés`);
      console.log(`Query: ${data.query}`);
    } else {
      const errorText = await searchResponse.text();
      console.log(`❌ Erreur: ${searchResponse.statusText}`);
      console.log(`Détails: ${errorText}`);
    }

    console.log('\n✅ Tests API terminés');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

if (require.main === module) {
  testAPI()
    .then(() => {
      console.log('\n✅ Script de test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
} 