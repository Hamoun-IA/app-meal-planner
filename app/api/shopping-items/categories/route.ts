import { NextRequest, NextResponse } from 'next/server'
import { shoppingItemService } from '@/lib/services/shopping-item-service'

// GET /api/shopping-items/categories - Récupérer toutes les catégories
export async function GET(req: NextRequest) {
  try {
    const categories = await shoppingItemService.getCategories()
    
    return NextResponse.json({ 
      data: categories,
      status: 200 
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erreur serveur',
        status: 500 
      },
      { status: 500 }
    )
  }
} 