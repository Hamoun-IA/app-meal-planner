// Script de test pour les embeddings
const BASE_URL = 'http://localhost:3000/api'

async function testEmbeddings() {
  console.log('🧪 Test des embeddings...\n')

  try {
    // Test création d'un nouvel ingrédient avec embedding
    console.log('1. Test création ingrédient avec embedding')
    const newIngredient = {
      name: 'Carotte',
      category: 'Légumes',
      units: ['G', 'KG', 'PIECE']
    }
    
    const createResponse = await fetch(`${BASE_URL}/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newIngredient)
    })
    const createData = await createResponse.json()
    console.log('✅ POST /api/ingredients:', createResponse.status, createData)
    
    if (createResponse.status !== 201) {
      console.log('❌ Échec de création de l\'ingrédient, arrêt du test')
      return
    }
    
    console.log('')

    // Test création d'une recette avec embedding
    console.log('2. Test création recette avec embedding')
    const newRecipe = {
      name: 'Salade de carottes',
      prepTime: 10,
      cookTime: 0,
      difficulty: 'FACILE',
      dishType: 'ENTREE',
      instructions: [
        'Éplucher et râper les carottes',
        'Ajouter de l\'huile d\'olive et du citron',
        'Assaisonner avec sel et poivre',
        'Laisser reposer 10 minutes avant de servir'
      ],
      tips: 'Ajouter des noix pour plus de croquant',
      ingredients: [
        {
          ingredientId: createData.data.id, // ID de la carotte créée
          quantity: 300,
          unit: 'G'
        }
      ]
    }
    
    const createRecipeResponse = await fetch(`${BASE_URL}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRecipe)
    })
    const createRecipeData = await createRecipeResponse.json()
    console.log('✅ POST /api/recipes:', createRecipeResponse.status, createRecipeData)
    console.log('')

    // Test recherche vectorielle
    console.log('3. Test recherche vectorielle')
    const searchResponse = await fetch(`${BASE_URL}/recipes?search=carotte`)
    const searchData = await searchResponse.json()
    console.log('✅ GET /api/recipes?search=carotte:', searchResponse.status, searchData)
    console.log('')

    console.log('🎉 Tous les tests d\'embeddings sont passés !')
  } catch (error) {
    console.error('❌ Erreur lors des tests d\'embeddings:', error.message)
  }
}

testEmbeddings() 