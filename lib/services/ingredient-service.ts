import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { AppError } from '@/lib/utils/validation'
import { generateIngredientEmbedding } from '@/lib/ai/openai'
import { UnitType } from '@prisma/client'

// Schémas de validation Zod
const ingredientCreateSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  category: z.string().optional(),
  units: z.array(z.nativeEnum(UnitType)).min(1, 'Au moins une unité requise'),
})

export type IngredientCreateInput = z.infer<typeof ingredientCreateSchema>

export class IngredientService {
  private normalizeIngredientName(name: string): string {
    return name.toLowerCase().trim()
  }

  async validateIngredient(data: IngredientCreateInput): Promise<void> {
    // Validation Zod de base
    ingredientCreateSchema.parse(data)

    // Normaliser le nom
    const normalizedName = this.normalizeIngredientName(data.name)

    // Vérifier les doublons avec recherche floue
    await this.checkDuplicates(normalizedName)
  }

  private async checkDuplicates(normalizedName: string): Promise<void> {
    // Recherche d'ingrédients similaires
    const existingIngredients = await prisma.ingredient.findMany({
      where: {
        name: {
          contains: normalizedName,
          mode: 'insensitive',
        },
      },
    })

    // Calcul de similarité simple (Levenshtein-like)
    const similarIngredients = existingIngredients.filter(ing => {
      const existingNormalized = this.normalizeIngredientName(ing.name)
      const similarity = this.calculateSimilarity(normalizedName, existingNormalized)
      return similarity > 0.8 // 80% de similarité
    })

    if (similarIngredients.length > 0) {
      const similarNames = similarIngredients.map(ing => ing.name).join(', ')
      throw new AppError(
        `Ingrédient similaire trouvé: ${similarNames}`,
        400
      )
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  async create(data: IngredientCreateInput) {
    await this.validateIngredient(data)

    // Normaliser le nom
    const normalizedName = this.normalizeIngredientName(data.name)

    // Générer l'embedding
    const embedding = await generateIngredientEmbedding({
      name: normalizedName,
      category: data.category,
    })

    // Créer l'ingrédient
    return await prisma.ingredient.create({
      data: {
        name: normalizedName,
        category: data.category,
        units: data.units,
        embedding,
      },
    })
  }

  async findById(id: string) {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        recipes: {
          include: {
            recipe: true,
          },
        },
      },
    })

    if (!ingredient) {
      throw new AppError('Ingrédient non trouvé', 404)
    }

    return ingredient
  }

  async findAll(params: {
    page?: number
    limit?: number
    category?: string
    search?: string
  } = {}) {
    const { page = 1, limit = 10, category, search } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.ingredient.count({ where }),
    ])

    return { ingredients, total, page, limit }
  }

  async update(id: string, data: Partial<IngredientCreateInput>) {
    const existingIngredient = await this.findById(id)
    
    // Valider les nouvelles données si fournies
    if (data.name || data.units) {
      const updateData = {
        name: data.name || existingIngredient.name,
        category: data.category || existingIngredient.category,
        units: data.units || existingIngredient.units,
      }
      await this.validateIngredient(updateData as IngredientCreateInput)
    }

    // Générer un nouvel embedding si le contenu a changé
    let embedding = existingIngredient.embedding
    if (data.name || data.category) {
      embedding = await generateIngredientEmbedding({
        name: data.name || existingIngredient.name,
        category: data.category || existingIngredient.category,
      })
    }

    return await prisma.ingredient.update({
      where: { id },
      data: {
        name: data.name ? this.normalizeIngredientName(data.name) : undefined,
        category: data.category,
        units: data.units,
        embedding,
      },
    })
  }

  async delete(id: string) {
    const ingredient = await this.findById(id)
    
    // Vérifier s'il est utilisé dans des recettes
    const usedInRecipes = await prisma.recipeIngredient.findMany({
      where: { ingredientId: id },
    })

    if (usedInRecipes.length > 0) {
      throw new AppError(
        `Impossible de supprimer cet ingrédient car il est utilisé dans ${usedInRecipes.length} recette(s)`,
        400
      )
    }

    await prisma.ingredient.delete({
      where: { id },
    })

    return { message: 'Ingrédient supprimé avec succès' }
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0
    
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }
    
    if (norm1 === 0 || norm2 === 0) return 0
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }

  async searchSimilar(query: string, limit: number = 5) {
    const embedding = await generateIngredientEmbedding({ name: query })

    const existingIngredients = await prisma.ingredient.findMany({
      where: { embedding: { not: null } },
      select: { id: true, name: true, embedding: true }
    })

    const results = existingIngredients
      .map(ingredient => {
        try {
          const ingredientEmbedding = JSON.parse(ingredient.embedding!)
          const queryEmbedding = JSON.parse(embedding)
          const similarity = this.calculateCosineSimilarity(ingredientEmbedding, queryEmbedding)
          return { id: ingredient.id, name: ingredient.name, similarity }
        } catch {
          return { id: ingredient.id, name: ingredient.name, similarity: 0 }
        }
      })
      .filter(r => r.similarity > 0.1) // Seuil plus bas pour la recherche
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    return results
  }

  async getCategories() {
    const categories = await prisma.ingredient.findMany({
      select: { category: true },
      where: { category: { not: null } },
      distinct: ['category'],
    })

    return categories.map(c => c.category).filter(Boolean)
  }
} 