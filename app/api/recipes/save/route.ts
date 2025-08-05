import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { validateRequest, handleError } from '@/lib/utils/validation'
import { Difficulty, DishType } from '@prisma/client'

// Fonction pour assigner automatiquement une catégorie à un ingrédient
async function assignCategoryToIngredient(ingredientName: string): Promise<string | null> {
  const normalizedName = ingredientName.toLowerCase().trim()
  
  // Règles de correspondance pour les catégories
  const categoryRules = {
    'légumes': ['carotte', 'carottes', 'tomate', 'tomates', 'oignon', 'oignons', 'ail', 'poivron', 'poivrons', 'courgette', 'courgettes', 'aubergine', 'aubergines', 'brocoli', 'chou', 'salade', 'épinard', 'épinards', 'haricot', 'haricots', 'petit pois', 'maïs', 'céleri', 'navet', 'navets', 'radis', 'betterave', 'betteraves', 'artichaut', 'artichauts', 'asperge', 'asperges', 'endive', 'endives', 'champignon', 'champignons'],
    'fruits': ['pomme', 'pommes', 'banane', 'bananes', 'orange', 'oranges', 'fraise', 'fraises', 'raisin', 'raisins', 'kiwi', 'ananas', 'mangue', 'mangues', 'pêche', 'pêches', 'abricot', 'abricots', 'prune', 'prunes', 'cerise', 'cerises', 'framboise', 'framboises', 'myrtille', 'myrtilles', 'citron', 'citrons', 'lime', 'pamplemousse', 'mandarine', 'mandarines', 'clémentine', 'clémentines', 'figue', 'figues', 'datte', 'dattes'],
    'produits laitiers': ['lait', 'fromage', 'yaourt', 'yaourts', 'crème', 'beurre', 'fromage blanc', 'cottage cheese', 'mozzarella', 'cheddar', 'parmesan', 'gouda', 'camembert', 'brie', 'roquefort', 'feta', 'ricotta', 'lait de coco', 'lait coco'],
    'épices et condiments': ['sel', 'poivre', 'curry', 'curry en poudre', 'paprika', 'cumin', 'cannelle', 'muscade', 'gingembre', 'gingembre frais', 'basilic', 'basilic frais', 'thym', 'romarin', 'origan', 'laurier', 'safran', 'vanille', 'cacao', 'chocolat', 'sucre', 'miel', 'sirop', 'vinaigre', 'sauce soja', 'moutarde', 'ketchup', 'mayonnaise'],
    'boulangerie': ['pain', 'baguette', 'croissant', 'croissants', 'brioche', 'tarte', 'tartes', 'gâteau', 'gâteaux', 'biscuit', 'biscuits', 'cookie', 'cookies', 'muffin', 'muffins', 'donut', 'donuts', 'éclair', 'éclairs', 'chou', 'mille-feuille', 'tartelette', 'tartelettes'],
    'céréales': ['riz', 'pâtes', 'quinoa', 'blé', 'avoine', 'orge', 'seigle', 'épeautre', 'sarrasin', 'millet', 'couscous', 'bulgur', 'farine', 'semoule'],
    'boissons': ['eau', 'jus', 'soda', 'coca', 'limonade', 'thé', 'café', 'vin', 'bière', 'cidre', 'champagne', 'whisky', 'vodka', 'rhum', 'gin', 'liqueur'],
    'surgelés': ['poisson', 'poulet', 'viande', 'légumes surgelés', 'frites', 'pizza', 'glace', 'sorbet', 'crème glacée'],
    'entretien': ['lessive', 'adoucissant', 'détergent', 'savon', 'shampoing', 'gel douche', 'dentifrice', 'brosse à dents', 'papier toilette', 'essuie-tout', 'film alimentaire', 'papier aluminium', 'sac poubelle'],
    'hygiène & beauté': ['shampoing', 'gel douche', 'savon', 'dentifrice', 'brosse à dents', 'déodorant', 'parfum', 'crème', 'maquillage', 'vernis', 'rasoir', 'cotons', 'serviettes hygiéniques']
  }

  // Chercher une correspondance dans les règles
  for (const [categoryName, keywords] of Object.entries(categoryRules)) {
    for (const keyword of keywords) {
      if (normalizedName.includes(keyword)) {
        // Trouver la catégorie correspondante dans la base de données
        const category = await prisma.category.findFirst({
          where: {
            name: {
              contains: categoryName,
              mode: 'insensitive'
            }
          }
        })
        
        if (category) {
          console.log(`🏷️ Catégorie assignée à "${ingredientName}": ${category.name}`)
          return category.id
        }
      }
    }
  }

  // Si aucune correspondance, chercher la catégorie "Autres"
  const autresCategory = await prisma.category.findFirst({
    where: {
      name: {
        contains: 'autres',
        mode: 'insensitive'
      }
    }
  })

  if (autresCategory) {
    console.log(`🏷️ Catégorie par défaut assignée à "${ingredientName}": ${autresCategory.name}`)
    return autresCategory.id
  }

  console.log(`⚠️ Aucune catégorie trouvée pour "${ingredientName}"`)
  return null
}

