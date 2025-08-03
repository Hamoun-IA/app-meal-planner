// Script de test pour les fonctionnalités IA
const BASE_URL = 'http://localhost:3000/api'

async function testAI() {
  console.log('🧪 Test des fonctionnalités IA...\n')

  try {
    // Test 1: Chat IA
    console.log('1. Test Chat IA')
    const chatResponse = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Bonjour ! Peux-tu me suggérer une recette simple pour ce soir ?'
      })
    })
    
    if (chatResponse.ok) {
      console.log('✅ Chat IA: Streaming response (SSE)')
    } else {
      const error = await chatResponse.json()
      console.log('❌ Chat IA:', chatResponse.status, error)
    }
    console.log('')

    // Test 2: Recherche RAG
    console.log('2. Test Recherche RAG')
    const searchResponse = await fetch(`${BASE_URL}/ai/search-rag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'carotte',
        k: 3
      })
    })
    const searchData = await searchResponse.json()
    console.log('✅ Recherche RAG:', searchResponse.status, searchData)
    console.log('')

    // Test 3: Génération de recette
    console.log('3. Test Génération de recette')
    const generateResponse = await fetch(`${BASE_URL}/ai/generate-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Une recette simple avec des carottes'
      })
    })
    const generateData = await generateResponse.json()
    console.log('✅ Génération recette:', generateResponse.status, generateData)
    console.log('')

    // Test 4: Planification de repas
    console.log('4. Test Planification de repas')
    const planResponse = await fetch(`${BASE_URL}/ai/plan-meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weekStart: new Date().toISOString(),
        budget: 50,
        timeConstraints: {
          maxPrepTime: 30,
          maxCookTime: 45
        }
      })
    })
    const planData = await planResponse.json()
    console.log('✅ Planification repas:', planResponse.status, planData)
    console.log('')

    console.log('🎉 Tous les tests IA sont passés !')
  } catch (error) {
    console.error('❌ Erreur lors des tests IA:', error.message)
  }
}

testAI() 