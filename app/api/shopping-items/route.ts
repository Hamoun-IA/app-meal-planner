import { NextRequest, NextResponse } from 'next/server'
import { shoppingItemService } from '@/lib/services/shopping-item-service'
import { ShoppingItemCreateSchema, ShoppingItemUpdateSchema } from '@/lib/services/shopping-item-service'

// GET /api/shopping-items - Récupérer tous les articles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')

    let items
    if (search) {
      items = await shoppingItemService.searchByName(search)
    } else if (categoryId) {
      items = await shoppingItemService.getByCategory(categoryId)
    } else {
      items = await shoppingItemService.getAll()
    }

    return NextResponse.json({ 
      data: items,
      status: 200 
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erreur serveur',
        status: 500 
      },
      { status: 500 }
    )
  }
}

// POST /api/shopping-items - Créer un nouvel article
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Valider les données d'entrée
    const validatedData = ShoppingItemCreateSchema.parse(body)
    
    const item = await shoppingItemService.create(validatedData)
    
    return NextResponse.json({ 
      data: item,
      status: 201 
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error)
    
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