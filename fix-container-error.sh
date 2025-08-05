#!/bin/bash

# Script pour résoudre l'erreur ContainerConfig
# Nettoie complètement et redéploie

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Résolution de l'erreur ContainerConfig${NC}"

# Nettoyage complet
cleanup() {
    echo -e "${BLUE}🧹 Nettoyage complet...${NC}"
    
    # Arrêter tous les conteneurs
    docker-compose -f docker-compose.traefik.yml down
    
    # Supprimer le conteneur problématique
    docker rm -f meal-planner-app 2>/dev/null || true
    
    # Nettoyer les images non utilisées
    docker image prune -f
    
    # Nettoyer les volumes non utilisés
    docker volume prune -f
    
    echo -e "${GREEN}✅ Nettoyage terminé${NC}"
}

# Redéploiement complet
redeploy() {
    echo -e "${BLUE}🏗️  Redéploiement complet...${NC}"
    
    # Reconstruire et démarrer
    docker-compose -f docker-compose.traefik.yml up -d --build
    
    echo -e "${GREEN}✅ Redéploiement terminé${NC}"
}

# Attendre que les services soient prêts
wait_for_services() {
    echo -e "${BLUE}⏳ Attente des services...${NC}"
    
    # Attendre PostgreSQL
    echo -e "${YELLOW}📊 Attente PostgreSQL...${NC}"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec meal-planner-db-prod pg_isready -U mealuser >/dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL prêt${NC}"
            break
        fi
        
        echo -e "${YELLOW}⏳ Tentative $attempt/$max_attempts...${NC}"
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}❌ PostgreSQL non prêt après $max_attempts tentatives${NC}"
    fi
    
    # Attendre Redis
    echo -e "${YELLOW}🔄 Attente Redis...${NC}"
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec meal-planner-redis-prod redis-cli ping >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Redis prêt${NC}"
            break
        fi
        
        echo -e "${YELLOW}⏳ Tentative $attempt/$max_attempts...${NC}"
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}❌ Redis non prêt après $max_attempts tentatives${NC}"
    fi
    
    # Attendre l'application
    echo -e "${YELLOW}🌐 Attente application...${NC}"
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec meal-planner-app curl -f -s http://localhost:3001 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Application prête${NC}"
            break
        fi
        
        echo -e "${YELLOW}⏳ Tentative $attempt/$max_attempts...${NC}"
        sleep 3
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}❌ Application non prête après $max_attempts tentatives${NC}"
    fi
}

# Test de l'application
test_application() {
    echo -e "${BLUE}🧪 Test de l'application...${NC}"
    
    # Test HTTP
    if curl -f -s http://appmeal.hamoun.fun >/dev/null 2>&1; then
        echo -e "${GREEN}✅ HTTP OK${NC}"
    else
        echo -e "${RED}❌ HTTP échoué${NC}"
    fi
    
    # Test HTTPS
    if curl -f -s -k https://appmeal.hamoun.fun >/dev/null 2>&1; then
        echo -e "${GREEN}✅ HTTPS OK${NC}"
    else
        echo -e "${RED}❌ HTTPS échoué${NC}"
    fi
}

# Vérifier l'état final
check_final_state() {
    echo -e "${BLUE}📋 État final:${NC}"
    
    echo -e "${YELLOW}🐳 Conteneurs en cours d'exécution:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo -e "${YELLOW}🌐 Réseaux:${NC}"
    docker network ls | grep root_default
}

# Fonction principale
main() {
    cleanup
    redeploy
    wait_for_services
    test_application
    check_final_state
    
    echo -e "${GREEN}🎉 Résolution terminée !${NC}"
    echo -e "${YELLOW}📝 Pour un diagnostic complet: ./debug-network.sh${NC}"
}

# Exécuter le script
main "$@" 