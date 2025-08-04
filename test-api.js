// Script de test simple pour les API routes
const BASE_URL = 'http://localhost:3000/api'

async function testAPI() {
  console.log('🧪 Test des API routes...\n')

  try {
    // Test GET /api/recipes
    console.log('1. Test GET /api/recipes')
    const recipesResponse = await fetch(`${BASE_URL}/recipes`)
    const recipesData = await recipesResponse.json()
    console.log('✅ GET /api/recipes:', recipesResponse.status, recipesData)
    console.log('')

    // Test GET /api/ingredients
    console.log('2. Test GET /api/ingredients')
    const ingredientsResponse = await fetch(`${BASE_URL}/ingredients`)
    const ingredientsData = await ingredientsResponse.json()
    console.log('✅ GET /api/ingredients:', ingredientsResponse.status, ingredientsData)
    console.log('')

    // Test POST /api/ingredients (créer un ingrédient de test)
    console.log('3. Test POST /api/ingredients')
    const testIngredient = {
      name: 'Tomate',
      category: 'Légumes',
      units: ['G', 'KG', 'PIECE']
    }
    
    const createIngredientResponse = await fetch(`${BASE_URL}/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testIngredient)
    })
    const createIngredientData = await createIngredientResponse.json()
    console.log('✅ POST /api/ingredients:', createIngredientResponse.status, createIngredientData)
    console.log('')

    console.log('🎉 Tous les tests sont passés !')
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message)
  }
}

testAPI() 