const saveRecipeSchema = z.object({
  name: z.string().min(1, 'Le nom de la recette est requis'),
  prepTime: z.number().min(1, 'Le temps de préparation doit être positif'),
  cookTime: z.number().min(0, 'Le temps de cuisson doit être positif ou nul'),
  difficulty: z.enum(['FACILE', 'MOYEN', 'DIFFICILE'] as const),
  dishType: z.enum(['ENTREE', 'PLAT_PRINCIPAL', 'ACCOMPAGNEMENT', 'DESSERT'] as const),
  instructions: z.array(z.string().min(1, 'Les instructions ne peuvent pas être vides')),
  tips: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1, 'Le nom de l\'ingrédient est requis'),
    quantity: z.number().min(0, 'La quantité doit être positive'),
    unit: z.string().min(1, 'L\'unité est requise')
  }))
})

export async function POST(req: NextRequest) {
  try {
    const recipeData = await validateRequest(req, saveRecipeSchema)
    console.log('💾 Sauvegarde de recette:', recipeData)

    // Vérifier si la recette existe déjà (similitude > 85%)
    const existingRecipes = await prisma.recipe.findMany({
      where: {
        name: {
          contains: recipeData.name,
          mode: 'insensitive'
        }
      }
    })

    if (existingRecipes.length > 0) {
      return NextResponse.json(
        { error: 'Une recette similaire existe déjà dans votre collection' },
        { status: 409 }
      )
    }

    // Créer la recette avec transaction pour les ingrédients
    const savedRecipe = await prisma.$transaction(async (tx) => {
      // Créer la recette
      const recipe = await tx.recipe.create({
        data: {
          name: recipeData.name,
          prepTime: recipeData.prepTime,
          cookTime: recipeData.cookTime,
          difficulty: recipeData.difficulty as Difficulty,
          dishType: recipeData.dishType as DishType,
          instructions: recipeData.instructions,
          tips: recipeData.tips || null,
          servings: 4, // Valeur par défaut
          liked: false,
          embedding: null // Sera généré plus tard si nécessaire
        }
      })

      // Traiter chaque ingrédient
      for (const ingredientData of recipeData.ingredients) {
         // Chercher l'ingrédient existant ou le créer
         let ingredient = await tx.ingredient.findFirst({
           where: {
             name: {
               equals: ingredientData.name.toLowerCase(),
               mode: 'insensitive'
             }
           }
         })

         if (!ingredient) {
           // Assigner une catégorie automatiquement
           const categoryId = await assignCategoryToIngredient(ingredientData.name)
           
           // Créer un nouvel ingrédient avec catégorie
           ingredient = await tx.ingredient.create({
             data: {
               name: ingredientData.name.toLowerCase(),
               categoryId: categoryId,
               units: [ingredientData.unit],
               embedding: null // Sera généré plus tard si nécessaire
             }
           })
         } else {
           // Ajouter l'unité si elle n'existe pas
           if (!ingredient.units.includes(ingredientData.unit)) {
             await tx.ingredient.update({
               where: { id: ingredient.id },
               data: {
                 units: [...ingredient.units, ingredientData.unit]
               }
             })
           }
         }

         // Créer la relation recipe_ingredient
         await tx.recipeIngredient.create({
           data: {
             recipeId: recipe.id,
             ingredientId: ingredient.id,
             quantity: ingredientData.quantity,
             unit: ingredientData.unit
           }
         })
      }

      return recipe
    })

    console.log('✅ Recette sauvegardée:', savedRecipe.id)

    return NextResponse.json(
      { 
        data: savedRecipe,
        message: 'Recette sauvegardée avec succès !'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de la recette:', error)
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 