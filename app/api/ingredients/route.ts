import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { IngredientService, IngredientCreateInput } from '@/lib/services/ingredient-service'
import { validateRequest, handleError } from '@/lib/utils/validation'

const ingredientService = new IngredientService()

// Schéma pour les paramètres de requête
const querySchema = z.object({
  page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = Object.fromEntries(searchParams.entries())
    
    // Valider les paramètres de requête
    const validatedQuery = querySchema.parse(query)
    
    const result = await ingredientService.findAll({
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      category: validatedQuery.category,
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
      name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
      category: z.string().optional(),
      units: z.array(z.enum(['G', 'KG', 'ML', 'CL', 'L', 'C_A_C', 'C_A_S', 'PINCEE', 'POIGNEE', 'BOUQUET', 'GOUTTE', 'PIECE'])).min(1, 'Au moins une unité requise'),
    }))

    const ingredient = await ingredientService.create(body as IngredientCreateInput)

    return NextResponse.json({
      data: ingredient,
      status: 201,
    }, { status: 201 })
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 