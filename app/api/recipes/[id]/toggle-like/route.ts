import { NextRequest, NextResponse } from 'next/server'
import { recipeService } from '@/lib/services/recipe-service'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Attendre les params (Next.js 15)
    const { id } = await params
    
    // Valider l'ID de la recette
    if (!id) {
      return NextResponse.json(
        { error: 'ID de recette requis' },
        { status: 400 }
      )
    }

    // Basculer l'état de favori
    const updatedRecipe = await recipeService.toggleLike(id)

    return NextResponse.json(
      { 
        data: updatedRecipe,
        message: updatedRecipe.liked ? 'Recette ajoutée aux favoris' : 'Recette retirée des favoris'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors du toggle like:', error)
    
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