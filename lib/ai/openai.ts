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
}): Promise<string> {
  const text = `
    Ingrédient: ${ingredient.name}
    ${ingredient.category ? `Catégorie: ${ingredient.category}` : ''}
  `.trim()
  
  return generateEmbedding(text)
} 