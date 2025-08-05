#!/bin/bash

# Script d'initialisation de la base de données
set -e

echo "🗄️ Initialisation de la base de données..."

# Variables
PROJECT_NAME="meal-planner"

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Fonction de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Attendre que PostgreSQL soit prêt
wait_for_postgres() {
    log "Attente de PostgreSQL..."
    until docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U mealuser > /dev/null 2>&1; do
        sleep 2
    done
    log "✅ PostgreSQL est prêt"
}

# Appliquer les migrations
apply_migrations() {
    log "Application des migrations Prisma..."
    
    # Générer le client Prisma
    docker-compose -f docker-compose.prod.yml exec -T app npx prisma generate
    
    # Appliquer les migrations
    docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy
    
    log "✅ Migrations appliquées"
}

# Vérifier si la base de données est vide
check_database() {
    log "Vérification de la base de données..."
    
    # Compter le nombre de tables
    table_count=$(docker-compose -f docker-compose.prod.yml exec -T postgres psql -U mealuser -d mealdb -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    if [ "$table_count" -eq "0" ]; then
        log "Base de données vide, initialisation..."
        return 0
    else
        log "Base de données contient $table_count tables"
        return 1
    fi
}

# Initialiser avec des données de base
seed_database() {
    log "Ajout de données de base..."
    
    # Créer quelques catégories de base
    docker-compose -f docker-compose.prod.yml exec -T postgres psql -U mealuser -d mealdb -c "
    INSERT INTO categories (id, name, \"linkedItemType\") VALUES 
    (gen_random_uuid(), 'Légumes', 'INGREDIENT'),
    (gen_random_uuid(), 'Viandes', 'INGREDIENT'),
    (gen_random_uuid(), 'Poissons', 'INGREDIENT'),
    (gen_random_uuid(), 'Fruits', 'INGREDIENT'),
    (gen_random_uuid(), 'Épices', 'INGREDIENT'),
    (gen_random_uuid(), 'Produits laitiers', 'INGREDIENT')
    ON CONFLICT (name) DO NOTHING;
    "
    
    log "✅ Données de base ajoutées"
}

# Fonction principale
main() {
    wait_for_postgres
    apply_migrations
    
    if check_database; then
        seed_database
    fi
    
    log "🎉 Initialisation de la base de données terminée!"
}

# Exécution
main "$@" 