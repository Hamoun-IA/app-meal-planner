#!/bin/bash

# Script de redéploiement rapide avec corrections

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Redéploiement avec corrections${NC}"

# Redéployer avec les corrections
redeploy() {
    echo -e "${BLUE}🏗️  Redéploiement de l'application...${NC}"
    
    # Arrêter l'application
    docker-compose -f docker-compose.traefik.yml stop app
    
    # Redémarrer avec les nouvelles configurations
    docker-compose -f docker-compose.traefik.yml up -d app
    
    echo -e "${GREEN}✅ Redéploiement terminé${NC}"
}

# Attendre que l'application soit prête
wait_for_app() {
    echo -e "${BLUE}⏳ Attente que l'application soit prête...${NC}"
    
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec meal-planner-app curl -f -s http://localhost:3001 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Application prête${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Tentative $attempt/$max_attempts...${NC}"
        sleep 3
        ((attempt++))
    done
    
    echo -e "${RED}❌ Application non prête après $max_attempts tentatives${NC}"
    return 1
}

# Test rapide
quick_test() {
    echo -e "${BLUE}🧪 Test rapide...${NC}"
    
    # Test HTTP
    if curl -f -s http://appmeal.hamoun.fun >/dev/null 2>&1; then
        echo -e "${GREEN}✅ HTTP OK${NC}"
    else
        echo -e "${RED}❌ HTTP échoué${NC}"
    fi
    
    # Test HTTPS (avec certificat auto-signé)
    if curl -f -s -k https://appmeal.hamoun.fun >/dev/null 2>&1; then
        echo -e "${GREEN}✅ HTTPS OK${NC}"
    else
        echo -e "${RED}❌ HTTPS échoué${NC}"
    fi
}

# Fonction principale
main() {
    redeploy
    wait_for_app
    quick_test
    
    echo -e "${GREEN}🎉 Redéploiement terminé !${NC}"
    echo -e "${YELLOW}📝 Pour un diagnostic complet: ./debug-network.sh${NC}"
}

# Exécuter le script
main "$@" 