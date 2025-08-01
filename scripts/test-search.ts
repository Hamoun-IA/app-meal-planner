import { simpleRagService } from '../lib/rag-service-simple';

async function testSearch() {
  console.log('🔍 Test de la recherche...');

  try {
    // Test 1: Recherche simple
    console.log('1. Test de recherche "risotto"...');
    const results = await simpleRagService.searchRecipes('risotto', {}, 10);
    console.log(`✅ ${results.length} résultats trouvés`);

    if (results.length > 0) {
      console.log(`   Premier résultat: ${results[0].recipe.title}`);
    }

    // Test 2: Recherche avec filtre
    console.log('2. Test de recherche avec filtre cuisine...');
    const resultsWithFilter = await simpleRagService.searchRecipes('salade', { cuisine: 'french' }, 10);
    console.log(`✅ ${resultsWithFilter.length} résultats avec filtre`);

    console.log('🎉 Tous les tests de recherche passés !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testSearch(); 