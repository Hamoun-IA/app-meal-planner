import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { AppError } from '@/lib/utils/validation'
import { generateRecipeEmbedding } from '@/lib/ai/openai'
import { Difficulty, DishType, UnitType } from '@prisma/client'

// Schémas de validation Zod
const recipeIngredientSchema = z.object({
  ingredientId: z.string().uuid(),
  quantity: z.number().positive('La quantité doit être positive'),
  unit: z.nativeEnum(UnitType),
})

const recipeCreateSchema = z.object({
  name: z.string().min(5, 'Le nom doit contenir au moins 5 caractères'),
  prepTime: z.number().min(0).max(300, 'Temps de préparation invalide').transform(val => val === 0 ? 15 : val),
  cookTime: z.number().min(0).max(300, 'Temps de cuisson invalide').transform(val => val === 0 ? 10 : val),
  difficulty: z.nativeEnum(Difficulty).optional(),
  dishType: z.nativeEnum(DishType).optional(),
  instructions: z.array(z.string().min(10, 'Instruction trop courte')).min(2, 'Au moins 2 instructions requises'),
  tips: z.string().optional(),
  imageUrl: z.string().optional(),
  servings: z.number().min(1).max(20, 'Nombre de portions invalide').optional().transform(val => val || 4),
  ingredients: z.array(recipeIngredientSchema).min(1, 'Au moins 1 ingrédient requis'),
})

export type RecipeCreateInput = z.infer<typeof recipeCreateSchema>

export class RecipeService {
  private verbRegex = /(cuire|mélanger|couper|ajouter|servir|préparer|faire|chauffer|verser|égoutter|réserver|assaisonner|découper|émincer|hacher|râper|battre|fouetter|plier|étaler|badigeonner|sauter|braiser|rôtir|griller|frire|bouillir|poêler|vapeur|mariner|macérer|reposer|refroidir|congeler|décongeler|réchauffer|garnir|dresser|décorer|préchauff|lav|épluch|dispers|saupoudr|mélang|coupez|serv|enfourn|retourn|caramélis|tendr|dor|brown|golden|bubbling|dépos|plac|dispos|arrang|organis|empil|superpos|altern|intercal|sépar|divis|partag|répart|distribu|répand|étal)/i

