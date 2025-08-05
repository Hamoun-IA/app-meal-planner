#!/bin/bash

echo "🚀 Déploiement PWA avec Traefik - Configuration existante"

# Variables
APP_NAME="meal-planner-app"
DOMAIN="appmeal.hamoun.fun"
TRAEFIK_NETWORK="root_default"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier que Traefik est en cours d'exécution
echo -e "${YELLOW}🔍 Vérification de Traefik...${NC}"
if ! docker network ls | grep -q "$TRAEFIK_NETWORK"; then
    echo -e "${RED}❌ Le réseau Traefik '$TRAEFIK_NETWORK' n'existe pas${NC}"
    echo -e "${YELLOW}💡 Vérifiez que Traefik est en cours d'exécution${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Traefik détecté${NC}"

# Vérifier les fichiers de configuration
echo -e "${YELLOW}📋 Vérification des fichiers de configuration...${NC}"

FILES_TO_CHECK=(
    "docker-compose.prod.yml"
    "Dockerfile"
    "public/manifest.json"
    "public/sw.js"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Fichier manquant: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Fichiers de configuration vérifiés${NC}"

# Générer les icônes PWA si nécessaire
if [ ! -d "public/icons" ]; then
    echo -e "${YELLOW}🎨 Génération des icônes PWA...${NC}"
    node scripts/generate-pwa-icons.js
fi

# Générer les splash screens si nécessaire
if [ ! -d "public/splash" ]; then
    echo -e "${YELLOW}📱 Génération des écrans de démarrage...${NC}"
    node scripts/generate-splash-screens.js
fi

# Vérifier les variables d'environnement
echo -e "${YELLOW}🔧 Vérification des variables d'environnement...${NC}"
if [ -z "$DOMAIN" ]; then
    echo -e "${YELLOW}⚠️  Variable DOMAIN non définie, utilisation de la valeur par défaut${NC}"
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ Variable OPENAI_API_KEY manquante${NC}"
    exit 1
fi

# Arrêter les conteneurs existants
echo -e "${YELLOW}🛑 Arrêt des conteneurs existants...${NC}"
docker-compose -f docker-compose.prod.yml down

# Construire et démarrer les conteneurs
echo -e "${YELLOW}🔨 Construction et démarrage des conteneurs...${NC}"
docker-compose -f docker-compose.prod.yml up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du démarrage des conteneurs${NC}"
    exit 1
fi

# Attendre que les conteneurs soient prêts
echo -e "${YELLOW}⏳ Attente du démarrage des services...${NC}"
sleep 30

# Vérifier l'état des conteneurs
echo -e "${YELLOW}🔍 Vérification de l'état des conteneurs...${NC}"
docker-compose -f docker-compose.prod.yml ps

# Vérifier les logs
echo -e "${YELLOW}📋 Logs de l'application:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=20 app

# Test de connectivité
echo -e "${YELLOW}🌐 Test de connectivité...${NC}"
if command -v curl &> /dev/null; then
    curl -I https://$DOMAIN 2>/dev/null && echo -e "${GREEN}✅ Application accessible${NC}" || echo -e "${RED}❌ Application non accessible${NC}"
else
    echo -e "${YELLOW}⚠️  curl non disponible, test manuel requis${NC}"
fi

echo -e "${GREEN}🎉 Déploiement terminé avec succès !${NC}"
echo -e "${YELLOW}📱 Votre PWA est accessible à: https://$DOMAIN${NC}"
echo -e "${YELLOW}🧪 Test PWA: https://$DOMAIN/test-pwa.html${NC}"

# Instructions supplémentaires
echo -e "${YELLOW}📝 Instructions:${NC}"
echo -e "1. Vérifiez que votre domaine pointe vers votre VPS"
echo -e "2. Assurez-vous que le port 80 et 443 sont ouverts"
echo -e "3. Traefik générera automatiquement le certificat SSL"
echo -e "4. Testez l'installation PWA sur mobile"

# Vérification des middlewares
echo -e "${YELLOW}🔧 Vérification des middlewares Traefik...${NC}"
docker exec traefik traefik config 2>/dev/null | grep -A 5 -B 5 "meal" || echo -e "${YELLOW}⚠️  Impossible de vérifier la configuration Traefik${NC}" 