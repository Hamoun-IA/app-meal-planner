// =============================================================================
// SCRIPT DE TEST IA - ASSISTANTE BABOUNETTE
// =============================================================================

async function testAI() {
  try {
    console.log('🤖 Test des API IA...');
    
    const baseUrl = 'http://localhost:3000';
    const userId = 'test-user-id'; // Utilise l'ID standardisé
    
    // Test 1: Chat IA
    console.log('\n📝 Test 1: Chat IA');
    const chatResponse = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Bonjour ! Peux-tu me donner des conseils pour cuisiner des légumes ?',
        userId,
      }),
    });
    
    console.log(`Status: ${chatResponse.status}`);
    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log(`✅ Réponse IA: ${data.data.content.substring(0, 100)}...`);
    } else {
      const error = await chatResponse.text();
      console.log(`❌ Erreur: ${error}`);
    }

    // Test 2: Génération de recette
    console.log('\n📝 Test 2: Génération de recette');
    const recipeResponse = await fetch(`${baseUrl}/api/ai/recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: ['poulet', 'riz', 'oignon', 'tomate'],
        cuisine: 'french',
        difficulty: 'beginner',
        servings: 4,
      }),
    });
    
    console.log(`Status: ${recipeResponse.status}`);
    if (recipeResponse.ok) {
      const data = await recipeResponse.json();
      console.log(`✅ Recette générée: ${data.data.content.substring(0, 100)}...`);
    } else {
      const error = await recipeResponse.text();
      console.log(`❌ Erreur: ${error}`);
    }

    // Test 3: Analyse nutritionnelle
    console.log('\n📝 Test 3: Analyse nutritionnelle');
    const nutritionResponse = await fetch(`${baseUrl}/api/ai/nutrition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipe: {
          title: 'Risotto aux Champignons',
          ingredients: [
            { name: 'riz', quantity: 300, unit: 'g' },
            { name: 'champignons', quantity: 200, unit: 'g' },
            { name: 'oignon', quantity: 100, unit: 'g' },
          ],
          instructions: [
            'Faire revenir les oignons',
            'Ajouter le riz et le faire toaster',
            'Ajouter les champignons',
          ],
        },
      }),
    });
    
    console.log(`Status: ${nutritionResponse.status}`);
    if (nutritionResponse.ok) {
      const data = await nutritionResponse.json();
      console.log(`✅ Analyse nutritionnelle: ${data.data.content.substring(0, 100)}...`);
    } else {
      const error = await nutritionResponse.text();
      console.log(`❌ Erreur: ${error}`);
    }

    // Test 4: Plan de repas
    console.log('\n📝 Test 4: Plan de repas');
    const mealPlanResponse = await fetch(`${baseUrl}/api/ai/meal-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        dietaryRestrictions: ['vegetarian'],
        calorieTarget: 2000,
        budgetPerMeal: 15,
      }),
    });
    
    console.log(`Status: ${mealPlanResponse.status}`);
    if (mealPlanResponse.ok) {
      const data = await mealPlanResponse.json();
      console.log(`✅ Plan de repas: ${data.data.content.substring(0, 100)}...`);
    } else {
      const error = await mealPlanResponse.text();
      console.log(`❌ Erreur: ${error}`);
    }

    // Test 5: Historique des conversations
    console.log('\n📝 Test 5: Historique des conversations');
    const historyResponse = await fetch(`${baseUrl}/api/ai/chat?userId=${userId}&limit=10`);
    
    console.log(`Status: ${historyResponse.status}`);
    if (historyResponse.ok) {
      const data = await historyResponse.json();
      console.log(`✅ ${data.data.messages.length} messages dans l'historique`);
    } else {
      const error = await historyResponse.text();
      console.log(`❌ Erreur: ${error}`);
    }

    console.log('\n✅ Tests IA terminés');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

if (require.main === module) {
  testAI()
    .then(() => {
      console.log('\n✅ Script de test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
} 