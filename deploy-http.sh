#!/bin/bash

# Script de déploiement HTTP simple pour les tests
set -e

echo "🚀 Déploiement HTTP simple de Meal Planner"

# Vérifier les arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <domaine>"
    echo "Exemple: $0 localhost"
    exit 1
fi

DOMAIN=$1

echo "📋 Configuration pour $DOMAIN"

# 1. Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs..."
docker-compose -f docker-compose.prod.yml down

# 2. Nettoyer les images
echo "🧹 Nettoyage des images..."
docker system prune -f

# 3. Créer le fichier .env
echo "⚙️ Configuration des variables d'environnement..."
cat > .env << EOF
# Configuration de la base de données
DB_PASSWORD=mealpass123

# Configuration OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Configuration utilisateur
DEFAULT_USER_ID=00000000-0000-0000-0000-000000000000

# Configuration du domaine
DOMAIN=$DOMAIN
EOF

# 4. Reconstruire l'image
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
if curl -f http://$DOMAIN/api/recipes > /dev/null 2>&1; then
    echo "✅ API accessible sur http://$DOMAIN/api/recipes"
else
    echo "❌ API non accessible, vérification des logs..."
    docker-compose -f docker-compose.prod.yml logs app
fi

echo ""
echo "🎉 Déploiement HTTP terminé !"
echo ""
echo "📱 Application accessible sur :"
echo "   🌐 http://$DOMAIN"
echo ""
echo "📊 Logs :"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛠️  Commandes utiles :"
echo "   - Arrêter : docker-compose -f docker-compose.prod.yml down"
echo "   - Redémarrer : docker-compose -f docker-compose.prod.yml restart"
echo "   - Logs : docker-compose -f docker-compose.prod.yml logs -f app" 