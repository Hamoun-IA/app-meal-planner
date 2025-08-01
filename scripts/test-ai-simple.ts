// =============================================================================
// SCRIPT DE TEST IA SIMPLE - ASSISTANTE BABOUNETTE
// =============================================================================

import { mockAIService } from '../lib/services/ai-service-mock';

async function testAIService() {
  try {
    console.log('🤖 Test du service IA Mock...');
    
    // Test 1: Chat simple
    console.log('\n📝 Test 1: Chat simple');
    const chatResponse = await mockAIService.chat(
      'Bonjour !',
      'test@babounette.com'
    );
    console.log(`✅ Réponse: ${chatResponse.content.substring(0, 100)}...`);

    // Test 2: Génération de recette
    console.log('\n📝 Test 2: Génération de recette');
    const recipeResponse = await mockAIService.generateRecipe({
      ingredients: ['poulet', 'riz', 'oignon'],
      cuisine: 'french',
      difficulty: 'beginner',
    });
    console.log(`✅ Recette: ${recipeResponse.content.substring(0, 100)}...`);

    // Test 3: Analyse nutritionnelle
    console.log('\n📝 Test 3: Analyse nutritionnelle');
    const nutritionResponse = await mockAIService.analyzeNutrition({
      recipe: {
        title: 'Risotto aux Champignons',
        ingredients: [
          { name: 'riz', quantity: 300, unit: 'g' },
          { name: 'champignons', quantity: 200, unit: 'g' },
        ],
        instructions: ['Faire revenir les oignons', 'Ajouter le riz'],
      },
    });
    console.log(`✅ Analyse: ${nutritionResponse.content.substring(0, 100)}...`);

    console.log('\n✅ Tests service IA Mock terminés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

if (require.main === module) {
  testAIService()
    .then(() => {
      console.log('\n✅ Script de test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
} 