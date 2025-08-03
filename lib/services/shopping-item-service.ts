import { z } from "zod"
import { prisma } from "@/lib/db/prisma-client"

// Schémas de validation
export const ShoppingItemCreateSchema = z.object({
  name: z.string().min(1, "Le nom de l'article est requis"),
  categoryId: z.string().uuid().optional(),
  unit: z.enum(["G", "KG", "ML", "CL", "L", "C_A_C", "C_A_S", "PINCEE", "POIGNEE", "BOUQUET", "GOUTTE", "PIECE"]).optional(),
})

export const ShoppingItemUpdateSchema = ShoppingItemCreateSchema.partial()

export type ShoppingItemCreateInput = z.infer<typeof ShoppingItemCreateSchema>
export type ShoppingItemUpdateInput = z.infer<typeof ShoppingItemUpdateSchema>

export class ShoppingItemService {
  private checkServerSide() {
    if (typeof window !== "undefined") {
      throw new Error("Ce service ne peut être utilisé que côté serveur")
    }
  }

  async getAll() {
    this.checkServerSide()
    
    try {
      const shoppingItems = await prisma.shoppingItem.findMany({
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
      })
      return shoppingItems
    } catch (error) {
      console.error("Erreur lors de la récupération des articles:", error)
      throw new Error("Impossible de récupérer les articles")
    }
  }

  async getById(id: string) {
    this.checkServerSide()
    
    try {
      const shoppingItem = await prisma.shoppingItem.findUnique({
        where: { id },
        include: {
          category: true,
        },
      })
      return shoppingItem
    } catch (error) {
      console.error("Erreur lors de la récupération de l'article:", error)
      throw new Error("Impossible de récupérer l'article")
    }
  }

  async create(data: ShoppingItemCreateInput) {
    this.checkServerSide()
    
    try {
      const validatedData = ShoppingItemCreateSchema.parse(data)
      
      const shoppingItem = await prisma.shoppingItem.create({
        data: validatedData,
        include: {
          category: true,
        },
      })
      return shoppingItem
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Données invalides: ${error.errors.map(e => e.message).join(", ")}`)
      }
      console.error("Erreur lors de la création de l'article:", error)
      throw new Error("Impossible de créer l'article")
    }
  }

  async update(id: string, data: ShoppingItemUpdateInput) {
    this.checkServerSide()
    
    try {
      const validatedData = ShoppingItemUpdateSchema.parse(data)
      
      const shoppingItem = await prisma.shoppingItem.update({
        where: { id },
        data: validatedData,
        include: {
          category: true,
        },
      })
      return shoppingItem
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Données invalides: ${error.errors.map(e => e.message).join(", ")}`)
      }
      console.error("Erreur lors de la mise à jour de l'article:", error)
      throw new Error("Impossible de mettre à jour l'article")
    }
  }

  async delete(id: string) {
    this.checkServerSide()
    
    try {
      await prisma.shoppingItem.delete({
        where: { id },
      })
      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de l'article:", error)
      throw new Error("Impossible de supprimer l'article")
    }
  }

  async searchByName(name: string) {
    this.checkServerSide()
    
    try {
      const shoppingItems = await prisma.shoppingItem.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
        take: 10,
      })
      return shoppingItems
    } catch (error) {
      console.error("Erreur lors de la recherche d'articles:", error)
      throw new Error("Impossible de rechercher les articles")
    }
  }

  async getByCategory(categoryId: string) {
    this.checkServerSide()
    
    try {
      const shoppingItems = await prisma.shoppingItem.findMany({
        where: {
          categoryId,
        },
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
      })
      return shoppingItems
    } catch (error) {
      console.error("Erreur lors de la récupération des articles par catégorie:", error)
      throw new Error("Impossible de récupérer les articles par catégorie")
    }
  }

  async getCategories() {
    this.checkServerSide()
    
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
      })
      return categories
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error)
      throw new Error("Impossible de récupérer les catégories")
    }
  }
}

// Instance singleton
export const shoppingItemService = new ShoppingItemService() 