  async validateRecipe(data: RecipeCreateInput): Promise<void> {
    // Validation Zod de base
    recipeCreateSchema.parse(data)

    // Validation des verbes d'action dans les instructions - Version plus permissive
    const invalidInstructions = data.instructions.filter(instruction => {
      // Vérifier si l'instruction contient des verbes d'action courants
      const hasActionVerb = this.verbRegex.test(instruction)
      
      // Vérifier si l'instruction contient des mots-clés culinaires
      const hasCookingKeywords = /(avec|dans|sur|pour|jusqu'à|pendant|minute|degré|température|four|poêle|casserole|plat|bol|assiette|cuillère|tasse|verre|goutte|pincée|poignée|bouquet|morceau|tranche|rondelle|dés|lamelle|filament|zeste|jus|pulpe|chair|peau|noyau|graine|feuille|tige|racine|bulbe|gousse|clou|bâton|sachet|cube|poudre|pâte|sauce|jus|sirop|confiture|gelée|crème|beurre|huile|vinaigre|sel|sucre|farine|levure|épice|herbe|aromate|condiment|assaisonnement)/i.test(instruction)
      
      // Vérifier si l'instruction contient des actions implicites
      const hasImplicitAction = /(préparer|faire|mettre|prendre|utiliser|choisir|sélectionner|acheter|récupérer|sortir|ouvrir|fermer|ranger|nettoyer|laver|éplucher|émincer|hacher|couper|trancher|râper|presser|extraire|mélanger|battre|fouetter|remuer|tourner|retourner|secouer|tamiser|filtrer|égoutter|essorer|éponger|sécher|humidifier|arroser|arroser|humidifier|sécher|éponger|essorer|égoutter|filtrer|tamiser|secouer|tourner|retourner|remuer|fouetter|battre|mélanger|extraire|presser|râper|trancher|couper|hacher|émincer|éplucher|laver|nettoyer|ranger|fermer|ouvrir|sortir|récupérer|acheter|sélectionner|choisir|utiliser|prendre|mettre|faire|préparer)/i.test(instruction)
      
      return !hasActionVerb && !hasCookingKeywords && !hasImplicitAction
    })
    
    if (invalidInstructions.length > 0) {
      throw new AppError(
        `Instructions sans verbes d'action: ${invalidInstructions.join(', ')}`,
        400
      )
    }

    // Validation du temps total
    const totalTime = (data.prepTime || 0) + (data.cookTime || 0)
    if (totalTime > 300) {
      throw new AppError('Le temps total ne peut pas dépasser 300 minutes', 400)
    }

    // Validation de cohérence du type de plat
    await this.checkDishTypeCoherence(data)

    // Vérification des unités compatibles avec les ingrédients
    await this.validateIngredientUnits(data.ingredients)

    // Vérification des doublons
    await this.checkDuplicates(data)
  }

  private async checkDishTypeCoherence(data: RecipeCreateInput): Promise<void> {
    if (data.dishType === DishType.DESSERT) {
      const saltyCategories = ['Viandes', 'Poissons', 'Fruits de mer']
      
      // Vérifier les ingrédients salés
      const ingredients = await prisma.ingredient.findMany({
        where: { id: { in: data.ingredients.map(i => i.ingredientId) } }
      })
      
      const hasSalty = ingredients.some(ing => 
        saltyCategories.some(cat => ing.category?.includes(cat))
      )
      
      if (hasSalty) {
        throw new AppError(
          'Incohérence: Un dessert ne devrait pas contenir d\'ingrédients salés',
          400
        )
      }

      if (data.ingredients.length > 6) {
        throw new AppError(
          'Incohérence: Un dessert ne devrait pas avoir plus de 6 ingrédients',
          400
        )
      }

      if ((data.cookTime || 0) > 40) {
        throw new AppError(
          'Incohérence: Un dessert ne devrait pas cuire plus de 40 minutes',
          400
        )
      }
    }
  }

  private async validateIngredientUnits(ingredients: { ingredientId: string; unit: UnitType }[]): Promise<void> {
    const ingredientIds = ingredients.map(i => i.ingredientId)
    const dbIngredients = await prisma.ingredient.findMany({
      where: { id: { in: ingredientIds } }
    })

    for (const recipeIngredient of ingredients) {
      const dbIngredient = dbIngredients.find(i => i.id === recipeIngredient.ingredientId)
      if (!dbIngredient) {
        throw new AppError(`Ingrédient non trouvé: ${recipeIngredient.ingredientId}`, 400)
      }

      if (!dbIngredient.units.includes(recipeIngredient.unit)) {
        throw new AppError(
          `Unité '${recipeIngredient.unit}' non compatible avec l'ingrédient '${dbIngredient.name}'`,
          400
        )
      }
    }
  }

  private async checkDuplicates(data: RecipeCreateInput): Promise<void> {
    // Générer l'embedding pour la recherche de similarité
    const embedding = await generateRecipeEmbedding({
      name: data.name,
      instructions: data.instructions,
      tips: data.tips,
      dishType: data.dishType,
    })

    // Recherche de similarité avec embeddings JSON
    const existingRecipes = await prisma.recipe.findMany({
      where: { embedding: { not: null } },
      select: { id: true, name: true, embedding: true }
    })

    const similarRecipes = existingRecipes
      .map(recipe => {
        try {
          const recipeEmbedding = JSON.parse(recipe.embedding!)
          const newEmbedding = JSON.parse(embedding)
          const similarity = this.calculateCosineSimilarity(recipeEmbedding, newEmbedding)
          return { id: recipe.id, name: recipe.name, similarity }
        } catch {
          return { id: recipe.id, name: recipe.name, similarity: 0 }
        }
      })
      .filter(r => r.similarity > 0.85)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)

    const highSimilarity = similarRecipes.find(r => r.similarity > 0.85)
    if (highSimilarity) {
      throw new AppError(
        `Recette similaire trouvée: "${highSimilarity.name}" (similarité: ${(highSimilarity.similarity * 100).toFixed(1)}%)`,
        400
      )
    }
  }

