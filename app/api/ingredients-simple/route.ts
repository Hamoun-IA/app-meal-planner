// =============================================================================
// API ROUTE INGRÉDIENTS SIMPLIFIÉE - ASSISTANTE BABOUNETTE
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';

// Données de test
const MOCK_INGREDIENTS = [
  {
    id: '1',
    name: 'Poulet (blanc)',
    description: 'Viande de poulet blanche, cuite',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    category: 'proteins',
    allergens: [],
  },
  {
    id: '2',
    name: 'Riz basmati',
    description: 'Riz basmati cuit',
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    category: 'grains',
    allergens: [],
  },
  {
    id: '3',
    name: 'Tomate',
    description: 'Tomate fraîche',
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    category: 'vegetables',
    allergens: [],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    let ingredients = MOCK_INGREDIENTS;

    // Filtrage par recherche
    if (search) {
      ingredients = ingredients.filter(ing => 
        ing.name.toLowerCase().includes(search.toLowerCase()) ||
        ing.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtrage par catégorie
    if (category) {
      ingredients = ingredients.filter(ing => ing.category === category);
    }

    // Limitation
    ingredients = ingredients.slice(0, limit);

    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error('Erreur GET /api/ingredients-simple:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ingrédients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation simple
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nom d\'ingrédient requis' },
        { status: 400 }
      );
    }

    const newIngredient = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description || '',
      calories: body.calories || null,
      protein: body.protein || null,
      carbs: body.carbs || null,
      fat: body.fat || null,
      category: body.category || 'other',
      allergens: body.allergens || [],
    };

    return NextResponse.json({ ingredient: newIngredient }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/ingredients-simple:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'ingrédient' },
      { status: 500 }
    );
  }
} 