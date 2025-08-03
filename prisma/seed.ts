import { PrismaClient, UnitType, Difficulty, DishType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Créer des ingrédients de test
  const ingredients = await Promise.all([
    prisma.ingredient.create({
      data: {
        name: 'tomate',
        category: 'Légumes',
        units: [UnitType.G, UnitType.KG, UnitType.PIECE],
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'oignon',
        category: 'Légumes',
        units: [UnitType.G, UnitType.PIECE],
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'poulet',
        category: 'Viandes',
        units: [UnitType.G, UnitType.KG, UnitType.PIECE],
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'riz',
        category: 'Céréales',
        units: [UnitType.G, UnitType.KG, UnitType.C_A_S],
      },
    }),
  ])

  console.log(`✅ Created ${ingredients.length} ingredients`)

  // Créer une recette de test
  const recipe = await prisma.recipe.create({
    data: {
      name: 'Riz au poulet',
      prepTime: 15,
      cookTime: 30,
      difficulty: Difficulty.FACILE,
      dishType: DishType.PLAT_PRINCIPAL,
      instructions: [
        'Couper le poulet en morceaux',
        'Faire revenir les oignons dans l\'huile',
        'Ajouter le poulet et faire cuire 10 minutes',
        'Ajouter le riz et l\'eau',
        'Laisser cuire 20 minutes à feu doux',
      ],
      tips: 'Assaisonner selon vos goûts',
    },
  })

  console.log(`✅ Created recipe: ${recipe.name}`)

  // Créer les relations recette-ingrédients
  await Promise.all([
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipe.id,
        ingredientId: ingredients[2].id, // poulet
        quantity: 300,
        unit: UnitType.G,
      },
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipe.id,
        ingredientId: ingredients[1].id, // oignon
        quantity: 1,
        unit: UnitType.PIECE,
      },
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipe.id,
        ingredientId: ingredients[3].id, // riz
        quantity: 200,
        unit: UnitType.G,
      },
    }),
  ])

  console.log('✅ Created recipe ingredients')

  // Créer des catégories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Fruits' },
    }),
    prisma.category.create({
      data: { name: 'Légumes' },
    }),
    prisma.category.create({
      data: { name: 'Viandes' },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 