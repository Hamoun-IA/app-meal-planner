// =============================================================================
// API ROUTE GÉNÉRATION RECETTES - AGENT CHEF
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../../lib/services/ai-service';
import { mockAIService } from '../../../../lib/services/ai-service-mock';
import { z } from 'zod';

// Utiliser le service mock en développement si pas de clé API
const service = process.env.OPENAI_API_KEY ? aiService : mockAIService;

// =============================================================================
// SCHÉMAS DE VALIDATION
// =============================================================================

const RecipeGenerationRequestSchema = z.object({
  ingredients: z.array(z.string()).min(1, 'Au moins un ingrédient requis'),
  cuisine: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  maxPrepTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
});

// =============================================================================
// FONCTIONS API
// =============================================================================

/**
 * POST /api/ai/recipe - Génération de recettes avec l'agent Chef
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = RecipeGenerationRequestSchema.parse(body);
    
    // Appel au service IA
    const response = await service.generateRecipe(validatedData);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Erreur POST /api/ai/recipe:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la génération de recette' },
      { status: 500 }
    );
  }
} 