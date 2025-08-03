import { prisma } from '@/lib/db/prisma-client'
import { z } from 'zod'
import { categoryService } from './category-service'

// Schéma de validation pour les ShoppingItem
export const ShoppingItemCreateSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  categoryId: z.string().uuid().optional(),
})

export const ShoppingItemUpdateSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  categoryId: z.string().uuid().optional(),
})

export interface ShoppingItem {
  id: string
  name: string
  categoryId: string | null
  category: {
    id: string
    name: string
  } | null
  createdAt: Date
  updatedAt: Date
}

export interface ShoppingItemCreateInput {
  name: string
  categoryId?: string
}

export interface ShoppingItemUpdateInput {
  name?: string
  categoryId?: string
}

export class ShoppingItemService {
  // Vérifier si nous sommes côté serveur
  private checkServerSide() {
    if (typeof window !== 'undefined') {
      throw new Error('Ce service ne peut être utilisé que côté serveur')
    }
  }

  // Récupérer tous les articles de shopping
  async getAll(): Promise<ShoppingItem[]> {
    this.checkServerSide()
    try {
      const items = await prisma.shoppingItem.findMany({
        include: {
          category: true,
        },
        orderBy: {
          name: 'asc',
        },
      })

      return items.map(item => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        category: item.category ? {
          id: item.category.id,
          name: item.category.name,
        } : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des articles de shopping:', error)
      throw new Error('Impossible de récupérer les articles de shopping')
    }
  }

  // Récupérer un article par ID
  async getById(id: string): Promise<ShoppingItem | null> {
    this.checkServerSide()
    try {
      const item = await prisma.shoppingItem.findUnique({
        where: { id },
        include: {
          category: true,
        },
      })

      if (!item) return null

      return {
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        category: item.category ? {
          id: item.category.id,
          name: item.category.name,
        } : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'article:', error)
      throw new Error('Impossible de récupérer l\'article')
    }
  }

  // Créer un nouvel article
  async create(data: ShoppingItemCreateInput): Promise<ShoppingItem> {
    this.checkServerSide()
    try {
      // Valider les données d'entrée
      const validatedData = ShoppingItemCreateSchema.parse(data)

      const item = await prisma.shoppingItem.create({
        data: {
          name: validatedData.name.trim(),
          categoryId: validatedData.categoryId || null,
        },
        include: {
          category: true,
        },
      })

      return {
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        category: item.category ? {
          id: item.category.id,
          name: item.category.name,
        } : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Données invalides: ${error.errors.map(e => e.message).join(', ')}`)
      }
      console.error('Erreur lors de la création de l\'article:', error)
      throw new Error('Impossible de créer l\'article')
    }
  }

  // Mettre à jour un article
  async update(id: string, data: ShoppingItemUpdateInput): Promise<ShoppingItem> {
    this.checkServerSide()
    try {
      // Valider les données d'entrée
      const validatedData = ShoppingItemUpdateSchema.parse(data)

      // Vérifier que l'article existe
      const existingItem = await prisma.shoppingItem.findUnique({
        where: { id },
      })

      if (!existingItem) {
        throw new Error('Article non trouvé')
      }

      const item = await prisma.shoppingItem.update({
        where: { id },
        data: {
          ...(validatedData.name && { name: validatedData.name.trim() }),
          categoryId: validatedData.categoryId || null,
        },
        include: {
          category: true,
        },
      })

      return {
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        category: item.category ? {
          id: item.category.id,
          name: item.category.name,
        } : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Données invalides: ${error.errors.map(e => e.message).join(', ')}`)
      }
      console.error('Erreur lors de la mise à jour de l\'article:', error)
      throw new Error('Impossible de mettre à jour l\'article')
    }
  }

  // Supprimer un article
  async delete(id: string): Promise<void> {
    this.checkServerSide()
    try {
      // Vérifier que l'article existe
      const existingItem = await prisma.shoppingItem.findUnique({
        where: { id },
      })

      if (!existingItem) {
        throw new Error('Article non trouvé')
      }

      await prisma.shoppingItem.delete({
        where: { id },
      })
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error)
      throw new Error('Impossible de supprimer l\'article')
    }
  }

  // Rechercher des articles par nom
  async searchByName(name: string): Promise<ShoppingItem[]> {
    this.checkServerSide()
    try {
      const items = await prisma.shoppingItem.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        include: {
          category: true,
        },
        orderBy: {
          name: 'asc',
        },
      })

      return items.map(item => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        category: item.category ? {
          id: item.category.id,
          name: item.category.name,
        } : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))
    } catch (error) {
      console.error('Erreur lors de la recherche d\'articles:', error)
      throw new Error('Impossible de rechercher les articles')
    }
  }

  // Récupérer les articles par catégorie
  async getByCategory(categoryId: string): Promise<ShoppingItem[]> {
    this.checkServerSide()
    try {
      const items = await prisma.shoppingItem.findMany({
        where: {
          categoryId,
        },
        include: {
          category: true,
        },
        orderBy: {
          name: 'asc',
        },
      })

      return items.map(item => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        category: item.category ? {
          id: item.category.id,
          name: item.category.name,
        } : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des articles par catégorie:', error)
      throw new Error('Impossible de récupérer les articles par catégorie')
    }
  }

  // Récupérer toutes les catégories disponibles
  async getCategories() {
    this.checkServerSide()
    try {
      const categories = await categoryService.getAll()
      return categories
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
      throw new Error('Impossible de récupérer les catégories')
    }
  }
}

// Instance singleton
export const shoppingItemService = new ShoppingItemService() 