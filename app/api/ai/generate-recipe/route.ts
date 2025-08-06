import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { chefAgent } from '@/lib/ai/agents'
import { validateRequest, handleError } from '@/lib/utils/validation'

const generateRecipeSchema = z.object({
  prompt: z.string().min(1, 'Le prompt ne peut pas être vide'),
  preferences: z.array(z.any()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, preferences } = await validateRequest(req, generateRecipeSchema)

    console.log('👨‍🍳 Generate recipe request:', { prompt, preferences })

    // Obtenir la recette de l'agent Chef
    const recipe = await chefAgent.generateRecipe(prompt, preferences)
    
    console.log('👨‍🍳 Generated recipe:', recipe)

    return NextResponse.json({ 
      data: recipe,
      message: 'Recette générée avec succès ! 🍳'
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Erreur lors de la génération de recette:', error)
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 