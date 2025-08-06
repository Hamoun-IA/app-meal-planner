import { NextResponse } from 'next/server'
import { recipeService } from '@/lib/services/recipe-service'

export async function GET() {
  try {
    // Récupérer toutes les recettes favorites
    const favorites = await recipeService.getFavorites()

    return NextResponse.json(
      { 
        data: { recipes: favorites, total: favorites.length },
        message: `${favorites.length} recette(s) favorite(s) trouvée(s)`
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 