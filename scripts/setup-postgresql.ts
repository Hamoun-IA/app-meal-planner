#!/usr/bin/env tsx

/**
 * Script de configuration PostgreSQL avec pgvector
 * 
 * Ce script configure PostgreSQL et l'extension pgvector
 * pour la recherche vectorielle RAG
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

class PostgreSQLSetup {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Vérifie la connexion PostgreSQL
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      console.log('✅ Connexion PostgreSQL réussie')
      return true
    } catch (error) {
      console.error('❌ Erreur de connexion PostgreSQL:', error)
      return false
    }
  }

  /**
   * Installe l'extension pgvector
   */
  async installPgvector(): Promise<void> {
    try {
      console.log('🔧 Installation de l\'extension pgvector...')
      
      // Création de l'extension pgvector
      await this.prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`
      
      console.log('✅ Extension pgvector installée avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de l\'installation de pgvector:', error)
      throw error
    }
  }

  /**
   * Configure les index vectoriels optimisés
   */
  async setupVectorIndexes(): Promise<void> {
    try {
      console.log('📊 Configuration des index vectoriels...')
      
      // Index HNSW pour les embeddings de recettes (optimisé pour <100K recettes)
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS recipes_embedding_hnsw_idx 
        ON recipes 
        USING hnsw (embedding vector_cosine_ops) 
        WITH (m = 16, ef_construction = 64)
      `
      
      // Index HNSW pour le cache d'embeddings
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS embedding_cache_hnsw_idx 
        ON embedding_cache 
        USING hnsw (embedding vector_cosine_ops) 
        WITH (m = 16, ef_construction = 64)
      `
      
      // Index HNSW pour l'index de recherche de recettes
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS recipe_search_embedding_hnsw_idx 
        ON recipe_search_index 
        USING hnsw (embedding vector_cosine_ops) 
        WITH (m = 16, ef_construction = 64)
      `
      
      console.log('✅ Index vectoriels configurés avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la configuration des index:', error)
      throw error
    }
  }

  /**
   * Configure les index GIN pour les tableaux
   */
  async setupGinIndexes(): Promise<void> {
    try {
      console.log('🔍 Configuration des index GIN pour les tableaux...')
      
      // Index GIN pour les tags et catégories de recettes
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS recipes_tags_gin_idx 
        ON recipes USING GIN (tags)
      `
      
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS recipes_categories_gin_idx 
        ON recipes USING GIN (categories)
      `
      
      // Index GIN pour les instructions
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS recipes_instructions_gin_idx 
        ON recipes USING GIN (instructions)
      `
      
      // Index GIN pour les préférences utilisateur
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS user_preferences_dietary_gin_idx 
        ON user_preferences USING GIN ("dietaryRestrictions")
      `
      
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS user_preferences_allergies_gin_idx 
        ON user_preferences USING GIN (allergies)
      `
      
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS user_preferences_cuisine_gin_idx 
        ON user_preferences USING GIN ("cuisinePreferences")
      `
      
      // Index GIN pour les allergènes d'ingrédients
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS ingredients_allergens_gin_idx 
        ON ingredients USING GIN (allergens)
      `
      
      // Index GIN pour l'index de recherche
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS recipe_search_tags_gin_idx 
        ON recipe_search_index USING GIN (tags)
      `
      
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS recipe_search_categories_gin_idx 
        ON recipe_search_index USING GIN (categories)
      `
      
      console.log('✅ Index GIN configurés avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la configuration des index GIN:', error)
      throw error
    }
  }

  /**
   * Configure les index B-tree pour les performances
   */
  async setupBtreeIndexes(): Promise<void> {
    try {
      console.log('🌳 Configuration des index B-tree...')
      
      // Index pour les recherches textuelles
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS recipes_title_trgm_idx 
        ON recipes USING GIN (title gin_trgm_ops)
      `
      
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS recipes_description_trgm_idx 
        ON recipes USING GIN (description gin_trgm_ops)
      `
      
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS ingredients_name_trgm_idx 
        ON ingredients USING GIN (name gin_trgm_ops)
      `
      
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS ingredients_description_trgm_idx 
        ON ingredients USING GIN (description gin_trgm_ops)
      `
      
      // Index pour les dates
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS recipes_created_at_idx 
        ON recipes ("createdAt" DESC)
      `
      
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx 
        ON chat_messages ("createdAt" DESC)
      `
      
      console.log('✅ Index B-tree configurés avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la configuration des index B-tree:', error)
      throw error
    }
  }

  /**
   * Configure les contraintes et triggers
   */
  async setupConstraints(): Promise<void> {
    try {
      console.log('🔒 Configuration des contraintes...')
      
      // Trigger pour mettre à jour updatedAt automatiquement
      await this.prisma.$executeRaw`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."updatedAt" = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
      
      // Application du trigger sur toutes les tables avec updatedAt
      const tables = [
        'users', 'user_preferences', 'recipes', 'ingredients', 
        'recipe_ingredients', 'meal_plans', 'meal_plan_recipes',
        'shopping_lists', 'shopping_list_items', 'recipe_search_index'
      ]
      
      for (const table of tables) {
        await this.prisma.$executeRawUnsafe(`
          DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table}
        `)
        
        await this.prisma.$executeRawUnsafe(`
          CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
        `)
      }
      
      console.log('✅ Contraintes et triggers configurés avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la configuration des contraintes:', error)
      throw error
    }
  }

  /**
   * Configure les vues pour les requêtes complexes
   */
  async setupViews(): Promise<void> {
    try {
      console.log('👁️  Configuration des vues...')
      
      // Vue pour les recettes avec informations nutritionnelles complètes
      await this.prisma.$executeRaw`
        CREATE OR REPLACE VIEW recipe_nutrition_view AS
        SELECT 
          r.id,
          r.title,
          r.description,
          r.calories,
          r.protein,
          r.carbs,
          r.fat,
          r.fiber,
          r.sugar,
          r.sodium,
          r.difficulty,
          r.cuisine,
          r.prep_time + r.cook_time as total_time,
          r.servings,
          array_agg(DISTINCT i.name) as ingredients,
          array_agg(DISTINCT r.tags) as tags,
          array_agg(DISTINCT r.categories) as categories
        FROM recipes r
        LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        LEFT JOIN ingredients i ON ri.ingredient_id = i.id
        GROUP BY r.id, r.title, r.description, r.calories, r.protein, 
                 r.carbs, r.fat, r.fiber, r.sugar, r.sodium, r.difficulty, 
                 r.cuisine, r.prep_time, r.cook_time, r.servings, r.tags, r.categories
      `
      
      // Vue pour les plans de repas avec détails
      await this.prisma.$executeRaw`
        CREATE OR REPLACE VIEW meal_plan_details_view AS
        SELECT 
          mp.id,
          mp.name,
          mp.description,
          mp.start_date,
          mp.end_date,
          mp.total_calories,
          mp.total_cost,
          u.name as user_name,
          u.email as user_email,
          json_agg(
            json_build_object(
              'recipe_id', r.id,
              'recipe_title', r.title,
              'day_of_week', mpr.day_of_week,
              'meal_type', mpr.meal_type,
              'servings', mpr.servings,
              'calories', r.calories,
              'prep_time', r.prep_time,
              'cook_time', r.cook_time
            )
          ) as recipes
        FROM meal_plans mp
        JOIN users u ON mp.user_id = u.id
        LEFT JOIN meal_plan_recipes mpr ON mp.id = mpr.meal_plan_id
        LEFT JOIN recipes r ON mpr.recipe_id = r.id
        GROUP BY mp.id, mp.name, mp.description, mp.start_date, mp.end_date,
                 mp.total_calories, mp.total_cost, u.name, u.email
      `
      
      console.log('✅ Vues configurées avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la configuration des vues:', error)
      throw error
    }
  }

  /**
   * Configure les fonctions pour la recherche vectorielle
   */
  async setupVectorFunctions(): Promise<void> {
    try {
      console.log('🔍 Configuration des fonctions de recherche vectorielle...')
      
      // Fonction pour la recherche vectorielle de recettes
      await this.prisma.$executeRaw`
        CREATE OR REPLACE FUNCTION search_recipes_vector(
          query_embedding vector(768),
          similarity_threshold float DEFAULT 0.7,
          match_count int DEFAULT 10
        )
        RETURNS TABLE (
          id text,
          title text,
          description text,
          similarity float
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            r.id,
            r.title,
            r.description,
            1 - (r.embedding <=> query_embedding) as similarity
          FROM recipes r
          WHERE r.embedding IS NOT NULL
            AND 1 - (r.embedding <=> query_embedding) > similarity_threshold
          ORDER BY r.embedding <=> query_embedding
          LIMIT match_count;
        END;
        $$;
      `
      
      // Fonction pour la recherche hybride (vectorielle + textuelle)
      await this.prisma.$executeRaw`
        CREATE OR REPLACE FUNCTION search_recipes_hybrid(
          query_text text,
          query_embedding vector(768),
          similarity_threshold float DEFAULT 0.7,
          match_count int DEFAULT 10
        )
        RETURNS TABLE (
          id text,
          title text,
          description text,
          similarity float,
          text_rank float
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            r.id,
            r.title,
            r.description,
            1 - (r.embedding <=> query_embedding) as similarity,
            ts_rank(
              to_tsvector('french', r.title || ' ' || COALESCE(r.description, '')),
              plainto_tsquery('french', query_text)
            ) as text_rank
          FROM recipes r
          WHERE r.embedding IS NOT NULL
            AND (
              1 - (r.embedding <=> query_embedding) > similarity_threshold
              OR to_tsvector('french', r.title || ' ' || COALESCE(r.description, '')) @@ plainto_tsquery('french', query_text)
            )
          ORDER BY 
            (1 - (r.embedding <=> query_embedding) + ts_rank(
              to_tsvector('french', r.title || ' ' || COALESCE(r.description, '')),
              plainto_tsquery('french', query_text)
            )) DESC
          LIMIT match_count;
        END;
        $$;
      `
      
      console.log('✅ Fonctions de recherche vectorielle configurées avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la configuration des fonctions:', error)
      throw error
    }
  }

  /**
   * Vérifie la configuration complète
   */
  async verifySetup(): Promise<void> {
    try {
      console.log('🔍 Vérification de la configuration...')
      
      // Vérification de l'extension pgvector
      const vectorExtension = await this.prisma.$queryRaw`
        SELECT extname FROM pg_extension WHERE extname = 'vector'
      `
      
      if (!vectorExtension || (vectorExtension as any[]).length === 0) {
        throw new Error('Extension pgvector non installée')
      }
      
      console.log('✅ Extension pgvector vérifiée')
      
      // Vérification des index vectoriels
      const vectorIndexes = await this.prisma.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE indexname LIKE '%hnsw%' AND tablename IN ('recipes', 'embedding_cache', 'recipe_search_index')
      `
      
      console.log(`✅ ${(vectorIndexes as any[]).length} index vectoriels trouvés`)
      
      // Vérification des fonctions
      const functions = await this.prisma.$queryRaw`
        SELECT proname FROM pg_proc 
        WHERE proname IN ('search_recipes_vector', 'search_recipes_hybrid')
      `
      
      console.log(`✅ ${(functions as any[]).length} fonctions de recherche trouvées`)
      
      console.log('🎉 Configuration PostgreSQL complète et vérifiée!')
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error)
      throw error
    }
  }

  /**
   * Exécute la configuration complète
   */
  async setup(): Promise<void> {
    try {
      console.log('🚀 Configuration PostgreSQL avec pgvector...')
      console.log('============================================')
      
      // Vérification de la connexion
      const connected = await this.checkConnection()
      if (!connected) {
        throw new Error('Impossible de se connecter à PostgreSQL')
      }
      
      // Installation de pgvector
      await this.installPgvector()
      
      // Configuration des index
      await this.setupVectorIndexes()
      await this.setupGinIndexes()
      await this.setupBtreeIndexes()
      
      // Configuration des contraintes
      await this.setupConstraints()
      
      // Configuration des vues
      await this.setupViews()
      
      // Configuration des fonctions
      await this.setupVectorFunctions()
      
      // Vérification finale
      await this.verifySetup()
      
      console.log('\n✅ Configuration PostgreSQL terminée avec succès!')
      
    } catch (error) {
      console.error('❌ Erreur lors de la configuration:', error)
      throw error
    } finally {
      await this.prisma.$disconnect()
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

  const setup = new PostgreSQLSetup()
  await setup.setup()
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
} 