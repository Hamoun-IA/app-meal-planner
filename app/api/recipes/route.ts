import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RecipeService, RecipeCreateInput } from '@/lib/services/recipe-service'
import { validateRequest, handleError } from '@/lib/utils/validation'

const recipeService = new RecipeService()

// Schéma pour les paramètres de requête
const querySchema = z.object({
  page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional(),
  dishType: z.enum(['DESSERT', 'PLAT_PRINCIPAL', 'ACCOMPAGNEMENT', 'ENTREE']).optional(),
  difficulty: z.enum(['FACILE', 'MOYEN', 'DIFFICILE']).optional(),
  search: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = Object.fromEntries(searchParams.entries())
    
    // Valider les paramètres de requête
    const validatedQuery = querySchema.parse(query)
    
    const result = await recipeService.findAll({
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      dishType: validatedQuery.dishType,
      difficulty: validatedQuery.difficulty,
      search: validatedQuery.search,
    })

    return NextResponse.json({
      data: result,
      status: 200,
    })
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await validateRequest(req, z.object({
      name: z.string().min(5, 'Le nom doit contenir au moins 5 caractères'),
      prepTime: z.number().min(0).max(300, 'Temps de préparation invalide').transform(val => val === 0 ? 15 : val),
      cookTime: z.number().min(0).max(300, 'Temps de cuisson invalide').transform(val => val === 0 ? 10 : val),
      difficulty: z.enum(['FACILE', 'MOYEN', 'DIFFICILE']).optional(),
      dishType: z.enum(['DESSERT', 'PLAT_PRINCIPAL', 'ACCOMPAGNEMENT', 'ENTREE']).optional(),
      instructions: z.array(z.string().min(10, 'Instruction trop courte')).min(2, 'Au moins 2 instructions requises'),
      tips: z.string().optional(),
      imageUrl: z.string().optional(),
      servings: z.number().min(1).max(20, 'Nombre de portions invalide').optional().transform(val => val || 4),
      ingredients: z.array(z.object({
        ingredientId: z.string().uuid('ID d\'ingrédient invalide'),
        quantity: z.number().positive('La quantité doit être positive'),
        unit: z.enum(['G', 'KG', 'ML', 'CL', 'L', 'C_A_C', 'C_A_S', 'PINCEE', 'POIGNEE', 'BOUQUET', 'GOUTTE', 'PIECE']),
      })).min(1, 'Au moins 1 ingrédient requis'),
    }))

    const recipeService = new RecipeService()
    const recipe = await recipeService.create(body)

    return NextResponse.json({ data: recipe }, { status: 201 })
  } catch (error) {
    console.error('Erreur création recette:', error)
    return handleError(error)
  }
} 