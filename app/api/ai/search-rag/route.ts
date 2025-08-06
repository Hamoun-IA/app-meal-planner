import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RecipeService } from '@/lib/services/recipe-service'
import { IngredientService } from '@/lib/services/ingredient-service'
import { generateEmbedding } from '@/lib/ai/openai'
import { validateRequest, handleError } from '@/lib/utils/validation'

const searchRagSchema = z.object({
  query: z.string().min(1, 'La requête ne peut pas être vide'),
  k: z.number().min(1).max(20).default(5),
  filters: z.object({
    dishType: z.enum(['DESSERT', 'PLAT_PRINCIPAL', 'ACCOMPAGNEMENT', 'ENTREE']).optional(),
  }).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { query, k, filters } = await validateRequest(req, searchRagSchema)

    const recipeService = new RecipeService()
    const ingredientService = new IngredientService()

    // Recherche dans les recettes
    const recipeResults = await recipeService.searchSimilar(query, k)
    
    // Recherche dans les ingrédients
    const ingredientResults = await ingredientService.searchSimilar(query, k)

    // Combiner et trier les résultats
    const allResults = [
      ...recipeResults.map(result => ({
        type: 'recipe' as const,
        item: result,
        score: result.similarity,
      })),
      ...ingredientResults.map(result => ({
        type: 'ingredient' as const,
        item: result,
        score: result.similarity,
      })),
    ].sort((a, b) => b.score - a.score).slice(0, k)

    // Appliquer les filtres si spécifiés
    const filteredResults = filters?.dishType 
      ? allResults.filter(result => 
          result.type === 'recipe' && 
          result.item.dishType === filters.dishType
        )
      : allResults

    return NextResponse.json(
      { 
        data: {
          results: filteredResults,
          total: filteredResults.length,
          query,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 