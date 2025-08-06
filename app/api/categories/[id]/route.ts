import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { validateRequest, handleError } from '@/lib/utils/validation'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        ingredients: {
          orderBy: { name: 'asc' }
        },
        shoppingItems: {
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            ingredients: true,
            shoppingItems: true,
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ 
        error: 'Catégorie non trouvée' 
      }, { status: 404 })
    }

    return NextResponse.json({
      data: category,
      status: 200,
    })
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await validateRequest(req, z.object({
      name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    }))

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id }
    })

    if (!existingCategory) {
      return NextResponse.json({ 
        error: 'Catégorie non trouvée' 
      }, { status: 404 })
    }

    // Vérifier si le nouveau nom existe déjà (sauf pour cette catégorie)
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: body.name,
          mode: 'insensitive'
        },
        id: {
          not: params.id
        }
      }
    })

    if (duplicateCategory) {
      return NextResponse.json({ 
        error: 'Une catégorie avec ce nom existe déjà' 
      }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: body.name.trim()
      }
    })

    return NextResponse.json({
      data: category,
      status: 200,
    })
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            ingredients: true,
            shoppingItems: true,
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ 
        error: 'Catégorie non trouvée' 
      }, { status: 404 })
    }

    // Vérifier si la catégorie est utilisée
    if (category._count.ingredients > 0 || category._count.shoppingItems > 0) {
      return NextResponse.json({ 
        error: `Impossible de supprimer cette catégorie car elle est utilisée par ${category._count.ingredients} ingrédient(s) et ${category._count.shoppingItems} article(s) de course` 
      }, { status: 400 })
    }

    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      data: { message: 'Catégorie supprimée avec succès' },
      status: 200,
    })
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 