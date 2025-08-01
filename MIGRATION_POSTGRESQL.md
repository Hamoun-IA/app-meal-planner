# Guide de Migration SQLite vers PostgreSQL

## Vue d'ensemble

Ce guide vous accompagne dans la migration de SQLite vers PostgreSQL avec l'extension pgvector pour la recherche vectorielle RAG.

## Prérequis

### 1. Installation de PostgreSQL

#### Option A: Docker (Recommandé)
```bash
# Démarrer PostgreSQL avec pgvector
docker-compose -f docker-compose.postgresql.yml up -d

# Vérifier que les services sont démarrés
docker-compose -f docker-compose.postgresql.yml ps
```

#### Option B: Installation locale
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS avec Homebrew
brew install postgresql

# Windows
# Télécharger depuis https://www.postgresql.org/download/windows/
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` basé sur `env.example`:

```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer avec vos paramètres PostgreSQL
DATABASE_URL="postgresql://babounette_user:babounette_password@localhost:5432/babounette_db?schema=public"
```

## Étapes de Migration

### Étape 1: Sauvegarde SQLite

```bash
# Sauvegarde automatique
npm run db:backup-sqlite

# Ou manuellement
cp prisma/dev.db prisma/sqlite_backup_$(date +%Y%m%d_%H%M%S).db
```

### Étape 2: Configuration PostgreSQL

```bash
# Configuration automatique avec Docker
docker-compose -f docker-compose.postgresql.yml up -d

# Ou configuration manuelle
npm run db:setup-postgresql
```

### Étape 3: Migration des données

```bash
# Migration automatique
npm run db:migrate-to-postgresql
```

### Étape 4: Vérification

```bash
# Générer le client Prisma
npm run db:generate

# Vérifier la connexion
npm run db:studio
```

## Configuration Avancée

### Index Vectoriels

Les index HNSW sont configurés automatiquement pour:
- `recipes.embedding` - Embeddings des recettes
- `embedding_cache.embedding` - Cache des embeddings
- `recipe_search_index.embedding` - Index de recherche

### Fonctions de Recherche

Deux fonctions sont créées:

1. **`search_recipes_vector()`** - Recherche vectorielle pure
2. **`search_recipes_hybrid()`** - Recherche hybride (vectorielle + textuelle)

### Vues Optimisées

- `recipe_nutrition_view` - Recettes avec infos nutritionnelles
- `meal_plan_details_view` - Plans de repas détaillés
- `database_metrics` - Métriques de performance
- `vector_indexes` - Index vectoriels

## Performance et Optimisation

### Paramètres PostgreSQL

```sql
-- Vérifier les paramètres actuels
SHOW shared_buffers;
SHOW effective_cache_size;
SHOW max_connections;
```

### Monitoring

```bash
# Vérifier les performances
docker exec -it babounette_postgresql psql -U babounette_user -d babounette_db -c "SELECT * FROM database_metrics;"

# Vérifier les index vectoriels
docker exec -it babounette_postgresql psql -U babounette_user -d babounette_db -c "SELECT * FROM vector_indexes;"
```

## Dépannage

### Problèmes Courants

#### 1. Erreur de connexion PostgreSQL
```bash
# Vérifier que PostgreSQL est démarré
docker-compose -f docker-compose.postgresql.yml ps

# Vérifier les logs
docker-compose -f docker-compose.postgresql.yml logs postgresql
```

#### 2. Extension pgvector non trouvée
```bash
# Vérifier l'installation
docker exec -it babounette_postgresql psql -U babounette_user -d babounette_db -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

#### 3. Erreur de migration des données
```bash
# Vérifier la sauvegarde SQLite
ls -la prisma/sqlite_backup_*.db

# Relancer la migration
npm run db:migrate-to-postgresql
```

### Logs et Debug

```bash
# Logs PostgreSQL
docker logs babounette_postgresql

# Logs Redis
docker logs babounette_redis

# Logs pgAdmin
docker logs babounette_pgadmin
```

## Sécurité

### Rôles et Permissions

- `babounette_app` - Rôle principal de l'application
- `babounette_readonly` - Rôle de lecture seule pour les analytics

### Configuration SSL

```sql
-- Vérifier la configuration SSL
SHOW ssl;
SHOW ssl_ciphers;
```

## Maintenance

### Nettoyage Automatique

```sql
-- Nettoyer les anciens embeddings (30 jours)
SELECT cleanup_old_embeddings();

-- Nettoyer les anciens messages (90 jours)
SELECT cleanup_old_chat_messages();
```

### Sauvegarde

```bash
# Sauvegarde PostgreSQL
docker exec babounette_postgresql pg_dump -U babounette_user babounette_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
docker exec -i babounette_postgresql psql -U babounette_user babounette_db < backup_20241201_120000.sql
```

## Migration Inverse (PostgreSQL → SQLite)

Si nécessaire, vous pouvez revenir à SQLite:

```bash
# Modifier le schéma Prisma
# Changer provider de "postgresql" à "sqlite"

# Régénérer le client
npm run db:generate

# Créer une nouvelle migration
npm run db:migrate
```

## Support

### Ressources Utiles

- [Documentation pgvector](https://github.com/pgvector/pgvector)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Prisma PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

### Commandes Utiles

```bash
# Accéder à PostgreSQL
docker exec -it babounette_postgresql psql -U babounette_user -d babounette_db

# Accéder à pgAdmin
# Ouvrir http://localhost:8080
# Email: admin@babounette.app
# Mot de passe: admin_password

# Accéder à Redis
docker exec -it babounette_redis redis-cli
```

## Validation de la Migration

### Tests Automatiques

```bash
# Tester la connexion
npm run db:studio

# Tester les fonctions vectorielles
npm run test:vector-search

# Tester la migration
npm run test:migration
```

### Vérifications Manuelles

1. **Connexion PostgreSQL** ✅
2. **Extension pgvector** ✅
3. **Index vectoriels** ✅
4. **Migration des données** ✅
5. **Fonctions de recherche** ✅
6. **Performance** ✅

## Prochaines Étapes

Après la migration réussie:

1. **Phase 3** - Intégration IA Conversationnelle
2. **Phase 4** - Interface PWA avec Shadcn/UI
3. **Phase 5** - Intégration Mobile React Native
4. **Phase 6** - Tests et Qualité
5. **Phase 7** - CI/CD et Déploiement

---

**Note**: Cette migration est une étape cruciale pour la Phase 2 du roadmap. Elle permet d'activer les fonctionnalités vectorielles nécessaires pour la recherche RAG avancée. 