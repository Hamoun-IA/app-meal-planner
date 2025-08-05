#!/bin/bash

# Script de déploiement pour Meal Planner App
set -e

echo "🚀 Démarrage du déploiement..."

# Variables
PROJECT_NAME="meal-planner"
DOMAIN=${1:-"localhost"}

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Vérifier les prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé"
    fi
    
    if [ ! -f ".env" ]; then
        error "Fichier .env manquant. Copiez .env.example vers .env et configurez les variables."
    fi
    
    log "✅ Prérequis vérifiés"
}

# Créer les certificats SSL auto-signés pour le développement
setup_ssl() {
    log "Configuration SSL..."
    
    if [ ! -d "ssl" ]; then
        mkdir -p ssl
    fi
    
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        log "Génération de certificats SSL auto-signés..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=FR/ST=IDF/L=Paris/O=MealPlanner/CN=$DOMAIN"
    fi
    
    log "✅ SSL configuré"
}

# Build et déploiement
deploy() {
    log "Démarrage du déploiement..."
    
    # Arrêter les conteneurs existants
    log "Arrêt des conteneurs existants..."
    docker-compose -f docker-compose.prod.yml down || true
    
    # Nettoyer les images anciennes
    log "Nettoyage des images Docker..."
    docker system prune -f
    
    # Build et démarrage
    log "Build et démarrage des services..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
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

# Appliquer les migrations de base de données
setup_database() {
    log "Configuration de la base de données..."
    
    # Attendre que PostgreSQL soit prêt
    log "Attente de PostgreSQL..."
    until docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U mealuser > /dev/null 2>&1; do
        sleep 2
    done
    
    # Appliquer les migrations
    log "Application des migrations Prisma..."
    docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy
    
    # Générer le client Prisma
    log "Génération du client Prisma..."
    docker-compose -f docker-compose.prod.yml exec -T app npx prisma generate
    
    log "✅ Base de données configurée"
}

# Afficher les informations de déploiement
show_info() {
    log "🎉 Déploiement terminé avec succès!"
    echo ""
    echo "📊 Informations de déploiement:"
    echo "   - Application: http://$DOMAIN"
    echo "   - Health check: http://$DOMAIN/health"
    echo "   - Logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "   - Arrêter: docker-compose -f docker-compose.prod.yml down"
    echo "   - Logs: docker-compose -f docker-compose.prod.yml logs -f app"
    echo "   - Restart: docker-compose -f docker-compose.prod.yml restart app"
    echo ""
}

# Fonction principale
main() {
    check_prerequisites
    setup_ssl
    deploy
    setup_database
    show_info
}

# Exécution
main "$@" 