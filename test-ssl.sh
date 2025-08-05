#!/bin/bash

# Script de test SSL pour diagnostiquer les problèmes HTTPS

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 Diagnostic SSL/HTTPS${NC}"

# Test des certificats
test_certificates() {
    echo -e "${BLUE}📜 Test des certificats...${NC}"
    
    local domain="appmeal.hamoun.fun"
    
    # Test avec openssl
    echo -e "${YELLOW}🔍 Test certificat avec openssl:${NC}"
    if openssl s_client -connect $domain:443 -servername $domain < /dev/null 2>/dev/null | grep -q "BEGIN CERTIFICATE"; then
        echo -e "${GREEN}✅ Certificat SSL détecté${NC}"
    else
        echo -e "${RED}❌ Certificat SSL non détecté${NC}"
    fi
    
    # Test avec curl détaillé
    echo -e "${YELLOW}🌐 Test avec curl détaillé:${NC}"
    curl -v -k https://$domain 2>&1 | grep -E "(SSL|certificate|TLS)" || echo "Aucune information SSL trouvée"
}

# Vérifier la configuration Traefik
check_traefik_ssl() {
    echo -e "${BLUE}🏷️  Configuration SSL Traefik:${NC}"
    
    # Vérifier les labels SSL
    docker inspect meal-planner-app --format='{{range $k, $v := .Config.Labels}}{{$k}}={{$v}}{{"\n"}}{{end}}' | grep -E "(tls|ssl|cert)" || echo "Aucun label SSL trouvé"
    
    # Vérifier les logs Traefik
    echo -e "${YELLOW}📝 Logs Traefik SSL:${NC}"
    docker logs root_traefik_1 2>&1 | grep -E "(SSL|certificate|TLS|error)" | tail -10 || echo "Aucun log SSL trouvé"
}

# Test de redirection HTTP → HTTPS
test_redirect() {
    echo -e "${BLUE}🔄 Test de redirection HTTP → HTTPS:${NC}"
    
    local domain="appmeal.hamoun.fun"
    
    # Test de redirection
    local response=$(curl -s -I http://$domain 2>/dev/null | head -1)
    echo -e "${YELLOW}📡 Réponse HTTP: $response${NC}"
    
    # Vérifier si c'est une redirection
    if echo "$response" | grep -q "301\|302"; then
        echo -e "${GREEN}✅ Redirection détectée${NC}"
    else
        echo -e "${RED}❌ Pas de redirection${NC}"
    fi
}

# Test de connectivité réseau
test_network() {
    echo -e "${BLUE}🌐 Test de connectivité réseau:${NC}"
    
    local domain="appmeal.hamoun.fun"
    
    # Test DNS
    echo -e "${YELLOW}🔍 Résolution DNS:${NC}"
    nslookup $domain 2>/dev/null || echo "Erreur de résolution DNS"
    
    # Test de connectivité
    echo -e "${YELLOW}🔌 Test de connectivité:${NC}"
    if telnet $domain 443 2>/dev/null | grep -q "Connected"; then
        echo -e "${GREEN}✅ Port 443 accessible${NC}"
    else
        echo -e "${RED}❌ Port 443 non accessible${NC}"
    fi
}

# Vérifier les ports Traefik
check_traefik_ports() {
    echo -e "${BLUE}🔌 Ports Traefik:${NC}"
    
    echo -e "${YELLOW}📋 Ports écoutés par Traefik:${NC}"
    docker port root_traefik_1
    
    echo -e "${YELLOW}🌐 Ports écoutés sur le système:${NC}"
    netstat -tlnp 2>/dev/null | grep -E ":80|:443" || echo "Aucun port 80/443 trouvé"
}

# Fonction principale
main() {
    test_certificates
    echo ""
    check_traefik_ssl
    echo ""
    test_redirect
    echo ""
    test_network
    echo ""
    check_traefik_ports
}

# Exécuter le script
main "$@" 