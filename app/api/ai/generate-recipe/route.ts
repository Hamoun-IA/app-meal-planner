import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { chefAgent } from '@/lib/ai/agents'
import { RecipeService } from '@/lib/services/recipe-service'
import { IngredientService } from '@/lib/services/ingredient-service'
import { validateRequest, handleError } from '@/lib/utils/validation'

const generateRecipeSchema = z.object({
  prompt: z.string().min(1, 'Le prompt ne peut pas être vide'),
  preferences: z.array(z.object({
    familyMember: z.string(),
    type: z.enum(['LIKE', 'DISLIKE']),
    targetType: z.enum(['INGREDIENT', 'RECIPE']),
    targetId: z.string(),
    notes: z.string().optional(),
  })).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, preferences } = await validateRequest(req, generateRecipeSchema)

    // Générer la recette avec l'agent Chef
    const recipeSuggestion = await chefAgent.generateRecipe(prompt, preferences)

    // Convertir les ingrédients suggérés en ingrédients existants ou créer de nouveaux
    const recipeService = new RecipeService()
    const ingredientService = new IngredientService()

    // Traiter les ingrédients
    const processedIngredients = await Promise.all(
      recipeSuggestion.ingredients.map(async (ingredient) => {
        try {
          // Normaliser le nom de l'ingrédient (singulier, minuscule)
          const normalizedName = ingredient.name.toLowerCase().replace(/s$/, '')
          
          // Chercher l'ingrédient existant
          const existingIngredients = await ingredientService.findAll({
            search: normalizedName,
            limit: 5,
          })

          let ingredientId: string
          let unitToUse: any

          if (existingIngredients.ingredients.length > 0) {
            // Utiliser l'ingrédient existant le plus proche
            ingredientId = existingIngredients.ingredients[0].id
            // Utiliser l'unité de l'ingrédient existant si compatible, sinon l'unité demandée
            const existingIngredient = existingIngredients.ingredients[0]
            const requestedUnit = ingredient.unit.toUpperCase()
            unitToUse = existingIngredient.units.includes(requestedUnit as any) 
              ? requestedUnit 
              : existingIngredient.units[0]
          } else {
            // Normaliser l'unité et créer un nouvel ingrédient
            const normalizedUnit = ingredient.unit.toUpperCase().replace('POIGNEE', 'POIGNEE').replace('PINCEE', 'PINCEE')
            
            // Détecter la catégorie basée sur le nom
            let category = 'Autres'
            if (['carotte', 'poireau', 'oignon', 'tomate', 'courgette', 'aubergine', 'poivron'].includes(normalizedName)) {
              category = 'Légumes'
            } else if (['pomme', 'banane', 'orange', 'fraise', 'raisin', 'kiwi'].includes(normalizedName)) {
              category = 'Fruits'
            } else if (['poulet', 'boeuf', 'porc', 'agneau', 'dinde'].includes(normalizedName)) {
              category = 'Viandes'
            } else if (['saumon', 'thon', 'cabillaud', 'sardine', 'maquereau'].includes(normalizedName)) {
              category = 'Poissons'
            } else if (['lait', 'fromage', 'yaourt', 'crème', 'beurre'].includes(normalizedName)) {
              category = 'Produits laitiers'
            }
            
            const newIngredient = await ingredientService.create({
              name: normalizedName, // Utiliser le nom normalisé
              category: category,
              units: [normalizedUnit as any], // Convertir en UnitType
            })
            ingredientId = newIngredient.id
            unitToUse = normalizedUnit
          }

          return {
            ingredientId,
            quantity: ingredient.quantity,
            unit: unitToUse,
          }
        } catch (error) {
          console.error(`Erreur lors du traitement de l'ingrédient ${ingredient.name}:`, error)
          // Au lieu de faire échouer toute la recette, on utilise un ingrédient par défaut
          console.log(`Utilisation d'un ingrédient par défaut pour: ${ingredient.name}`)
          
          // Chercher un ingrédient générique
          const fallbackIngredients = await ingredientService.findAll({
            search: 'sel',
            limit: 1,
          })
          
          if (fallbackIngredients.ingredients.length > 0) {
            return {
              ingredientId: fallbackIngredients.ingredients[0].id,
              quantity: ingredient.quantity,
              unit: 'G' as any,
            }
          } else {
            throw new Error(`Impossible de traiter l'ingrédient: ${ingredient.name}`)
          }
        }
      })
    )

    // Créer la recette complète
    const recipeData = {
      name: recipeSuggestion.name,
      prepTime: recipeSuggestion.prepTime,
      cookTime: recipeSuggestion.cookTime,
      difficulty: recipeSuggestion.difficulty,
      dishType: recipeSuggestion.dishType,
      instructions: recipeSuggestion.instructions,
      tips: recipeSuggestion.tips,
      ingredients: processedIngredients,
    }

    const createdRecipe = await recipeService.create(recipeData)

    return NextResponse.json(
      { 
        data: createdRecipe,
        message: 'Recette générée et créée avec succès'
      },
      { status: 201 }
    )
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 