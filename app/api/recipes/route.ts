// =============================================================================
// API ROUTE RECETTES - ASSISTANTE BABOUNETTE
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { recipeService } from '../../../lib/services/recipe-service';
import { z } from 'zod';
import { authService } from '../../../lib/auth';

// =============================================================================
// SCHÉMAS DE VALIDATION
// =============================================================================

const CreateRecipeSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  instructions: z.array(z.string()).min(1, 'Au moins une instruction'),
  prepTime: z.number().int().positive(),
  cookTime: z.number().int().positive(),
  servings: z.number().int().positive(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  cuisine: z.string().optional(),
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  calories: z.number().int().positive().optional(),
  protein: z.number().positive().optional(),
  carbs: z.number().positive().optional(),
  fat: z.number().positive().optional(),
  fiber: z.number().positive().optional(),
  sugar: z.number().positive().optional(),
  sodium: z.number().positive().optional(),
  ingredients: z.array(z.object({
    ingredientId: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
    notes: z.string().optional(),
  })).min(1, 'Au moins un ingrédient'),
});

const UpdateRecipeSchema = CreateRecipeSchema.partial();

// =============================================================================
// FONCTIONS API
// =============================================================================

/**
 * GET /api/recipes - Récupère les recettes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const cuisine = searchParams.get('cuisine');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      );
    }

    let recipes;
    if (search) {
      // Recherche avec RAG
      recipes = await recipeService.searchRecipes(search, {
        userId,
        cuisine: cuisine || undefined,
        difficulty: difficulty || undefined,
      }, limit);
    } else {
      // Récupération normale avec filtres
      recipes = await recipeService.getUserRecipes(userId, {
        cuisine: cuisine || undefined,
        difficulty: difficulty || undefined,
      });
    }

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Erreur GET /api/recipes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des recettes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recipes - Crée une nouvelle recette
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = CreateRecipeSchema.parse(body);
    
    // Récupérer l'utilisateur de test via le service d'authentification
    const testUser = await authService.getTestUser();
    const userId = testUser.id;
    
    const recipe = await recipeService.createRecipe(userId, validatedData);
    
    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/recipes:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la recette' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/recipes - Met à jour une recette
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de recette requis' },
        { status: 400 }
      );
    }
    
    // Validation des données
    const validatedData = UpdateRecipeSchema.parse(data);
    
    // Récupérer l'utilisateur de test via le service d'authentification
    const testUser = await authService.getTestUser();
    const userId = testUser.id;
    
    const recipe = await recipeService.updateRecipe(id, userId, validatedData);
    
    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Erreur PUT /api/recipes:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la recette' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recipes - Supprime une recette
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de recette requis' },
        { status: 400 }
      );
    }
    
    // Récupérer l'utilisateur de test via le service d'authentification
    const testUser = await authService.getTestUser();
    const userId = testUser.id;
    
    await recipeService.deleteRecipe(id, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/recipes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la recette' },
      { status: 500 }
    );
  }
} 