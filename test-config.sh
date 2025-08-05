#!/bin/bash

# Script de test de configuration
set -e

echo "🔍 Test de configuration pour Meal Planner"

# Vérifier les variables d'environnement
echo "📋 Variables d'environnement :"
echo "DOMAIN: ${DOMAIN:-non défini}"
echo "NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-non défini}"
echo "NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:-non défini}"

# Tester la configuration Docker
echo ""
echo "🐳 Test de la configuration Docker :"

# Vérifier que le fichier .env existe
if [ -f .env ]; then
    echo "✅ Fichier .env trouvé"
    source .env
    echo "DOMAIN depuis .env: $DOMAIN"
else
    echo "⚠️  Fichier .env non trouvé"
fi

# Tester la syntaxe du docker-compose
echo ""
echo "🔧 Test de la syntaxe docker-compose :"
if docker-compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    echo "✅ Configuration docker-compose valide"
else
    echo "❌ Erreur dans la configuration docker-compose"
    docker-compose -f docker-compose.prod.yml config
    exit 1
fi

# Tester la configuration Nginx
echo ""
echo "🌐 Test de la configuration Nginx :"
if [ -f nginx.conf ]; then
    echo "✅ Fichier nginx.conf trouvé"
    if nginx -t -c nginx.conf > /dev/null 2>&1; then
        echo "✅ Configuration Nginx valide"
    else
        echo "❌ Erreur dans la configuration Nginx"
        nginx -t -c nginx.conf
    fi
else
    echo "❌ Fichier nginx.conf non trouvé"
fi

# Tester les ports
echo ""
echo "🔌 Test des ports :"
if netstat -tuln | grep -q ":80 "; then
    echo "⚠️  Port 80 déjà utilisé"
else
    echo "✅ Port 80 disponible"
fi

if netstat -tuln | grep -q ":443 "; then
    echo "⚠️  Port 443 déjà utilisé"
else
    echo "✅ Port 443 disponible"
fi

if netstat -tuln | grep -q ":3001 "; then
    echo "⚠️  Port 3001 déjà utilisé"
else
    echo "✅ Port 3001 disponible"
fi

echo ""
echo "🎉 Test de configuration terminé !" 