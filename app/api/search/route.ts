// =============================================================================
// API ROUTE RECHERCHE RAG - ASSISTANTE BABOUNETTE
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { simpleRagService } from '../../../lib/rag-service-simple';
import { z } from 'zod';

// =============================================================================
// SCHÉMAS DE VALIDATION
// =============================================================================

const SearchQuerySchema = z.object({
  query: z.string().min(1, 'Requête de recherche requise'),
  cuisine: z.string().optional(),
  difficulty: z.string().optional(),
  maxPrepTime: z.number().int().positive().optional(),
  maxCookTime: z.number().int().positive().optional(),
  maxCalories: z.number().int().positive().optional(),
  tags: z.any().optional(), // JSON pour SQLite
  categories: z.any().optional(), // JSON pour SQLite
  allergens: z.any().optional(), // JSON pour SQLite
  limit: z.number().int().positive().max(50).default(20),
});

// =============================================================================
// FONCTIONS API
// =============================================================================

/**
 * GET /api/search - Recherche de recettes avec RAG
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const cuisine = searchParams.get('cuisine');
    const difficulty = searchParams.get('difficulty');
    const maxPrepTime = searchParams.get('maxPrepTime') ? parseInt(searchParams.get('maxPrepTime')!) : undefined;
    const maxCookTime = searchParams.get('maxCookTime') ? parseInt(searchParams.get('maxCookTime')!) : undefined;
    const maxCalories = searchParams.get('maxCalories') ? parseInt(searchParams.get('maxCalories')!) : undefined;
    const tags = searchParams.get('tags')?.split(',');
    const categories = searchParams.get('categories')?.split(',');
    const allergens = searchParams.get('allergens')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json(
        { error: 'Paramètre de recherche "q" requis' },
        { status: 400 }
      );
    }

    // Validation des paramètres
    const validatedParams = SearchQuerySchema.parse({
      query,
      cuisine: cuisine || undefined,
      difficulty: difficulty || undefined,
      maxPrepTime,
      maxCookTime,
      maxCalories,
      tags,
      categories,
      allergens,
      limit,
    });

    // Recherche avec RAG simplifié
    const results = await simpleRagService.searchRecipes(
      validatedParams.query,
      {
        cuisine: validatedParams.cuisine,
        difficulty: validatedParams.difficulty,
        maxPrepTime: validatedParams.maxPrepTime,
        maxCookTime: validatedParams.maxCookTime,
        maxCalories: validatedParams.maxCalories,
        tags: validatedParams.tags,
        categories: validatedParams.categories,
        allergens: validatedParams.allergens,
      },
      validatedParams.limit
    );

    return NextResponse.json({
      query: validatedParams.query,
      results: results.map(result => ({
        recipe: result.recipe,
        score: result.score,
        matchType: result.matchType,
        matchedTerms: result.matchedTerms,
      })),
      totalResults: results.length,
      filters: {
        cuisine: validatedParams.cuisine,
        difficulty: validatedParams.difficulty,
        maxPrepTime: validatedParams.maxPrepTime,
        maxCookTime: validatedParams.maxCookTime,
        maxCalories: validatedParams.maxCalories,
        tags: validatedParams.tags,
        categories: validatedParams.categories,
        allergens: validatedParams.allergens,
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/search:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Paramètres de recherche invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search - Recherche avancée avec body JSON
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = SearchQuerySchema.parse(body);
    
    // Recherche avec RAG simplifié
    const results = await simpleRagService.searchRecipes(
      validatedData.query,
      {
        cuisine: validatedData.cuisine,
        difficulty: validatedData.difficulty,
        maxPrepTime: validatedData.maxPrepTime,
        maxCookTime: validatedData.maxCookTime,
        maxCalories: validatedData.maxCalories,
        tags: validatedData.tags,
        categories: validatedData.categories,
        allergens: validatedData.allergens,
      },
      validatedData.limit
    );

    return NextResponse.json({
      query: validatedData.query,
      results: results.map(result => ({
        recipe: result.recipe,
        score: result.score,
        matchType: result.matchType,
        matchedTerms: result.matchedTerms,
      })),
      totalResults: results.length,
      filters: {
        cuisine: validatedData.cuisine,
        difficulty: validatedData.difficulty,
        maxPrepTime: validatedData.maxPrepTime,
        maxCookTime: validatedData.maxCookTime,
        maxCalories: validatedData.maxCalories,
        tags: validatedData.tags,
        categories: validatedData.categories,
        allergens: validatedData.allergens,
      },
    });
  } catch (error) {
    console.error('Erreur POST /api/search:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données de recherche invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
} 