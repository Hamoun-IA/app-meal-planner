import OpenAI from 'openai'
import { AppError } from '@/lib/utils/validation'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateEmbedding(text: string): Promise<string> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    
    return JSON.stringify(response.data[0].embedding)
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new AppError('Failed to generate embedding', 500)
  }
}

export async function generateRecipeEmbedding(recipe: {
  name: string
  instructions: string[]
  tips?: string
  dishType?: string
}): Promise<string> {
  const text = `
    Recette: ${recipe.name}
    Type: ${recipe.dishType || 'Non spécifié'}
    Instructions: ${recipe.instructions.join(' ')}
    ${recipe.tips ? `Conseils: ${recipe.tips}` : ''}
  `.trim()
  
  return generateEmbedding(text)
}

export async function generateIngredientEmbedding(ingredient: {
  name: string
  category?: string
  categoryId?: string
}): Promise<string> {
  let categoryName = ingredient.category
  
  // Si on a un categoryId mais pas de category, récupérer le nom de la catégorie
  if (ingredient.categoryId && !ingredient.category) {
    try {
      const { prisma } = await import('@/lib/db/prisma')
      const category = await prisma.category.findUnique({
        where: { id: ingredient.categoryId },
        select: { name: true }
      })
      categoryName = category?.name
    } catch (error) {
      console.warn('Impossible de récupérer le nom de la catégorie:', error)
    }
  }

  const text = `
    Ingrédient: ${ingredient.name}
    ${categoryName ? `Catégorie: ${categoryName}` : ''}
  `.trim()
  
  return generateEmbedding(text)
} 