// =============================================================================
// SCRIPT POUR RÉCUPÉRER L'ID UTILISATEUR - ASSISTANTE BABOUNETTE
// =============================================================================

import { prisma } from '../lib/prisma';

async function getUserId() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@babounette.com' },
    });

    if (!user) {
      console.log('❌ Utilisateur test@babounette.com non trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé:');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Nom: ${user.name}`);

    // Vérifier les recettes de l'utilisateur
    const recipes = await prisma.recipe.findMany({
      where: { userId: user.id },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    console.log(`\n📊 Recettes trouvées: ${recipes.length}`);
    recipes.forEach(recipe => {
      console.log(`- ${recipe.title} (${recipe.ingredients.length} ingrédients)`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  getUserId()
    .then(() => {
      console.log('\n✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
} 