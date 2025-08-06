#!/bin/bash

# Script de vérification Traefik
# Vérifie que Traefik est correctement configuré pour l'application

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Vérification de la configuration Traefik${NC}"

# Vérifier le réseau Traefik
check_network() {
    echo -e "${BLUE}📋 Vérification du réseau Traefik...${NC}"
    
    if docker network ls | grep -q "root_default"; then
        echo -e "${GREEN}✅ Réseau 'root_default' trouvé${NC}"
        
        # Vérifier les conteneurs connectés
        echo -e "${BLUE}🔗 Conteneurs connectés au réseau:${NC}"
        docker network inspect root_default --format='{{range .Containers}}{{.Name}} {{end}}'
    else
        echo -e "${RED}❌ Réseau 'root_default' non trouvé${NC}"
        echo -e "${YELLOW}Réseaux disponibles:${NC}"
        docker network ls | grep root
        return 1
    fi
}

# Vérifier les conteneurs de l'application
check_containers() {
    echo -e "${BLUE}🐳 Vérification des conteneurs...${NC}"
    
    local containers=("meal-planner-app" "meal-planner-db-prod" "meal-planner-redis-prod")
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "$container"; then
            echo -e "${GREEN}✅ $container en cours d'exécution${NC}"
        else
            echo -e "${RED}❌ $container non trouvé${NC}"
        fi
    done
}

# Vérifier les labels Traefik
check_labels() {
    echo -e "${BLUE}🏷️  Vérification des labels Traefik...${NC}"
    
    if docker ps | grep -q "meal-planner-app"; then
        echo -e "${GREEN}✅ Labels Traefik sur meal-planner-app:${NC}"
        docker inspect meal-planner-app --format='{{range $k, $v := .Config.Labels}}{{$k}}={{$v}}{{"\n"}}{{end}}' | grep traefik
    else
        echo -e "${RED}❌ Conteneur meal-planner-app non trouvé${NC}"
    fi
}

# Vérifier la connectivité réseau
check_connectivity() {
    echo -e "${BLUE}🌐 Vérification de la connectivité...${NC}"
    
    if docker exec meal-planner-app ping -c 1 postgres >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Connexion vers PostgreSQL OK${NC}"
    else
        echo -e "${RED}❌ Connexion vers PostgreSQL échouée${NC}"
    fi
    
    if docker exec meal-planner-app ping -c 1 redis >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Connexion vers Redis OK${NC}"
    else
        echo -e "${RED}❌ Connexion vers Redis échouée${NC}"
    fi
}

# Vérifier les logs Traefik
check_traefik_logs() {
    echo -e "${BLUE}📝 Vérification des logs Traefik...${NC}"
    
    # Trouver le conteneur Traefik
    local traefik_container=$(docker ps --format "table {{.Names}}" | grep traefik | head -1)
    
    if [ -n "$traefik_container" ]; then
        echo -e "${GREEN}✅ Conteneur Traefik trouvé: $traefik_container${NC}"
        echo -e "${BLUE}📋 Derniers logs Traefik:${NC}"
        docker logs --tail 10 "$traefik_container" | grep -E "(meal|appmeal)" || echo "Aucun log spécifique trouvé"
    else
        echo -e "${RED}❌ Conteneur Traefik non trouvé${NC}"
        echo -e "${YELLOW}Conteneurs en cours d'exécution:${NC}"
        docker ps --format "table {{.Names}}"
    fi
}

# Vérifier l'accessibilité de l'application
check_accessibility() {
    echo -e "${BLUE}🌍 Vérification de l'accessibilité...${NC}"
    
    local domain=${DOMAIN:-"appmeal.hamoun.fun"}
    
    if curl -f -s "https://$domain" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Application accessible sur https://$domain${NC}"
    else
        echo -e "${RED}❌ Application non accessible sur https://$domain${NC}"
        echo -e "${YELLOW}Tentative HTTP...${NC}"
        if curl -f -s "http://$domain" >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Application accessible en HTTP mais pas en HTTPS${NC}"
        else
            echo -e "${RED}❌ Application non accessible${NC}"
        fi
    fi
}

# Fonction principale
main() {
    check_network
    check_containers
    check_labels
    check_connectivity
    check_traefik_logs
    check_accessibility
    
    echo -e "${GREEN}🎉 Vérification terminée !${NC}"
}

# Exécuter le script
main "$@" 