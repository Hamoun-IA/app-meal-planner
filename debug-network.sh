#!/bin/bash

# Script de débogage réseau pour diagnostiquer les problèmes de connectivité

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Diagnostic réseau détaillé${NC}"

# Vérifier les conteneurs en cours d'exécution
check_containers() {
    echo -e "${BLUE}🐳 Conteneurs en cours d'exécution:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Vérifier les réseaux
check_networks() {
    echo -e "${BLUE}🌐 Réseaux Docker:${NC}"
    docker network ls
    
    echo -e "${BLUE}🔗 Détails du réseau root_default:${NC}"
    docker network inspect root_default --format='{{range .Containers}}{{.Name}} ({{.IPv4Address}}){{"\n"}}{{end}}'
}

# Tester la connectivité depuis l'application
test_connectivity() {
    echo -e "${BLUE}🔌 Test de connectivité depuis meal-planner-app:${NC}"
    
    # Test PostgreSQL avec curl (disponible dans le conteneur)
    echo -e "${YELLOW}📊 Test PostgreSQL:${NC}"
    docker exec meal-planner-app sh -c "timeout 5 bash -c '</dev/tcp/postgres/5432' 2>/dev/null" && echo -e "${GREEN}✅ Connexion PostgreSQL OK${NC}" || echo -e "${RED}❌ Connexion PostgreSQL échouée${NC}"
    
    # Test Redis avec curl
    echo -e "${YELLOW}🔄 Test Redis:${NC}"
    docker exec meal-planner-app sh -c "timeout 5 bash -c '</dev/tcp/redis/6379' 2>/dev/null" && echo -e "${GREEN}✅ Connexion Redis OK${NC}" || echo -e "${RED}❌ Connexion Redis échouée${NC}"
    
    # Test de l'application interne
    echo -e "${YELLOW}🔗 Test application interne:${NC}"
    docker exec meal-planner-app sh -c "timeout 5 bash -c '</dev/tcp/localhost/3001' 2>/dev/null" && echo -e "${GREEN}✅ Application interne OK${NC}" || echo -e "${RED}❌ Application interne échouée${NC}"
}

# Vérifier les variables d'environnement
check_env() {
    echo -e "${BLUE}🔧 Variables d'environnement de l'application:${NC}"
    docker exec meal-planner-app env | grep -E "(DATABASE_URL|REDIS_URL|NODE_ENV)" || echo "Aucune variable trouvée"
}

# Vérifier les logs de l'application
check_logs() {
    echo -e "${BLUE}📝 Derniers logs de l'application:${NC}"
    docker logs --tail 20 meal-planner-app
}

# Vérifier la configuration Traefik
check_traefik_config() {
    echo -e "${BLUE}🏷️  Configuration Traefik actuelle:${NC}"
    docker inspect meal-planner-app --format='{{range $k, $v := .Config.Labels}}{{$k}}={{$v}}{{"\n"}}{{end}}' | grep traefik
}

# Test de l'application
test_application() {
    echo -e "${BLUE}🌍 Test de l'application:${NC}"
    
    # Test interne
    echo -e "${YELLOW}🔍 Test interne (port 3001):${NC}"
    docker exec meal-planner-app sh -c "timeout 5 bash -c '</dev/tcp/localhost/3001' 2>/dev/null" && echo -e "${GREEN}✅ Application accessible en interne${NC}" || echo -e "${RED}❌ Application non accessible en interne${NC}"
    
    # Test externe HTTP
    echo -e "${YELLOW}🌐 Test externe HTTP:${NC}"
    curl -f -s http://appmeal.hamoun.fun >/dev/null 2>&1 && echo -e "${GREEN}✅ Application accessible en HTTP${NC}" || echo -e "${RED}❌ Application non accessible en HTTP${NC}"
    
    # Test externe HTTPS
    echo -e "${YELLOW}🔒 Test externe HTTPS:${NC}"
    curl -f -s -k https://appmeal.hamoun.fun >/dev/null 2>&1 && echo -e "${GREEN}✅ Application accessible en HTTPS${NC}" || echo -e "${RED}❌ Application non accessible en HTTPS${NC}"
}

# Fonction principale
main() {
    check_containers
    echo ""
    check_networks
    echo ""
    test_connectivity
    echo ""
    check_env
    echo ""
    check_traefik_config
    echo ""
    test_application
    echo ""
    check_logs
}

# Exécuter le script
main "$@" 