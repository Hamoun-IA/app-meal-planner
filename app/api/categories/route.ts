import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { validateRequest, handleError } from '@/lib/utils/validation'

// Schéma pour les paramètres de requête
const querySchema = z.object({
  page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = Object.fromEntries(searchParams.entries())
    
    // Valider les paramètres de requête
    const validatedQuery = querySchema.parse(query)
    
    const { page = 1, limit = 10, search } = validatedQuery
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              ingredients: true,
              shoppingItems: true,
            }
          }
        }
      }),
      prisma.category.count({ where }),
    ])

    return NextResponse.json({
      data: { categories, total, page, limit },
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
    }))

    // Normaliser le nom de la catégorie
    const normalizedName = body.name.trim()

    // Vérifier si la catégorie existe déjà (insensible à la casse)
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive'
        }
      }
    })

    if (existingCategory) {
      return NextResponse.json({ 
        error: `Une catégorie avec le nom "${normalizedName}" existe déjà. Veuillez utiliser un nom différent.`,
        existingCategory: {
          id: existingCategory.id,
          name: existingCategory.name
        }
      }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name: normalizedName
      }
    })

    return NextResponse.json({
      data: category,
      status: 201,
    }, { status: 201 })
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 