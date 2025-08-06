#!/bin/bash

# Script de test de l'application Meal Planner

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Test de l'application Meal Planner${NC}"

# Test de l'application principale
test_main_app() {
    echo -e "${BLUE}🌐 Test de l'application principale...${NC}"
    
    local domain="appmeal.hamoun.fun"
    
    # Test HTTP
    echo -e "${YELLOW}📡 Test HTTP:${NC}"
    local http_response=$(curl -s -o /dev/null -w "%{http_code}" http://$domain)
    if [ "$http_response" = "200" ]; then
        echo -e "${GREEN}✅ HTTP OK (Code: $http_response)${NC}"
    else
        echo -e "${RED}❌ HTTP échoué (Code: $http_response)${NC}"
    fi
    
    # Test HTTPS (avec certificat auto-signé)
    echo -e "${YELLOW}🔒 Test HTTPS:${NC}"
    local https_response=$(curl -s -k -o /dev/null -w "%{http_code}" https://$domain)
    if [ "$https_response" = "200" ]; then
        echo -e "${GREEN}✅ HTTPS OK (Code: $https_response)${NC}"
    else
        echo -e "${RED}❌ HTTPS échoué (Code: $https_response)${NC}"
    fi
}

# Test des API
test_apis() {
    echo -e "${BLUE}🔌 Test des API...${NC}"
    
    local domain="appmeal.hamoun.fun"
    
    # Test API recettes
    echo -e "${YELLOW}📋 Test API recettes:${NC}"
    local recipes_response=$(curl -s -o /dev/null -w "%{http_code}" http://$domain/api/recipes)
    if [ "$recipes_response" = "200" ]; then
        echo -e "${GREEN}✅ API recettes OK (Code: $recipes_response)${NC}"
    else
        echo -e "${RED}❌ API recettes échoué (Code: $recipes_response)${NC}"
    fi
    
    # Test API catégories
    echo -e "${YELLOW}🏷️  Test API catégories:${NC}"
    local categories_response=$(curl -s -o /dev/null -w "%{http_code}" http://$domain/api/categories)
    if [ "$categories_response" = "200" ]; then
        echo -e "${GREEN}✅ API catégories OK (Code: $categories_response)${NC}"
    else
        echo -e "${RED}❌ API catégories échoué (Code: $categories_response)${NC}"
    fi
    
    # Test API produits
    echo -e "${YELLOW}🛒 Test API produits:${NC}"
    local products_response=$(curl -s -o /dev/null -w "%{http_code}" http://$domain/api/shopping-items)
    if [ "$products_response" = "200" ]; then
        echo -e "${GREEN}✅ API produits OK (Code: $products_response)${NC}"
    else
        echo -e "${RED}❌ API produits échoué (Code: $products_response)${NC}"
    fi
}

# Test des pages principales
test_pages() {
    echo -e "${BLUE}📄 Test des pages principales...${NC}"
    
    local domain="appmeal.hamoun.fun"
    
    # Test page d'accueil
    echo -e "${YELLOW}🏠 Test page d'accueil:${NC}"
    local home_response=$(curl -s -o /dev/null -w "%{http_code}" http://$domain/)
    if [ "$home_response" = "200" ]; then
        echo -e "${GREEN}✅ Page d'accueil OK (Code: $home_response)${NC}"
    else
        echo -e "${RED}❌ Page d'accueil échoué (Code: $home_response)${NC}"
    fi
    
    # Test page recettes
    echo -e "${YELLOW}📖 Test page recettes:${NC}"
    local recipes_page_response=$(curl -s -o /dev/null -w "%{http_code}" http://$domain/recettes)
    if [ "$recipes_page_response" = "200" ]; then
        echo -e "${GREEN}✅ Page recettes OK (Code: $recipes_page_response)${NC}"
    else
        echo -e "${RED}❌ Page recettes échoué (Code: $recipes_page_response)${NC}"
    fi
    
    # Test page assistante
    echo -e "${YELLOW}🤖 Test page assistante:${NC}"
    local assistant_response=$(curl -s -o /dev/null -w "%{http_code}" http://$domain/assistante)
    if [ "$assistant_response" = "200" ]; then
        echo -e "${GREEN}✅ Page assistante OK (Code: $assistant_response)${NC}"
    else
        echo -e "${RED}❌ Page assistante échoué (Code: $assistant_response)${NC}"
    fi
}

# Test de la base de données
test_database() {
    echo -e "${BLUE}🗄️  Test de la base de données...${NC}"
    
    # Test de connexion PostgreSQL
    echo -e "${YELLOW}📊 Test connexion PostgreSQL:${NC}"
    if docker exec meal-planner-db-prod pg_isready -U mealuser >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL connecté${NC}"
    else
        echo -e "${RED}❌ PostgreSQL non connecté${NC}"
    fi
    
    # Test de connexion Redis
    echo -e "${YELLOW}🔄 Test connexion Redis:${NC}"
    if docker exec meal-planner-redis-prod redis-cli ping >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis connecté${NC}"
    else
        echo -e "${RED}❌ Redis non connecté${NC}"
    fi
}

# Test des logs de l'application
check_logs() {
    echo -e "${BLUE}📝 Vérification des logs...${NC}"
    
    echo -e "${YELLOW}📋 Derniers logs de l'application:${NC}"
    docker logs --tail 10 meal-planner-app
    
    echo -e "${YELLOW}📋 Derniers logs Traefik:${NC}"
    docker logs --tail 5 root_traefik_1 | grep -E "(meal|appmeal)" || echo "Aucun log spécifique trouvé"
}

# Test de performance
test_performance() {
    echo -e "${BLUE}⚡ Test de performance...${NC}"
    
    local domain="appmeal.hamoun.fun"
    
    # Test de temps de réponse
    echo -e "${YELLOW}⏱️  Temps de réponse HTTP:${NC}"
    local http_time=$(curl -s -o /dev/null -w "%{time_total}" http://$domain)
    echo -e "${GREEN}📊 Temps de réponse: ${http_time}s${NC}"
    
    # Test de temps de réponse HTTPS
    echo -e "${YELLOW}⏱️  Temps de réponse HTTPS:${NC}"
    local https_time=$(curl -s -k -o /dev/null -w "%{time_total}" https://$domain)
    echo -e "${GREEN}📊 Temps de réponse: ${https_time}s${NC}"
}

# Fonction principale
main() {
    test_main_app
    echo ""
    test_apis
    echo ""
    test_pages
    echo ""
    test_database
    echo ""
    test_performance
    echo ""
    check_logs
    
    echo -e "${GREEN}🎉 Tests terminés !${NC}"
    echo -e "${YELLOW}📝 Accédez à votre application: http://appmeal.hamoun.fun${NC}"
}

# Exécuter le script
main "$@" 