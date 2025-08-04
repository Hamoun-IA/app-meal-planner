import { NextRequest, NextResponse } from 'next/server'
import { shoppingItemService } from '@/lib/services/shopping-item-service'
import { ShoppingItemUpdateSchema } from '@/lib/services/shopping-item-service'

// GET /api/shopping-items/[id] - Récupérer un article spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await shoppingItemService.getById(params.id)
    
    if (!item) {
      return NextResponse.json(
        { 
          error: 'Article non trouvé',
          status: 404 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      data: item,
      status: 200 
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erreur serveur',
        status: 500 
      },
      { status: 500 }
    )
  }
}

// PUT /api/shopping-items/[id] - Mettre à jour un article
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    
    // Valider les données d'entrée
    const validatedData = ShoppingItemUpdateSchema.parse(body)
    
    const item = await shoppingItemService.update(params.id, validatedData)
    
    return NextResponse.json({ 
      data: item,
      status: 200 
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error)
    
    if (error instanceof Error && error.message.includes('Article non trouvé')) {
      return NextResponse.json(
        { 
          error: error.message,
          status: 404 
        },
        { status: 404 }
      )
    }
    
    if (error instanceof Error && error.message.includes('Données invalides')) {
      return NextResponse.json(
        { 
          error: error.message,
          status: 400 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erreur serveur',
        status: 500 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/shopping-items/[id] - Supprimer un article
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await shoppingItemService.delete(params.id)
    
    return NextResponse.json({ 
      message: 'Article supprimé avec succès',
      status: 200 
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error)
    
    if (error instanceof Error && error.message.includes('Article non trouvé')) {
      return NextResponse.json(
        { 
          error: error.message,
          status: 404 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erreur serveur',
        status: 500 
      },
      { status: 500 }
    )
  }
} 