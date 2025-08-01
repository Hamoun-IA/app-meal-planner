-- =============================================================================
-- SCRIPT D'INITIALISATION POSTGRESQL - ASSISTANTE BABOUNETTE
-- =============================================================================

-- Extension pgvector pour les embeddings vectoriels
CREATE EXTENSION IF NOT EXISTS vector;

-- Extension pg_trgm pour la recherche textuelle floue
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Extension unaccent pour la recherche sans accents
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Configuration des paramètres pour les performances
ALTER SYSTEM SET shared_preload_libraries = 'vector';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Rechargement de la configuration
SELECT pg_reload_conf();

-- Création des rôles et permissions
DO $$
BEGIN
    -- Création du rôle d'application
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'babounette_app') THEN
        CREATE ROLE babounette_app WITH LOGIN PASSWORD 'babounette_app_password';
    END IF;
    
    -- Création du rôle de lecture seule pour les analytics
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'babounette_readonly') THEN
        CREATE ROLE babounette_readonly WITH LOGIN PASSWORD 'babounette_readonly_password';
    END IF;
END
$$;

-- Attribution des permissions
GRANT CONNECT ON DATABASE babounette_db TO babounette_app;
GRANT CONNECT ON DATABASE babounette_db TO babounette_readonly;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour nettoyer les anciens embeddings du cache
CREATE OR REPLACE FUNCTION cleanup_old_embeddings()
RETURNS void AS $$
BEGIN
    DELETE FROM embedding_cache 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciens messages de chat
CREATE OR REPLACE FUNCTION cleanup_old_chat_messages()
RETURNS void AS $$
BEGIN
    DELETE FROM chat_messages 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Création d'un job pour nettoyer périodiquement les données
-- (nécessite l'extension pg_cron qui doit être installée séparément)
-- SELECT cron.schedule('cleanup-embeddings', '0 2 * * *', 'SELECT cleanup_old_embeddings();');
-- SELECT cron.schedule('cleanup-chat-messages', '0 3 * * *', 'SELECT cleanup_old_chat_messages();');

-- Configuration des paramètres de recherche textuelle
ALTER TEXT SEARCH CONFIGURATION french ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part WITH unaccent, french_stem;

-- Création d'un index GIN pour la recherche textuelle française
CREATE INDEX IF NOT EXISTS recipes_search_text_idx ON recipes USING GIN (to_tsvector('french', title || ' ' || COALESCE(description, '')));

-- Configuration des statistiques pour l'optimiseur de requêtes
ALTER TABLE recipes ALTER COLUMN embedding SET STATISTICS 1000;
ALTER TABLE embedding_cache ALTER COLUMN embedding SET STATISTICS 1000;
ALTER TABLE recipe_search_index ALTER COLUMN embedding SET STATISTICS 1000;

-- Création d'une vue pour les métriques de performance
CREATE OR REPLACE VIEW database_metrics AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Création d'une vue pour les index vectoriels
CREATE OR REPLACE VIEW vector_indexes AS
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE indexname LIKE '%hnsw%' OR indexname LIKE '%vector%'
ORDER BY tablename, indexname;

-- Configuration des paramètres de sécurité
ALTER SYSTEM SET password_encryption = 'scram-sha-256';
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL';

-- Rechargement de la configuration
SELECT pg_reload_conf();

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Configuration PostgreSQL terminée avec succès!';
    RAISE NOTICE 'Extension pgvector installée et configurée.';
    RAISE NOTICE 'Index vectoriels et fonctions de recherche prêts.';
    RAISE NOTICE 'Base de données prête pour la migration des données.';
END
$$; 