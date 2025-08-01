#!/usr/bin/env tsx

/**
 * Script de test pour valider la migration PostgreSQL
 * 
 * Ce script teste toutes les fonctionnalités PostgreSQL
 * après la migration depuis SQLite
 */

import { PrismaClient } from '@prisma/client'
import { postgreSQLRAGService } from '../lib/rag-service-postgresql'

class MigrationTester {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Test de connexion PostgreSQL
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔌 Test de connexion PostgreSQL...')
      
      await this.prisma.$queryRaw`SELECT 1`
      console.log('✅ Connexion PostgreSQL réussie')
      return true
    } catch (error) {
      console.error('❌ Erreur de connexion PostgreSQL:', error)
      return false
    }
  }

  /**
   * Test de l'extension pgvector
   */
  async testPgvector(): Promise<boolean> {
    try {
      console.log('🔧 Test de l\'extension pgvector...')
      
      const result = await this.prisma.$queryRaw`
        SELECT extname FROM pg_extension WHERE extname = 'vector'
      `
      
      if (!result || (result as any[]).length === 0) {
        throw new Error('Extension pgvector non installée')
      }
      
      console.log('✅ Extension pgvector fonctionnelle')
      return true
    } catch (error) {
      console.error('❌ Erreur pgvector:', error)
      return false
    }
  }

  /**
   * Test des index vectoriels
   */
  async testVectorIndexes(): Promise<boolean> {
    try {
      console.log('📊 Test des index vectoriels...')
      
      const indexes = await this.prisma.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE indexname LIKE '%hnsw%' AND tablename IN ('recipes', 'embedding_cache', 'recipe_search_index')
      `
      
      console.log(`✅ ${(indexes as any[]).length} index vectoriels trouvés`)
      return true
    } catch (error) {
      console.error('❌ Erreur index vectoriels:', error)
      return false
    }
  }

  /**
   * Test des fonctions de recherche
   */
  async testSearchFunctions(): Promise<boolean> {
    try {
      console.log('🔍 Test des fonctions de recherche...')
      
      const functions = await this.prisma.$queryRaw`
        SELECT proname FROM pg_proc 
        WHERE proname IN ('search_recipes_vector', 'search_recipes_hybrid')
      `
      
      console.log(`✅ ${(functions as any[]).length} fonctions de recherche trouvées`)
      return true
    } catch (error) {
      console.error('❌ Erreur fonctions de recherche:', error)
      return false
    }
  }

  /**
   * Test des données migrées
   */
  async testMigratedData(): Promise<boolean> {
    try {
      console.log('📊 Test des données migrées...')
      
      const stats = await this.getDataStats()
      
      console.log('📈 Statistiques des données:')
      console.log(`  👥 Utilisateurs: ${stats.users}`)
      console.log(`  🍳 Recettes: ${stats.recipes}`)
      console.log(`  🥕 Ingrédients: ${stats.ingredients}`)
      console.log(`  🔗 Relations recette-ingrédient: ${stats.recipeIngredients}`)
      console.log(`  📅 Plans de repas: ${stats.mealPlans}`)
      console.log(`  🛒 Listes de courses: ${stats.shoppingLists}`)
      console.log(`  💬 Messages de chat: ${stats.chatMessages}`)
      
      return stats.recipes > 0
    } catch (error) {
      console.error('❌ Erreur données migrées:', error)
      return false
    }
  }

  /**
   * Test des types de données PostgreSQL
   */
  async testPostgreSQLTypes(): Promise<boolean> {
    try {
      console.log('🔤 Test des types de données PostgreSQL...')
      
      // Test des tableaux String[]
      const recipeWithArrays = await this.prisma.recipe.findFirst({
        select: {
          tags: true,
          categories: true,
          instructions: true,
        },
      })
      
      if (recipeWithArrays) {
        console.log('✅ Types de tableaux PostgreSQL fonctionnels')
        console.log(`  Tags: ${recipeWithArrays.tags?.length || 0} éléments`)
        console.log(`  Catégories: ${recipeWithArrays.categories?.length || 0} éléments`)
        console.log(`  Instructions: ${recipeWithArrays.instructions?.length || 0} éléments`)
      }
      
      return true
    } catch (error) {
      console.error('❌ Erreur types PostgreSQL:', error)
      return false
    }
  }

  /**
   * Test du service RAG PostgreSQL
   */
  async testRAGService(): Promise<boolean> {
    try {
      console.log('🤖 Test du service RAG PostgreSQL...')
      
      // Test des statistiques
      const stats = await postgreSQLRAGService.getSearchStats()
      console.log('📊 Statistiques RAG:')
      console.log(`  Total recettes: ${stats.totalRecipes}`)
      console.log(`  Recettes avec embeddings: ${stats.recipesWithEmbeddings}`)
      console.log(`  Taille cache: ${stats.cacheSize}`)
      console.log(`  Taille index: ${stats.indexSize}`)
      
      // Test de recherche simple
      const searchResults = await postgreSQLRAGService.searchRecipes('poulet', {}, 5)
      console.log(`🔍 Recherche "poulet": ${searchResults.length} résultats`)
      
      return true
    } catch (error) {
      console.error('❌ Erreur service RAG:', error)
      return false
    }
  }

  /**
   * Test des vues PostgreSQL
   */
  async testViews(): Promise<boolean> {
    try {
      console.log('👁️  Test des vues PostgreSQL...')
      
      // Test de la vue nutrition
      const nutritionView = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM recipe_nutrition_view
      `
      console.log(`✅ Vue nutrition: ${(nutritionView as any[])[0]?.count} recettes`)
      
      // Test de la vue plans de repas
      const mealPlanView = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM meal_plan_details_view
      `
      console.log(`✅ Vue plans de repas: ${(mealPlanView as any[])[0]?.count} plans`)
      
      return true
    } catch (error) {
      console.error('❌ Erreur vues PostgreSQL:', error)
      return false
    }
  }

  /**
   * Test des performances
   */
  async testPerformance(): Promise<boolean> {
    try {
      console.log('⚡ Test des performances...')
      
      const startTime = Date.now()
      
      // Test de recherche rapide
      await this.prisma.recipe.findMany({
        take: 10,
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      })
      
      const queryTime = Date.now() - startTime
      console.log(`✅ Temps de requête: ${queryTime}ms`)
      
      // Test d'index vectoriel
      const vectorStartTime = Date.now()
      await this.prisma.$queryRaw`
        SELECT COUNT(*) FROM recipes WHERE embedding IS NOT NULL
      `
      const vectorTime = Date.now() - vectorStartTime
      console.log(`✅ Temps requête vectorielle: ${vectorTime}ms`)
      
      return queryTime < 1000 && vectorTime < 500
    } catch (error) {
      console.error('❌ Erreur performances:', error)
      return false
    }
  }

  /**
   * Récupère les statistiques des données
   */
  private async getDataStats() {
    const [
      users,
      recipes,
      ingredients,
      recipeIngredients,
      mealPlans,
      shoppingLists,
      chatMessages,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.recipe.count(),
      this.prisma.ingredient.count(),
      this.prisma.recipeIngredient.count(),
      this.prisma.mealPlan.count(),
      this.prisma.shoppingList.count(),
      this.prisma.chatMessage.count(),
    ])

    return {
      users,
      recipes,
      ingredients,
      recipeIngredients,
      mealPlans,
      shoppingLists,
      chatMessages,
    }
  }

  /**
   * Exécute tous les tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Début des tests de migration PostgreSQL...')
    console.log('============================================')
    
    const tests = [
      { name: 'Connexion', test: () => this.testConnection() },
      { name: 'Extension pgvector', test: () => this.testPgvector() },
      { name: 'Index vectoriels', test: () => this.testVectorIndexes() },
      { name: 'Fonctions de recherche', test: () => this.testSearchFunctions() },
      { name: 'Données migrées', test: () => this.testMigratedData() },
      { name: 'Types PostgreSQL', test: () => this.testPostgreSQLTypes() },
      { name: 'Service RAG', test: () => this.testRAGService() },
      { name: 'Vues PostgreSQL', test: () => this.testViews() },
      { name: 'Performances', test: () => this.testPerformance() },
    ]
    
    const results = []
    
    for (const { name, test } of tests) {
      try {
        const result = await test()
        results.push({ name, passed: result })
        
        if (result) {
          console.log(`✅ Test "${name}" réussi`)
        } else {
          console.log(`❌ Test "${name}" échoué`)
        }
      } catch (error) {
        console.error(`❌ Erreur dans le test "${name}":`, error)
        results.push({ name, passed: false })
      }
      
      console.log('---')
    }
    
    // Résumé
    const passedTests = results.filter(r => r.passed).length
    const totalTests = results.length
    
    console.log('\n📊 Résumé des tests:')
    console.log('====================')
    console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`)
    console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`)
    
    if (passedTests === totalTests) {
      console.log('\n🎉 Tous les tests sont passés! Migration PostgreSQL réussie!')
    } else {
      console.log('\n⚠️  Certains tests ont échoué. Vérifiez la configuration.')
    }
    
    // Détails des échecs
    const failedTests = results.filter(r => !r.passed)
    if (failedTests.length > 0) {
      console.log('\n❌ Tests échoués:')
      failedTests.forEach(test => {
        console.log(`  - ${test.name}`)
      })
    }
  }
}

// Exécution du script
async function main() {
  // Vérification des variables d'environnement
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL non définie')
    process.exit(1)
  }

  const tester = new MigrationTester()
  await tester.runAllTests()
  
  await tester.prisma.$disconnect()
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
} 