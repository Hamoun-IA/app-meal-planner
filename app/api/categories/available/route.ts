import { NextRequest, NextResponse } from 'next/server'
import { IngredientService } from '@/lib/services/ingredient-service'
import { handleError } from '@/lib/utils/validation'

const ingredientService = new IngredientService()

export async function GET(req: NextRequest) {
  try {
    const categories = await ingredientService.getAvailableCategories()

    return NextResponse.json({
      data: categories,
      status: 200,
    })
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 