#!/usr/bin/env tsx

/**
 * Script de migration SQLite vers PostgreSQL
 * 
 * Ce script migre toutes les données de SQLite vers PostgreSQL
 * en gérant les conversions de types (JSON vers String[], etc.)
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// Configuration
const SQLITE_DB_PATH = path.join(__dirname, '../prisma/dev.db')
const BACKUP_PATH = path.join(__dirname, '../prisma/sqlite_backup.db')

interface MigrationStats {
  users: number
  recipes: number
  ingredients: number
  recipeIngredients: number
  mealPlans: number
  mealPlanRecipes: number
  shoppingLists: number
  shoppingListItems: number
  favoriteRecipes: number
  chatMessages: number
  userPreferences: number
}

class DatabaseMigrator {
  private sqliteClient: PrismaClient
  private postgresClient: PrismaClient
  private stats: MigrationStats = {
    users: 0,
    recipes: 0,
    ingredients: 0,
    recipeIngredients: 0,
    mealPlans: 0,
    mealPlanRecipes: 0,
    shoppingLists: 0,
    shoppingListItems: 0,
    favoriteRecipes: 0,
    chatMessages: 0,
    userPreferences: 0
  }

  constructor() {
    // Client SQLite (source)
    this.sqliteClient = new PrismaClient({
      datasources: {
        db: {
          url: `file:${SQLITE_DB_PATH}`
        }
      }
    })

    // Client PostgreSQL (destination)
    this.postgresClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  }

  /**
   * Sauvegarde la base SQLite avant migration
   */
  private async backupSQLite(): Promise<void> {
    console.log('📦 Sauvegarde de la base SQLite...')
    
    if (fs.existsSync(SQLITE_DB_PATH)) {
      fs.copyFileSync(SQLITE_DB_PATH, BACKUP_PATH)
      console.log('✅ Sauvegarde créée:', BACKUP_PATH)
    } else {
      console.log('⚠️  Base SQLite non trouvée, pas de sauvegarde nécessaire')
    }
  }

  /**
   * Convertit un JSON en String[] pour PostgreSQL
   */
  private parseJsonArray(json: any): string[] {
    if (!json) return []
    if (Array.isArray(json)) return json
    if (typeof json === 'string') {
      try {
        const parsed = JSON.parse(json)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  /**
   * Migre les utilisateurs
   */
  private async migrateUsers(): Promise<void> {
    console.log('👥 Migration des utilisateurs...')
    
    const users = await this.sqliteClient.user.findMany()
    
    for (const user of users) {
      await this.postgresClient.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    }
    
    this.stats.users = users.length
    console.log(`✅ ${users.length} utilisateurs migrés`)
  }

  /**
   * Migre les préférences utilisateur
   */
  private async migrateUserPreferences(): Promise<void> {
    console.log('⚙️  Migration des préférences utilisateur...')
    
    const preferences = await this.sqliteClient.userPreferences.findMany()
    
    for (const pref of preferences) {
      await this.postgresClient.userPreferences.upsert({
        where: { id: pref.id },
        update: {
          userId: pref.userId,
          dietaryRestrictions: this.parseJsonArray(pref.dietaryRestrictions),
          allergies: this.parseJsonArray(pref.allergies),
          cuisinePreferences: this.parseJsonArray(pref.cuisinePreferences),
          calorieTarget: pref.calorieTarget,
          proteinTarget: pref.proteinTarget,
          carbTarget: pref.carbTarget,
          fatTarget: pref.fatTarget,
          cookingTime: pref.cookingTime,
          difficultyLevel: pref.difficultyLevel,
          servingsPerMeal: pref.servingsPerMeal,
          budgetPerMeal: pref.budgetPerMeal,
          createdAt: pref.createdAt,
          updatedAt: pref.updatedAt
        },
        create: {
          id: pref.id,
          userId: pref.userId,
          dietaryRestrictions: this.parseJsonArray(pref.dietaryRestrictions),
          allergies: this.parseJsonArray(pref.allergies),
          cuisinePreferences: this.parseJsonArray(pref.cuisinePreferences),
          calorieTarget: pref.calorieTarget,
          proteinTarget: pref.proteinTarget,
          carbTarget: pref.carbTarget,
          fatTarget: pref.fatTarget,
          cookingTime: pref.cookingTime,
          difficultyLevel: pref.difficultyLevel,
          servingsPerMeal: pref.servingsPerMeal,
          budgetPerMeal: pref.budgetPerMeal,
          createdAt: pref.createdAt,
          updatedAt: pref.updatedAt
        }
      })
    }
    
    this.stats.userPreferences = preferences.length
    console.log(`✅ ${preferences.length} préférences migrées`)
  }

  /**
   * Migre les ingrédients
   */
  private async migrateIngredients(): Promise<void> {
    console.log('🥕 Migration des ingrédients...')
    
    const ingredients = await this.sqliteClient.ingredient.findMany()
    
    for (const ingredient of ingredients) {
      await this.postgresClient.ingredient.upsert({
        where: { id: ingredient.id },
        update: {
          name: ingredient.name,
          description: ingredient.description,
          calories: ingredient.calories,
          protein: ingredient.protein,
          carbs: ingredient.carbs,
          fat: ingredient.fat,
          fiber: ingredient.fiber,
          sugar: ingredient.sugar,
          sodium: ingredient.sodium,
          category: ingredient.category,
          allergens: this.parseJsonArray(ingredient.allergens),
          createdAt: ingredient.createdAt,
          updatedAt: ingredient.updatedAt
        },
        create: {
          id: ingredient.id,
          name: ingredient.name,
          description: ingredient.description,
          calories: ingredient.calories,
          protein: ingredient.protein,
          carbs: ingredient.carbs,
          fat: ingredient.fat,
          fiber: ingredient.fiber,
          sugar: ingredient.sugar,
          sodium: ingredient.sodium,
          category: ingredient.category,
          allergens: this.parseJsonArray(ingredient.allergens),
          createdAt: ingredient.createdAt,
          updatedAt: ingredient.updatedAt
        }
      })
    }
    
    this.stats.ingredients = ingredients.length
    console.log(`✅ ${ingredients.length} ingrédients migrés`)
  }

  /**
   * Migre les recettes
   */
  private async migrateRecipes(): Promise<void> {
    console.log('🍳 Migration des recettes...')
    
    const recipes = await this.sqliteClient.recipe.findMany()
    
    for (const recipe of recipes) {
      await this.postgresClient.recipe.upsert({
        where: { id: recipe.id },
        update: {
          title: recipe.title,
          description: recipe.description,
          instructions: this.parseJsonArray(recipe.instructions),
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          cuisine: recipe.cuisine,
          imageUrl: recipe.imageUrl,
          thumbnailUrl: recipe.thumbnailUrl,
          tags: this.parseJsonArray(recipe.tags),
          categories: this.parseJsonArray(recipe.categories),
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          fiber: recipe.fiber,
          sugar: recipe.sugar,
          sodium: recipe.sodium,
          userId: recipe.userId,
          createdAt: recipe.createdAt,
          updatedAt: recipe.updatedAt
        },
        create: {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          instructions: this.parseJsonArray(recipe.instructions),
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          cuisine: recipe.cuisine,
          imageUrl: recipe.imageUrl,
          thumbnailUrl: recipe.thumbnailUrl,
          tags: this.parseJsonArray(recipe.tags),
          categories: this.parseJsonArray(recipe.categories),
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          fiber: recipe.fiber,
          sugar: recipe.sugar,
          sodium: recipe.sodium,
          userId: recipe.userId,
          createdAt: recipe.createdAt,
          updatedAt: recipe.updatedAt
        }
      })
    }
    
    this.stats.recipes = recipes.length
    console.log(`✅ ${recipes.length} recettes migrées`)
  }

  /**
   * Migre les relations recette-ingrédient
   */
  private async migrateRecipeIngredients(): Promise<void> {
    console.log('🔗 Migration des relations recette-ingrédient...')
    
    const recipeIngredients = await this.sqliteClient.recipeIngredient.findMany()
    
    for (const ri of recipeIngredients) {
      await this.postgresClient.recipeIngredient.upsert({
        where: { id: ri.id },
        update: {
          recipeId: ri.recipeId,
          ingredientId: ri.ingredientId,
          quantity: ri.quantity,
          unit: ri.unit,
          notes: ri.notes
        },
        create: {
          id: ri.id,
          recipeId: ri.recipeId,
          ingredientId: ri.ingredientId,
          quantity: ri.quantity,
          unit: ri.unit,
          notes: ri.notes
        }
      })
    }
    
    this.stats.recipeIngredients = recipeIngredients.length
    console.log(`✅ ${recipeIngredients.length} relations recette-ingrédient migrées`)
  }

  /**
   * Migre les plans de repas
   */
  private async migrateMealPlans(): Promise<void> {
    console.log('📅 Migration des plans de repas...')
    
    const mealPlans = await this.sqliteClient.mealPlan.findMany()
    
    for (const mealPlan of mealPlans) {
      await this.postgresClient.mealPlan.upsert({
        where: { id: mealPlan.id },
        update: {
          userId: mealPlan.userId,
          startDate: mealPlan.startDate,
          endDate: mealPlan.endDate,
          name: mealPlan.name,
          description: mealPlan.description,
          totalCalories: mealPlan.totalCalories,
          totalCost: mealPlan.totalCost,
          createdAt: mealPlan.createdAt,
          updatedAt: mealPlan.updatedAt
        },
        create: {
          id: mealPlan.id,
          userId: mealPlan.userId,
          startDate: mealPlan.startDate,
          endDate: mealPlan.endDate,
          name: mealPlan.name,
          description: mealPlan.description,
          totalCalories: mealPlan.totalCalories,
          totalCost: mealPlan.totalCost,
          createdAt: mealPlan.createdAt,
          updatedAt: mealPlan.updatedAt
        }
      })
    }
    
    this.stats.mealPlans = mealPlans.length
    console.log(`✅ ${mealPlans.length} plans de repas migrés`)
  }

  /**
   * Migre les relations plan de repas-recette
   */
  private async migrateMealPlanRecipes(): Promise<void> {
    console.log('🍽️  Migration des relations plan de repas-recette...')
    
    const mealPlanRecipes = await this.sqliteClient.mealPlanRecipe.findMany()
    
    for (const mpr of mealPlanRecipes) {
      await this.postgresClient.mealPlanRecipe.upsert({
        where: { id: mpr.id },
        update: {
          mealPlanId: mpr.mealPlanId,
          recipeId: mpr.recipeId,
          dayOfWeek: mpr.dayOfWeek,
          mealType: mpr.mealType,
          servings: mpr.servings
        },
        create: {
          id: mpr.id,
          mealPlanId: mpr.mealPlanId,
          recipeId: mpr.recipeId,
          dayOfWeek: mpr.dayOfWeek,
          mealType: mpr.mealType,
          servings: mpr.servings
        }
      })
    }
    
    this.stats.mealPlanRecipes = mealPlanRecipes.length
    console.log(`✅ ${mealPlanRecipes.length} relations plan de repas-recette migrées`)
  }

  /**
   * Migre les listes de courses
   */
  private async migrateShoppingLists(): Promise<void> {
    console.log('🛒 Migration des listes de courses...')
    
    const shoppingLists = await this.sqliteClient.shoppingList.findMany()
    
    for (const list of shoppingLists) {
      await this.postgresClient.shoppingList.upsert({
        where: { id: list.id },
        update: {
          userId: list.userId,
          name: list.name,
          description: list.description,
          isCompleted: list.isCompleted,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt
        },
        create: {
          id: list.id,
          userId: list.userId,
          name: list.name,
          description: list.description,
          isCompleted: list.isCompleted,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt
        }
      })
    }
    
    this.stats.shoppingLists = shoppingLists.length
    console.log(`✅ ${shoppingLists.length} listes de courses migrées`)
  }

  /**
   * Migre les éléments de liste de courses
   */
  private async migrateShoppingListItems(): Promise<void> {
    console.log('📝 Migration des éléments de liste de courses...')
    
    const items = await this.sqliteClient.shoppingListItem.findMany()
    
    for (const item of items) {
      await this.postgresClient.shoppingListItem.upsert({
        where: { id: item.id },
        update: {
          shoppingListId: item.shoppingListId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          isCompleted: item.isCompleted,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        },
        create: {
          id: item.id,
          shoppingListId: item.shoppingListId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          isCompleted: item.isCompleted,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }
      })
    }
    
    this.stats.shoppingListItems = items.length
    console.log(`✅ ${items.length} éléments de liste de courses migrés`)
  }

  /**
   * Migre les recettes favorites
   */
  private async migrateFavoriteRecipes(): Promise<void> {
    console.log('❤️  Migration des recettes favorites...')
    
    const favorites = await this.sqliteClient.favoriteRecipe.findMany()
    
    for (const favorite of favorites) {
      await this.postgresClient.favoriteRecipe.upsert({
        where: { id: favorite.id },
        update: {
          userId: favorite.userId,
          recipeId: favorite.recipeId,
          createdAt: favorite.createdAt
        },
        create: {
          id: favorite.id,
          userId: favorite.userId,
          recipeId: favorite.recipeId,
          createdAt: favorite.createdAt
        }
      })
    }
    
    this.stats.favoriteRecipes = favorites.length
    console.log(`✅ ${favorites.length} recettes favorites migrées`)
  }

  /**
   * Migre l'historique des conversations
   */
  private async migrateChatMessages(): Promise<void> {
    console.log('💬 Migration de l\'historique des conversations...')
    
    const messages = await this.sqliteClient.chatMessage.findMany()
    
    for (const message of messages) {
      await this.postgresClient.chatMessage.upsert({
        where: { id: message.id },
        update: {
          userId: message.userId,
          content: message.content,
          role: message.role,
          agentType: message.agentType,
          tokens: message.tokens,
          model: message.model,
          sessionId: message.sessionId,
          context: message.context,
          createdAt: message.createdAt
        },
        create: {
          id: message.id,
          userId: message.userId,
          content: message.content,
          role: message.role,
          agentType: message.agentType,
          tokens: message.tokens,
          model: message.model,
          sessionId: message.sessionId,
          context: message.context,
          createdAt: message.createdAt
        }
      })
    }
    
    this.stats.chatMessages = messages.length
    console.log(`✅ ${messages.length} messages migrés`)
  }

  /**
   * Affiche les statistiques de migration
   */
  private displayStats(): void {
    console.log('\n📊 Statistiques de migration:')
    console.log('==============================')
    console.log(`👥 Utilisateurs: ${this.stats.users}`)
    console.log(`⚙️  Préférences: ${this.stats.userPreferences}`)
    console.log(`🥕 Ingrédients: ${this.stats.ingredients}`)
    console.log(`🍳 Recettes: ${this.stats.recipes}`)
    console.log(`🔗 Relations recette-ingrédient: ${this.stats.recipeIngredients}`)
    console.log(`📅 Plans de repas: ${this.stats.mealPlans}`)
    console.log(`🍽️  Relations plan-recette: ${this.stats.mealPlanRecipes}`)
    console.log(`🛒 Listes de courses: ${this.stats.shoppingLists}`)
    console.log(`📝 Éléments de liste: ${this.stats.shoppingListItems}`)
    console.log(`❤️  Recettes favorites: ${this.stats.favoriteRecipes}`)
    console.log(`💬 Messages de chat: ${this.stats.chatMessages}`)
    
    const total = Object.values(this.stats).reduce((sum, count) => sum + count, 0)
    console.log(`\n🎯 Total: ${total} enregistrements migrés`)
  }

  /**
   * Exécute la migration complète
   */
  async migrate(): Promise<void> {
    try {
      console.log('🚀 Début de la migration SQLite vers PostgreSQL...')
      console.log('================================================')
      
      // Sauvegarde
      await this.backupSQLite()
      
      // Migration des données
      await this.migrateUsers()
      await this.migrateUserPreferences()
      await this.migrateIngredients()
      await this.migrateRecipes()
      await this.migrateRecipeIngredients()
      await this.migrateMealPlans()
      await this.migrateMealPlanRecipes()
      await this.migrateShoppingLists()
      await this.migrateShoppingListItems()
      await this.migrateFavoriteRecipes()
      await this.migrateChatMessages()
      
      // Affichage des statistiques
      this.displayStats()
      
      console.log('\n✅ Migration terminée avec succès!')
      console.log('📦 Sauvegarde SQLite disponible:', BACKUP_PATH)
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error)
      throw error
    } finally {
      await this.sqliteClient.$disconnect()
      await this.postgresClient.$disconnect()
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

  const migrator = new DatabaseMigrator()
  await migrator.migrate()
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
} 