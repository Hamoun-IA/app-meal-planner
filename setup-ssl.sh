#!/bin/bash

# Script de configuration SSL pour Meal Planner
set -e

echo "🔒 Configuration SSL pour Meal Planner"

# Vérifier les arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <domaine>"
    echo "Exemple: $0 meal-planner.votre-domaine.com"
    exit 1
fi

DOMAIN=$1

echo "📋 Configuration SSL pour $DOMAIN"

# 1. Créer le dossier SSL
echo "📁 Création du dossier SSL..."
mkdir -p ssl

# 2. Générer un certificat SSL auto-signé valide
echo "🔐 Génération du certificat SSL..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=FR/ST=France/L=Paris/O=MealPlanner/CN=$DOMAIN" \
    -addext "subjectAltName=DNS:$DOMAIN,DNS:localhost,IP:127.0.0.1"

# 3. Vérifier les permissions
echo "🔐 Configuration des permissions..."
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

# 4. Vérifier le certificat
echo "✅ Vérification du certificat..."
openssl x509 -in ssl/cert.pem -text -noout | grep -E "(Subject:|DNS:|IP Address:)"

echo ""
echo "🎉 Configuration SSL terminée !"
echo ""
echo "📋 Informations :"
echo "   - Certificat : ssl/cert.pem"
echo "   - Clé privée : ssl/key.pem"
echo "   - Domaine : $DOMAIN"
echo ""
echo "⚠️  Note : Ce certificat est auto-signé. Pour la production,"
echo "   utilisez un certificat Let's Encrypt ou commercial." 