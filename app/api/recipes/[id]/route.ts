import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RecipeService } from '@/lib/services/recipe-service'
import { handleError } from '@/lib/utils/validation'

const recipeService = new RecipeService()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Valider l'ID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'ID de recette invalide' },
        { status: 400 }
      )
    }

    const recipe = await recipeService.findById(id)

    return NextResponse.json({
      data: recipe,
      status: 200,
    })
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Valider l'ID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'ID de recette invalide' },
        { status: 400 }
      )
    }

    const body = await req.json()
    
    // Valider le body partiel
    const updateSchema = z.object({
      name: z.string().min(5, 'Le nom doit contenir au moins 5 caractères').optional(),
      prepTime: z.number().min(0).max(300, 'Temps de préparation invalide').transform(val => val === 0 ? 15 : val).optional(),
      cookTime: z.number().min(0).max(300, 'Temps de cuisson invalide').transform(val => val === 0 ? 10 : val).optional(),
      difficulty: z.enum(['FACILE', 'MOYEN', 'DIFFICILE']).optional(),
      dishType: z.enum(['DESSERT', 'PLAT_PRINCIPAL', 'ACCOMPAGNEMENT', 'ENTREE']).optional(),
      instructions: z.array(z.string().min(10, 'Instruction trop courte')).min(2, 'Au moins 2 instructions requises').optional(),
      tips: z.string().optional(),
      imageUrl: z.string().optional(),
      servings: z.number().min(1).max(20, 'Nombre de portions invalide').optional(),
      ingredients: z.array(z.object({
        ingredientId: z.string().uuid('ID d\'ingrédient invalide'),
        quantity: z.number().positive('La quantité doit être positive'),
        unit: z.enum(['G', 'KG', 'ML', 'CL', 'L', 'C_A_C', 'C_A_S', 'PINCEE', 'POIGNEE', 'BOUQUET', 'GOUTTE', 'PIECE']),
      })).min(1, 'Au moins 1 ingrédient requis').optional(),
    })

    const validatedBody = updateSchema.parse(body)

    const recipe = await recipeService.update(id, validatedBody)

    return NextResponse.json({
      data: recipe,
      status: 200,
    })
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Valider l'ID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'ID de recette invalide' },
        { status: 400 }
      )
    }

    const result = await recipeService.delete(id)

    return NextResponse.json({
      data: result,
      status: 200,
    })
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 