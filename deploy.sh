#!/bin/bash

# Script de déploiement automatisé pour Meal Planner
set -e

# Vérifier les arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <domaine>"
    echo "Exemple: $0 meal-planner.votre-domaine.com"
    exit 1
fi

DOMAIN=$1

echo "🚀 Déploiement de Meal Planner sur $DOMAIN"

# Vérifier les prérequis
check_prerequisites() {
    echo "📋 Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose n'est pas installé"
        exit 1
    fi
    
    echo "✅ Prérequis vérifiés"
}

# Configuration SSL
setup_ssl() {
    echo "🔒 Configuration SSL..."
    
    # Créer le dossier SSL
    mkdir -p ssl
    
    # Générer un certificat auto-signé valide
    if [ ! -f ssl/cert.pem ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=FR/ST=France/L=Paris/O=MealPlanner/CN=$DOMAIN" \
            -addext "subjectAltName=DNS:$DOMAIN,DNS:localhost,IP:127.0.0.1"
        
        # Configurer les permissions
        chmod 600 ssl/key.pem
        chmod 644 ssl/cert.pem
        
        echo "✅ Certificat SSL généré avec SAN"
    fi
}

# Configuration des variables d'environnement
setup_env() {
    echo "⚙️ Configuration des variables d'environnement..."
    
    # Créer le fichier .env s'il n'existe pas
    if [ ! -f .env ]; then
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
        echo "⚠️  Fichier .env créé. Veuillez configurer votre clé OpenAI API."
    else
        # Mettre à jour le domaine dans .env
        sed -i "s/DOMAIN=.*/DOMAIN=$DOMAIN/" .env
        echo "✅ Domaine mis à jour dans .env"
    fi
}

# Déploiement Docker
deploy_docker() {
    echo "🐳 Déploiement des conteneurs..."
    
    # Arrêter les conteneurs existants
    docker-compose -f docker-compose.prod.yml down
    
    # Reconstruire l'image
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Démarrer les services
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "✅ Conteneurs déployés"
}

# Initialisation de la base de données
init_database() {
    echo "🗄️ Initialisation de la base de données..."
    
    # Attendre que PostgreSQL soit prêt
    echo "⏳ Attente de PostgreSQL..."
    until docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U mealuser > /dev/null 2>&1; do
        sleep 2
    done
    
    # Exécuter le script d'initialisation
    ./init-db.sh
    
    echo "✅ Base de données initialisée"
}

# Vérification de la santé
health_check() {
    echo "🏥 Vérification de la santé de l'application..."
    
    # Attendre que l'application soit prête
    echo "⏳ Attente de l'application..."
    until curl -f http://localhost/api/recipes > /dev/null 2>&1; do
        sleep 5
    done
    
    echo "✅ Application accessible"
}

# Affichage des informations
show_info() {
    echo ""
    echo "🎉 Déploiement terminé !"
    echo ""
    echo "📱 Application accessible sur :"
    echo "   🌐 https://$DOMAIN"
    echo "   🔧 http://localhost (sans SSL)"
    echo ""
    echo "📊 Logs des conteneurs :"
    echo "   docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "🛠️  Commandes utiles :"
    echo "   - Arrêter : docker-compose -f docker-compose.prod.yml down"
    echo "   - Redémarrer : docker-compose -f docker-compose.prod.yml restart"
    echo "   - Logs : docker-compose -f docker-compose.prod.yml logs -f app"
    echo ""
    echo "⚠️  N'oubliez pas de :"
    echo "   1. Configurer votre clé OpenAI API dans .env"
    echo "   2. Configurer un vrai certificat SSL pour la production"
    echo "   3. Configurer votre DNS pour pointer vers ce serveur"
}

# Fonction principale
main() {
    check_prerequisites
    setup_ssl
    setup_env
    deploy_docker
    init_database
    health_check
    show_info
}

# Exécution
main "$@" 