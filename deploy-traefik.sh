#!/bin/bash

# Script de déploiement pour Traefik
# Remplace Nginx par Traefik pour éviter les conflits

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${DOMAIN:-"appmeal.hamoun.fun"}
DB_PASSWORD=${DB_PASSWORD:-"mealpass123"}
DEFAULT_USER_ID=${DEFAULT_USER_ID:-"00000000-0000-0000-0000-000000000000"}

echo -e "${BLUE}🚀 Déploiement Meal Planner avec Traefik${NC}"
echo -e "${YELLOW}Domaine: $DOMAIN${NC}"

# Vérifier les prérequis
check_prerequisites() {
    echo -e "${BLUE}📋 Vérification des prérequis...${NC}"
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker n'est pas installé${NC}"
        exit 1
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
        exit 1
    fi
    
    # Vérifier que Traefik est en cours d'exécution
    if ! docker network ls | grep -q "root_default"; then
        echo -e "${RED}❌ Le réseau Traefik 'root_default' n'existe pas${NC}"
        echo -e "${YELLOW}Assurez-vous que Traefik est en cours d'exécution sur votre VPS${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prérequis vérifiés${NC}"
}

# Créer le fichier .env
setup_env() {
    echo -e "${BLUE}🔧 Configuration de l'environnement...${NC}"
    
    if [ ! -f .env ]; then
        cat > .env << EOF
# Configuration de la base de données
DB_PASSWORD=$DB_PASSWORD
DATABASE_URL=postgresql://mealuser:$DB_PASSWORD@postgres:5432/mealdb

# Configuration Redis
REDIS_URL=redis://redis:6379

# Configuration OpenAI
OPENAI_API_KEY=${OPENAI_API_KEY:-"your-openai-api-key-here"}

# Configuration utilisateur
DEFAULT_USER_ID=$DEFAULT_USER_ID

# Configuration du domaine
DOMAIN=$DOMAIN

# Variables d'environnement Next.js
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
EOF
        echo -e "${GREEN}✅ Fichier .env créé${NC}"
    else
        echo -e "${YELLOW}⚠️  Fichier .env existant, mise à jour des variables...${NC}"
        # Mettre à jour les variables importantes
        sed -i "s/DOMAIN=.*/DOMAIN=$DOMAIN/" .env
        sed -i "s/NEXT_PUBLIC_APP_URL=.*/NEXT_PUBLIC_APP_URL=https:\/\/$DOMAIN/" .env
        sed -i "s/NEXT_PUBLIC_API_URL=.*/NEXT_PUBLIC_API_URL=https:\/\/$DOMAIN\/api/" .env
    fi
}

# Nettoyer les conteneurs existants
cleanup() {
    echo -e "${BLUE}🧹 Nettoyage des conteneurs existants...${NC}"
    
    # Arrêter et supprimer les conteneurs existants
    docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    docker-compose -f docker-compose.traefik.yml down --remove-orphans 2>/dev/null || true
    
    # Supprimer les images non utilisées
    docker image prune -f
    
    echo -e "${GREEN}✅ Nettoyage terminé${NC}"
}

# Construire et démarrer les services
deploy() {
    echo -e "${BLUE}🏗️  Construction et déploiement...${NC}"
    
    # Construire et démarrer avec Traefik
    docker-compose -f docker-compose.traefik.yml up -d --build
    
    echo -e "${GREEN}✅ Services déployés${NC}"
}

# Attendre que la base de données soit prête
wait_for_db() {
    echo -e "${BLUE}⏳ Attente de la base de données...${NC}"
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec meal-planner-app npx prisma db push --accept-data-loss >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Base de données prête${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Tentative $attempt/$max_attempts...${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ La base de données n'est pas accessible après $max_attempts tentatives${NC}"
    return 1
}

# Initialiser la base de données
init_database() {
    echo -e "${BLUE}🗄️  Initialisation de la base de données...${NC}"
    
    # Appliquer les migrations
    docker exec meal-planner-app npx prisma migrate deploy
    
    # Générer le client Prisma
    docker exec meal-planner-app npx prisma generate
    
    echo -e "${GREEN}✅ Base de données initialisée${NC}"
}

# Vérifier la santé de l'application
health_check() {
    echo -e "${BLUE}🏥 Vérification de la santé de l'application...${NC}"
    
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "https://$DOMAIN" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Application accessible sur https://$DOMAIN${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Tentative $attempt/$max_attempts...${NC}"
        sleep 5
        ((attempt++))
    done
    
    echo -e "${RED}❌ L'application n'est pas accessible après $max_attempts tentatives${NC}"
    echo -e "${YELLOW}Vérifiez les logs avec: docker logs meal-planner-app${NC}"
    return 1
}

# Afficher les informations de déploiement
show_info() {
    echo -e "${GREEN}🎉 Déploiement terminé avec succès !${NC}"
    echo -e "${BLUE}📋 Informations importantes:${NC}"
    echo -e "   🌐 URL: https://$DOMAIN"
    echo -e "   🐳 Conteneur: meal-planner-app"
    echo -e "   📊 Base de données: meal-planner-db-prod"
    echo -e "   🔄 Redis: meal-planner-redis-prod"
    echo ""
    echo -e "${YELLOW}📝 Commandes utiles:${NC}"
    echo -e "   Voir les logs: docker logs meal-planner-app"
    echo -e "   Redémarrer: docker-compose -f docker-compose.traefik.yml restart"
    echo -e "   Arrêter: docker-compose -f docker-compose.traefik.yml down"
    echo -e "   Mettre à jour: ./deploy-traefik.sh"
}

# Fonction principale
main() {
    check_prerequisites
    setup_env
    cleanup
    deploy
    wait_for_db
    init_database
    health_check
    show_info
}

# Exécuter le script
main "$@" 