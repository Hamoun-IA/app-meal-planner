// =============================================================================
// API ROUTE PLAN DE REPAS - AGENT PLANIFICATEUR
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

const MealPlanRequestSchema = z.object({
  userId: z.string().min(1, 'UserId requis'),
  startDate: z.string().datetime('Date de début invalide'),
  endDate: z.string().datetime('Date de fin invalide'),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  calorieTarget: z.number().int().positive().optional(),
  budgetPerMeal: z.number().positive().optional(),
  cuisinePreferences: z.array(z.string()).optional(),
});

// =============================================================================
// FONCTIONS API
// =============================================================================

/**
 * POST /api/ai/meal-plan - Génération de plans de repas avec l'agent Planificateur
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = MealPlanRequestSchema.parse(body);
    
    // Conversion des dates
    const mealPlanRequest = {
      ...validatedData,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
    };
    
    // Appel au service IA
    const response = await service.generateMealPlan(mealPlanRequest);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Erreur POST /api/ai/meal-plan:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la génération du plan de repas' },
      { status: 500 }
    );
  }
} 