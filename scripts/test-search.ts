// =============================================================================
// SCRIPT DE TEST RECHERCHE - ASSISTANTE BABOUNETTE
// =============================================================================

import { simpleRagService } from '../lib/rag-service-simple';

async function testSearch() {
  try {
    console.log('🔍 Test de recherche RAG...');
    
    // Test 1: Recherche simple
    console.log('\n📝 Test 1: Recherche "risotto"');
    const results1 = await simpleRagService.searchRecipes('risotto', {}, 10);
    console.log(`✅ Résultats trouvés: ${results1.length}`);
    results1.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.recipe.title} (score: ${result.score})`);
    });

    // Test 2: Recherche avec filtre
    console.log('\n📝 Test 2: Recherche "salade" avec filtre cuisine française');
    const results2 = await simpleRagService.searchRecipes('salade', { cuisine: 'french' }, 10);
    console.log(`✅ Résultats trouvés: ${results2.length}`);
    results2.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.recipe.title} (score: ${result.score})`);
    });

    // Test 3: Recherche avec filtre difficulté
    console.log('\n📝 Test 3: Recherche "riz" avec filtre difficulté débutant');
    const results3 = await simpleRagService.searchRecipes('riz', { difficulty: 'beginner' }, 10);
    console.log(`✅ Résultats trouvés: ${results3.length}`);
    results3.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.recipe.title} (score: ${result.score})`);
    });

    console.log('\n✅ Tests de recherche terminés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

if (require.main === module) {
  testSearch()
    .then(() => {
      console.log('\n✅ Script de test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
} 