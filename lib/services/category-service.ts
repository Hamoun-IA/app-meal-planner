import { prisma } from '@/lib/db/prisma-client'
import { z } from 'zod'

// Schéma de validation pour les catégories
export const CategoryCreateSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
})

export interface Category {
  id: string
  name: string
  linkedItemId: string | null
  linkedItemType: string | null
}

export interface CategoryCreateInput {
  name: string
  linkedItemId?: string
  linkedItemType?: string
}

export class CategoryService {
  // Vérifier si nous sommes côté serveur
  private checkServerSide() {
    if (typeof window !== 'undefined') {
      throw new Error('Ce service ne peut être utilisé que côté serveur')
    }
  }

  // Récupérer toutes les catégories
  async getAll(): Promise<Category[]> {
    this.checkServerSide()
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      })

      return categories.map(category => ({
        id: category.id,
        name: category.name,
        linkedItemId: category.linkedItemId,
        linkedItemType: category.linkedItemType,
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
      throw new Error('Impossible de récupérer les catégories')
    }
  }

  // Créer une nouvelle catégorie
  async create(data: CategoryCreateInput): Promise<Category> {
    this.checkServerSide()
    try {
      const validatedData = CategoryCreateSchema.parse(data)

      const category = await prisma.category.create({
        data: {
          name: validatedData.name.trim(),
          linkedItemId: data.linkedItemId || null,
          linkedItemType: data.linkedItemType || null,
        },
      })

      return {
        id: category.id,
        name: category.name,
        linkedItemId: category.linkedItemId,
        linkedItemType: category.linkedItemType,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Données invalides: ${error.errors.map(e => e.message).join(', ')}`)
      }
      console.error('Erreur lors de la création de la catégorie:', error)
      throw new Error('Impossible de créer la catégorie')
    }
  }

  // Vérifier si une catégorie existe
  async exists(name: string): Promise<boolean> {
    this.checkServerSide()
    try {
      const category = await prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
        },
      })
      return !!category
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'existence de la catégorie:', error)
      return false
    }
  }

  // Trouver une catégorie par nom
  async findByName(name: string): Promise<Category | null> {
    this.checkServerSide()
    try {
      const category = await prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
        },
      })

      if (!category) return null

      return {
        id: category.id,
        name: category.name,
        linkedItemId: category.linkedItemId,
        linkedItemType: category.linkedItemType,
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de la catégorie:', error)
      return null
    }
  }
}

// Instance singleton
export const categoryService = new CategoryService() 