# Guide de Déploiement - Meal Planner App

## 🚀 Déploiement Rapide sur VPS

### Prérequis

- **VPS** avec Ubuntu 20.04+ ou Debian 11+
- **Docker** et **Docker Compose** installés
- **Domaine** configuré (optionnel pour les tests)

### 1. Préparation du Serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
```

### 2. Configuration de l'Application

```bash
# Cloner le projet
git clone https://github.com/votre-repo/app-meal-planner.git
cd app-meal-planner

# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

**Variables d'environnement requises :**
```env
# Base de données (utilisées par Docker)
DATABASE_URL="postgresql://mealuser:VOTRE_MOT_DE_PASSE@postgres:5432/mealdb"
DB_PASSWORD="VOTRE_MOT_DE_PASSE_SECURISE"

# OpenAI API
OPENAI_API_KEY="sk-votre-cle-api-openai"

# Redis
REDIS_URL="redis://redis:6379"

# Utilisateur unique
DEFAULT_USER_ID="00000000-0000-0000-0000-000000000000"

# Environnement
NODE_ENV="production"
```

### 3. Déploiement Automatique

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Déployer avec votre domaine
./deploy.sh votre-domaine.com

# Ou pour un test local
./deploy.sh localhost

# Pour tester le déploiement local
chmod +x test-deployment.sh
./test-deployment.sh
```

### 4. Vérification du Déploiement

```bash
# Vérifier les conteneurs
docker-compose -f docker-compose.prod.yml ps

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f

# Test de santé
curl http://votre-domaine.com/health
```

## 🔧 Configuration Avancée

### SSL avec Let's Encrypt

Pour un domaine réel, remplacez les certificats auto-signés :

```bash
# Installer Certbot
sudo apt install certbot

# Obtenir un certificat
sudo certbot certonly --standalone -d votre-domaine.com

# Copier les certificats
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*
```

### Configuration Nginx Personnalisée

Éditez `nginx.conf` pour :
- Changer le nom de domaine
- Ajouter des règles de sécurité
- Optimiser les performances

### Base de Données Externe

Pour utiliser une base de données externe :

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

## 📊 Monitoring et Maintenance

### Logs

```bash
# Logs de l'application
docker-compose -f docker-compose.prod.yml logs -f app

# Logs de la base de données
docker-compose -f docker-compose.prod.yml logs -f postgres

# Logs Nginx
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Sauvegarde

```bash
# Sauvegarder la base de données
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U mealuser mealdb > backup.sql

# Restaurer
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U mealuser mealdb < backup.sql
```

### Mise à Jour

```bash
# Arrêter l'application
docker-compose -f docker-compose.prod.yml down

# Puller les dernières modifications
git pull

# Redéployer
./deploy.sh votre-domaine.com
```

## 🚨 Dépannage

### Problèmes Courants

1. **Port 80/443 occupé**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop apache2  # si nécessaire
   ```

2. **Permissions Docker**
   ```bash
   sudo chmod 666 /var/run/docker.sock
   ```

3. **Mémoire insuffisante**
   ```bash
   # Augmenter la swap
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Commandes Utiles

```bash
# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart app

# Voir les ressources utilisées
docker stats

# Nettoyer Docker
docker system prune -a

# Accéder au conteneur
docker-compose -f docker-compose.prod.yml exec app sh
```

## 🔒 Sécurité

### Firewall

```bash
# Configurer UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Variables d'Environnement Sécurisées

- Utilisez des mots de passe forts
- Changez les clés par défaut
- Limitez l'accès aux ports

### Rate Limiting

Le Nginx est configuré avec :
- 10 req/s pour les API générales
- 5 req/s pour les endpoints AI

## 📈 Performance

### Optimisations Incluses

- **Gzip compression** pour tous les assets
- **Cache headers** optimisés
- **Rate limiting** pour éviter l'abus
- **Security headers** configurés
- **HTTP/2** activé

### Monitoring

```bash
# Installer htop pour le monitoring
sudo apt install htop

# Surveiller les ressources
htop
```

## 🎯 Tests Utilisateur

Une fois déployé, testez :

1. **Fonctionnalités de base**
   - Création de recettes
   - Gestion des ingrédients
   - Planification de repas

2. **Fonctionnalités AI**
   - Génération de recettes
   - Chat conversationnel
   - Recherche sémantique

3. **Performance**
   - Temps de chargement
   - Réactivité sur mobile
   - Fonctionnement offline (PWA)

4. **Sécurité**
   - Validation des entrées
   - Protection contre les injections
   - Gestion des erreurs

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose -f docker-compose.prod.yml logs -f`
2. Testez la santé : `curl http://votre-domaine.com/health`
3. Vérifiez les ressources : `docker stats`
4. Consultez la documentation du projet 