// =============================================================================
// API ROUTE ANALYSE NUTRITIONNELLE - AGENT NUTRITIONNISTE
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

const NutritionAnalysisRequestSchema = z.object({
  recipe: z.object({
    title: z.string().min(1, 'Titre de recette requis'),
    ingredients: z.array(z.object({
      name: z.string().min(1, 'Nom d\'ingrédient requis'),
      quantity: z.number().positive('Quantité positive requise'),
      unit: z.string().min(1, 'Unité requise'),
    })).min(1, 'Au moins un ingrédient requis'),
    instructions: z.array(z.string()).min(1, 'Au moins une instruction requise'),
  }),
});

// =============================================================================
// FONCTIONS API
// =============================================================================

/**
 * POST /api/ai/nutrition - Analyse nutritionnelle avec l'agent Nutritionniste
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = NutritionAnalysisRequestSchema.parse(body);
    
    // Appel au service IA
    const response = await service.analyzeNutrition(validatedData);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Erreur POST /api/ai/nutrition:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse nutritionnelle' },
      { status: 500 }
    );
  }
} 