#!/bin/bash

# Script de correction du déploiement
set -e

echo "🔧 Correction du déploiement Meal Planner"

# 1. Arrêter tous les conteneurs
echo "🛑 Arrêt des conteneurs..."
docker-compose -f docker-compose.prod.yml down

# 2. Nettoyer les images
echo "🧹 Nettoyage des images..."
docker system prune -f

# 3. Vérifier la configuration
echo "📋 Vérification de la configuration..."

# Créer un fichier .env temporaire si nécessaire
if [ ! -f .env ]; then
    echo "Création du fichier .env..."
    cat > .env << EOF
# Configuration de la base de données
DB_PASSWORD=mealpass123

# Configuration OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Configuration utilisateur
DEFAULT_USER_ID=00000000-0000-0000-0000-000000000000

# Configuration du domaine
DOMAIN=localhost
EOF
fi

# 4. Reconstruire l'image avec les bonnes variables
echo "🔨 Reconstruction de l'image..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 5. Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

# 6. Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL..."
until docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U mealuser > /dev/null 2>&1; do
    sleep 2
done

# 7. Initialiser la base de données
echo "🗄️ Initialisation de la base de données..."
./init-db.sh

# 8. Vérifier que l'application répond
echo "🏥 Vérification de la santé de l'application..."
sleep 10

# Tester l'API
if curl -f http://localhost/api/recipes > /dev/null 2>&1; then
    echo "✅ API accessible sur http://localhost/api/recipes"
else
    echo "❌ API non accessible, vérification des logs..."
    docker-compose -f docker-compose.prod.yml logs app
fi

echo ""
echo "🎉 Correction terminée !"
echo ""
echo "📱 Application accessible sur :"
echo "   🌐 https://localhost (avec SSL)"
echo "   🔧 http://localhost (sans SSL)"
echo ""
echo "📊 Logs :"
echo "   docker-compose -f docker-compose.prod.yml logs -f" 