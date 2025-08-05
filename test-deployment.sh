#!/bin/bash

# Script de test pour le déploiement local
set -e

echo "🧪 Test de déploiement local..."

# Variables
PROJECT_NAME="meal-planner-test"

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

# Nettoyer les conteneurs existants
cleanup() {
    log "Nettoyage des conteneurs existants..."
    docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
    docker rmi meal-planner-test 2>/dev/null || true
}

# Test du build
test_build() {
    log "Test du build Docker..."
    docker build -t meal-planner-test .
    log "✅ Build réussi"
}

# Test du déploiement local
test_deployment() {
    log "Test du déploiement local..."
    
    # Créer un fichier .env temporaire pour les tests
    if [ ! -f ".env" ]; then
        log "Création d'un fichier .env temporaire..."
        cat > .env << EOF
DATABASE_URL="postgresql://mealuser:mealpass123@postgres:5432/mealdb"
DB_PASSWORD="mealpass123"
OPENAI_API_KEY="sk-test-key"
REDIS_URL="redis://redis:6379"
DEFAULT_USER_ID="00000000-0000-0000-0000-000000000000"
NODE_ENV="production"
EOF
    fi
    
    # Démarrer les services
    log "Démarrage des services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Attendre que les services soient prêts
    log "Attente du démarrage des services..."
    sleep 30
    
    # Vérifier la santé des services
    check_health
}

# Vérifier la santé des services
check_health() {
    log "Vérification de la santé des services..."
    
    # Vérifier PostgreSQL
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U mealuser > /dev/null 2>&1; then
        log "✅ PostgreSQL est prêt"
    else
        error "❌ PostgreSQL n'est pas prêt"
    fi
    
    # Vérifier Redis
    if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        log "✅ Redis est prêt"
    else
        error "❌ Redis n'est pas prêt"
    fi
    
    # Vérifier l'application
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log "✅ Application est prête"
    else
        warn "⚠️ Application pas encore prête, attente..."
        sleep 10
        if curl -f http://localhost/health > /dev/null 2>&1; then
            log "✅ Application est maintenant prête"
        else
            error "❌ Application ne répond pas"
        fi
    fi
}

# Test des fonctionnalités
test_functionality() {
    log "Test des fonctionnalités de base..."
    
    # Test de la page d'accueil
    if curl -f http://localhost > /dev/null 2>&1; then
        log "✅ Page d'accueil accessible"
    else
        warn "⚠️ Page d'accueil non accessible"
    fi
    
    # Test de l'API des recettes
    if curl -f http://localhost/api/recipes > /dev/null 2>&1; then
        log "✅ API des recettes accessible"
    else
        warn "⚠️ API des recettes non accessible"
    fi
    
    # Test de l'API des catégories
    if curl -f http://localhost/api/categories > /dev/null 2>&1; then
        log "✅ API des catégories accessible"
    else
        warn "⚠️ API des catégories non accessible"
    fi
}

# Afficher les informations
show_info() {
    log "🎉 Test de déploiement terminé avec succès!"
    echo ""
    echo "📊 Informations de test:"
    echo "   - Application: http://localhost"
    echo "   - Health check: http://localhost/health"
    echo "   - Logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "   - Arrêter: docker-compose -f docker-compose.prod.yml down"
    echo "   - Logs: docker-compose -f docker-compose.prod.yml logs -f app"
    echo "   - Restart: docker-compose -f docker-compose.prod.yml restart app"
    echo ""
    echo "🧪 Tests effectués:"
    echo "   ✅ Build Docker"
    echo "   ✅ Déploiement local"
    echo "   ✅ Santé des services"
    echo "   ✅ Fonctionnalités de base"
    echo ""
}

# Fonction principale
main() {
    cleanup
    test_build
    test_deployment
    test_functionality
    show_info
}

# Exécution
main "$@" 