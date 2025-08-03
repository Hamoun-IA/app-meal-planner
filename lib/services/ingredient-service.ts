import { z } from "zod"
import { prisma } from "@/lib/db/prisma-client"

// Schémas de validation
export const IngredientCreateSchema = z.object({
  name: z.string().min(1, "Le nom de l'ingrédient est requis"),
  categoryId: z.string().uuid().optional(),
  units: z.array(z.enum(["G", "KG", "ML", "CL", "L", "C_A_C", "C_A_S", "PINCEE", "POIGNEE", "BOUQUET", "GOUTTE", "PIECE"])).optional(),
})

export const IngredientUpdateSchema = IngredientCreateSchema.partial()

export type IngredientCreateInput = z.infer<typeof IngredientCreateSchema>
export type IngredientUpdateInput = z.infer<typeof IngredientUpdateSchema>

export class IngredientService {
  private checkServerSide() {
    if (typeof window !== "undefined") {
      throw new Error("Ce service ne peut être utilisé que côté serveur")
    }
  }

  async getAll() {
    this.checkServerSide()
    
    try {
      const ingredients = await prisma.ingredient.findMany({
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
      })
      return ingredients
    } catch (error) {
      console.error("Erreur lors de la récupération des ingrédients:", error)
      throw new Error("Impossible de récupérer les ingrédients")
    }
  }

  async getById(id: string) {
    this.checkServerSide()
    
    try {
      const ingredient = await prisma.ingredient.findUnique({
        where: { id },
        include: {
          category: true,
        },
      })
      return ingredient
    } catch (error) {
      console.error("Erreur lors de la récupération de l'ingrédient:", error)
      throw new Error("Impossible de récupérer l'ingrédient")
    }
  }

  async create(data: IngredientCreateInput) {
    this.checkServerSide()
    
    try {
      const validatedData = IngredientCreateSchema.parse(data)
      
      const ingredient = await prisma.ingredient.create({
        data: validatedData,
        include: {
          category: true,
        },
      })
      return ingredient
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Données invalides: ${error.errors.map(e => e.message).join(", ")}`)
      }
      console.error("Erreur lors de la création de l'ingrédient:", error)
      throw new Error("Impossible de créer l'ingrédient")
    }
  }

  async update(id: string, data: IngredientUpdateInput) {
    this.checkServerSide()
    
    try {
      const validatedData = IngredientUpdateSchema.parse(data)
      
      const ingredient = await prisma.ingredient.update({
        where: { id },
        data: validatedData,
        include: {
          category: true,
        },
      })
      return ingredient
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Données invalides: ${error.errors.map(e => e.message).join(", ")}`)
      }
      console.error("Erreur lors de la mise à jour de l'ingrédient:", error)
      throw new Error("Impossible de mettre à jour l'ingrédient")
    }
  }

  async delete(id: string) {
    this.checkServerSide()
    
    try {
      await prisma.ingredient.delete({
        where: { id },
      })
      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de l'ingrédient:", error)
      throw new Error("Impossible de supprimer l'ingrédient")
    }
  }

  async searchByName(name: string) {
    this.checkServerSide()
    
    try {
      const ingredients = await prisma.ingredient.findMany({
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
      return ingredients
    } catch (error) {
      console.error("Erreur lors de la recherche d'ingrédients:", error)
      throw new Error("Impossible de rechercher les ingrédients")
    }
  }

  async getByCategory(categoryId: string) {
    this.checkServerSide()
    
    try {
      const ingredients = await prisma.ingredient.findMany({
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
      return ingredients
    } catch (error) {
      console.error("Erreur lors de la récupération des ingrédients par catégorie:", error)
      throw new Error("Impossible de récupérer les ingrédients par catégorie")
    }
  }
}

// Instance singleton
export const ingredientService = new IngredientService() 