  private async checkDuplicatesForUpdate(data: RecipeCreateInput, excludeId: string): Promise<void> {
    // Générer l'embedding pour la recherche de similarité
    const embedding = await generateRecipeEmbedding({
      name: data.name,
      instructions: data.instructions,
      tips: data.tips,
      dishType: data.dishType,
    })

    // Recherche de similarité avec embeddings JSON, en excluant la recette actuelle
    const existingRecipes = await prisma.recipe.findMany({
      where: { 
        embedding: { not: null },
        id: { not: excludeId } // Exclure la recette actuelle
      },
      select: { id: true, name: true, embedding: true }
    })

    const similarRecipes = existingRecipes
      .map(recipe => {
        try {
          const recipeEmbedding = JSON.parse(recipe.embedding!)
          const newEmbedding = JSON.parse(embedding)
          const similarity = this.calculateCosineSimilarity(recipeEmbedding, newEmbedding)
          return { id: recipe.id, name: recipe.name, similarity }
        } catch {
          return { id: recipe.id, name: recipe.name, similarity: 0 }
        }
      })
      .filter(r => r.similarity > 0.85)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)

    const highSimilarity = similarRecipes.find(r => r.similarity > 0.85)
    if (highSimilarity) {
      throw new AppError(
        `Recette similaire trouvée: "${highSimilarity.name}" (similarité: ${(highSimilarity.similarity * 100).toFixed(1)}%)`,
        400
      )
    }
  }

  async create(data: RecipeCreateInput) {
    await this.validateRecipe(data)

    // Générer l'embedding
    const embedding = await generateRecipeEmbedding({
      name: data.name,
      instructions: data.instructions,
      tips: data.tips,
      dishType: data.dishType,
    })

    // Créer la recette avec transaction
    return await prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data: {
          name: data.name,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          difficulty: data.difficulty,
          dishType: data.dishType,
          instructions: data.instructions,
          tips: data.tips,
          imageUrl: data.imageUrl,
          servings: data.servings,
          embedding,
        },
      })

      // Créer les relations avec les ingrédients
      await tx.recipeIngredient.createMany({
        data: data.ingredients.map(ing => ({
          recipeId: recipe.id,
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
      })

      return recipe
    })
  }

  async findById(id: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    })

    if (!recipe) {
      throw new AppError('Recette non trouvée', 404)
    }

    return recipe
  }

  async findAll(params: {
    page?: number
    limit?: number
    dishType?: DishType
    difficulty?: Difficulty
    search?: string
  } = {}) {
    const { page = 1, limit = 10, dishType, difficulty, search } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (dishType) where.dishType = dishType
    if (difficulty) where.difficulty = difficulty
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { instructions: { hasSome: [search] } },
      ]
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.recipe.count({ where }),
    ])

    return { recipes, total, page, limit }
  }

  async update(id: string, data: Partial<RecipeCreateInput>) {
    const existingRecipe = await this.findById(id)
    
    // Préparer les données avec les valeurs par défaut pour les temps
    const updateData = {
      name: data.name || existingRecipe.name,
      prepTime: data.prepTime !== undefined ? (data.prepTime === 0 ? 15 : data.prepTime) : existingRecipe.prepTime || 15,
      cookTime: data.cookTime !== undefined ? (data.cookTime === 0 ? 10 : data.cookTime) : existingRecipe.cookTime || 10,
      instructions: data.instructions || existingRecipe.instructions,
      tips: data.tips || existingRecipe.tips,
      dishType: data.dishType || existingRecipe.dishType,
      imageUrl: data.imageUrl || existingRecipe.imageUrl,
      servings: data.servings !== undefined ? data.servings : existingRecipe.servings || 4,
      ingredients: data.ingredients || [],
    }
    
    // Valider les nouvelles données si fournies (en excluant la recette actuelle des doublons)
    if (data.name || data.instructions || data.ingredients) {
      // Validation de base sans vérification des doublons
      recipeCreateSchema.parse(updateData as RecipeCreateInput)
      
      // Validation des verbes d'action dans les instructions
      const invalidInstructions = updateData.instructions.filter(instruction => {
        const hasActionVerb = this.verbRegex.test(instruction)
        const hasCookingKeywords = /(avec|dans|sur|pour|jusqu'à|pendant|minute|degré|température|four|poêle|casserole|plat|bol|assiette|cuillère|tasse|verre|goutte|pincée|poignée|bouquet|morceau|tranche|rondelle|dés|lamelle|filament|zeste|jus|pulpe|chair|peau|noyau|graine|feuille|tige|racine|bulbe|gousse|clou|bâton|sachet|cube|poudre|pâte|sauce|jus|sirop|confiture|gelée|crème|beurre|huile|vinaigre|sel|sucre|farine|levure|épice|herbe|aromate|condiment|assaisonnement)/i.test(instruction)
        const hasImplicitAction = /(préparer|faire|mettre|prendre|utiliser|choisir|sélectionner|acheter|récupérer|sortir|ouvrir|fermer|ranger|nettoyer|laver|éplucher|émincer|hacher|couper|trancher|râper|presser|extraire|mélanger|battre|fouetter|remuer|tourner|retourner|secouer|tamiser|filtrer|égoutter|essorer|éponger|sécher|humidifier|arroser|arroser|humidifier|sécher|éponger|essorer|égoutter|filtrer|tamiser|secouer|tourner|retourner|remuer|fouetter|battre|mélanger|extraire|presser|râper|trancher|couper|hacher|émincer|éplucher|laver|nettoyer|ranger|fermer|ouvrir|sortir|récupérer|acheter|sélectionner|choisir|utiliser|prendre|mettr|fair|prépar)/i.test(instruction)
        return !hasActionVerb && !hasCookingKeywords && !hasImplicitAction
      })
      
      if (invalidInstructions.length > 0) {
        throw new AppError(
          `Instructions sans verbes d'action: ${invalidInstructions.join(', ')}`,
          400
        )
      }
      
      // Validation du temps total
      const totalTime = (updateData.prepTime || 0) + (updateData.cookTime || 0)
      if (totalTime > 300) {
        throw new AppError('Le temps total ne peut pas dépasser 300 minutes', 400)
      }
      
      // Validation de cohérence du type de plat
      await this.checkDishTypeCoherence(updateData as RecipeCreateInput)
      
      // Vérification des unités compatibles avec les ingrédients
      await this.validateIngredientUnits(updateData.ingredients)
      
      // Vérification des doublons (en excluant la recette actuelle)
      await this.checkDuplicatesForUpdate(updateData as RecipeCreateInput, id)
    }

    // Générer un nouvel embedding si le contenu a changé
    let embedding = existingRecipe.embedding
    if (data.name || data.instructions || data.tips || data.dishType) {
      embedding = await generateRecipeEmbedding({
        name: data.name || existingRecipe.name,
        instructions: data.instructions || existingRecipe.instructions,
        tips: data.tips || existingRecipe.tips,
        dishType: data.dishType || existingRecipe.dishType,
      })
    }

    return await prisma.recipe.update({
      where: { id },
      data: {
        name: data.name,
        prepTime: updateData.prepTime,
        cookTime: updateData.cookTime,
        difficulty: data.difficulty,
        dishType: data.dishType,
        instructions: data.instructions,
        tips: data.tips,
        imageUrl: data.imageUrl,
        servings: data.servings,
        embedding,
      },
    })
  }

  async delete(id: string) {
    await this.findById(id) // Vérifier que la recette existe
    
    await prisma.recipe.delete({
      where: { id },
    })

    return { message: 'Recette supprimée avec succès' }
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
    const embedding = await generateRecipeEmbedding({ name: query, instructions: [] })

    const existingRecipes = await prisma.recipe.findMany({
      where: { embedding: { not: null } },
      select: { id: true, name: true, embedding: true }
    })

    const results = existingRecipes
      .map(recipe => {
        try {
          const recipeEmbedding = JSON.parse(recipe.embedding!)
          const queryEmbedding = JSON.parse(embedding)
          const similarity = this.calculateCosineSimilarity(recipeEmbedding, queryEmbedding)
          return { id: recipe.id, name: recipe.name, similarity }
        } catch {
          return { id: recipe.id, name: recipe.name, similarity: 0 }
        }
      })
      .filter(r => r.similarity > 0.1) // Seuil plus bas pour la recherche
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    return results
  }
} 