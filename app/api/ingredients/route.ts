// =============================================================================
// API ROUTE INGRÉDIENTS - ASSISTANTE BABOUNETTE
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ingredientService } from '@/lib/services/ingredient-service';
import { z } from 'zod';

// =============================================================================
// SCHÉMAS DE VALIDATION
// =============================================================================

const CreateIngredientSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  calories: z.number().positive().optional(),
  protein: z.number().positive().optional(),
  carbs: z.number().positive().optional(),
  fat: z.number().positive().optional(),
  fiber: z.number().positive().optional(),
  sugar: z.number().positive().optional(),
  sodium: z.number().positive().optional(),
  category: z.enum(['vegetables', 'fruits', 'proteins', 'grains', 'dairy', 'spices', 'other']).optional(),
  allergens: z.array(z.string()).default([]),
});

const UpdateIngredientSchema = CreateIngredientSchema.partial();

// =============================================================================
// FONCTIONS API
// =============================================================================

/**
 * GET /api/ingredients - Récupère les ingrédients
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const allergens = searchParams.get('allergens')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '50');

    let ingredients;
    if (search) {
      // Recherche par nom
      ingredients = await ingredientService.searchIngredients(search, limit);
    } else {
      // Récupération avec filtres
      ingredients = await ingredientService.getIngredients({
        category: category || undefined,
        allergens: allergens || undefined,
      });
    }

    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error('Erreur GET /api/ingredients:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ingrédients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ingredients - Crée un nouvel ingrédient
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = CreateIngredientSchema.parse(body);
    
    const ingredient = await ingredientService.createIngredient(validatedData);
    
    return NextResponse.json({ ingredient }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/ingredients:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'ingrédient' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ingredients - Met à jour un ingrédient
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID d\'ingrédient requis' },
        { status: 400 }
      );
    }
    
    // Validation des données
    const validatedData = UpdateIngredientSchema.parse(data);
    
    const ingredient = await ingredientService.updateIngredient(id, validatedData);
    
    return NextResponse.json({ ingredient });
  } catch (error) {
    console.error('Erreur PUT /api/ingredients:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'ingrédient' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ingredients - Supprime un ingrédient
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID d\'ingrédient requis' },
        { status: 400 }
      );
    }
    
    await ingredientService.deleteIngredient(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/ingredients:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'ingrédient' },
      { status: 500 }
    );
  }
} 