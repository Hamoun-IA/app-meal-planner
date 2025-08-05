#!/bin/bash

echo "🚀 Déploiement PWA - Babounette"

# Variables
APP_NAME="babounette"
VPS_HOST="votre-vps-ip"
VPS_USER="root"
VPS_PATH="/var/www/babounette"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Vérification de la configuration PWA...${NC}"

# Vérifier que les icônes existent
if [ ! -d "public/icons" ]; then
    echo -e "${RED}❌ Dossier icons manquant. Génération des icônes...${NC}"
    node scripts/generate-pwa-icons.js
fi

# Vérifier que les splash screens existent
if [ ! -d "public/splash" ]; then
    echo -e "${RED}❌ Dossier splash manquant. Génération des splash screens...${NC}"
    node scripts/generate-splash-screens.js
fi

# Vérifier les fichiers PWA essentiels
FILES_TO_CHECK=(
    "public/manifest.json"
    "public/sw.js"
    "public/icons/icon-192x192.svg"
    "public/icons/icon-512x512.svg"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Fichier manquant: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Configuration PWA vérifiée${NC}"

# Build de l'application
echo -e "${YELLOW}🔨 Build de l'application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du build${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build terminé${NC}"

# Déploiement sur le VPS
echo -e "${YELLOW}📤 Déploiement sur le VPS...${NC}"

# Copier les fichiers vers le VPS
rsync -avz --delete \
    .next/ \
    public/ \
    package.json \
    package-lock.json \
    next.config.mjs \
    $VPS_USER@$VPS_HOST:$VPS_PATH/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du déploiement${NC}"
    exit 1
fi

# Redémarrer le service sur le VPS
echo -e "${YELLOW}🔄 Redémarrage du service...${NC}"
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && npm install --production && pm2 restart $APP_NAME"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du redémarrage${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Déploiement PWA terminé avec succès !${NC}"
echo -e "${YELLOW}📱 Testez l'installation PWA sur mobile :${NC}"
echo -e "   - Ouvrez votre app sur mobile"
echo -e "   - Vous devriez voir l'option 'Ajouter à l'écran d'accueil'"
echo -e "   - Ou utilisez le fichier de test: https://votre-domaine.com/test-pwa.html" 