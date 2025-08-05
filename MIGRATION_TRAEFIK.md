# 🚀 Migration vers Traefik - Guide Complet

## 📋 Vue d'ensemble

Ce guide vous accompagne dans la migration de Nginx vers Traefik pour votre application Meal Planner.

## 🔧 Prérequis

### Vérifications sur votre VPS

```bash
# 1. Vérifier que Traefik est en cours d'exécution
docker ps | grep traefik

# 2. Vérifier le réseau Traefik
docker network ls | grep root_default

# 3. Vérifier que le domaine pointe vers votre VPS
nslookup appmeal.hamoun.fun
```

## 📁 Fichiers de configuration

### Fichiers créés/modifiés :

1. **`docker-compose.traefik.yml`** - Configuration Traefik optimisée
2. **`deploy-traefik.sh`** - Script de déploiement automatique
3. **`check-traefik.sh`** - Script de vérification
4. **`env.example`** - Variables d'environnement mises à jour

## 🚀 Étapes de migration

### Étape 1 : Arrêt des services actuels

```bash
cd ~/app-meal-planner

# Arrêter les conteneurs actuels
docker-compose -f docker-compose.prod.yml down

# Nettoyer
docker system prune -f
```

### Étape 2 : Configuration de l'environnement

```bash
# Copier l'exemple d'environnement
cp env.example .env

# Éditer le fichier .env
nano .env
```

**Variables importantes à configurer :**
```env
DOMAIN=appmeal.hamoun.fun
OPENAI_API_KEY=votre-clé-openai
DB_PASSWORD=votre-mot-de-passe-db
NEXT_PUBLIC_APP_URL=https://appmeal.hamoun.fun
NEXT_PUBLIC_API_URL=https://appmeal.hamoun.fun/api
```

### Étape 3 : Déploiement avec Traefik

```bash
# Rendre les scripts exécutables
chmod +x deploy-traefik.sh
chmod +x check-traefik.sh

# Déployer
./deploy-traefik.sh
```

### Étape 4 : Vérification

```bash
# Vérifier la configuration
./check-traefik.sh

# Voir les logs
docker logs meal-planner-app
```

## 🔍 Détails de la configuration Traefik

### Labels Traefik utilisés :

```yaml
# Activation de Traefik
- "traefik.enable=true"

# Router principal (HTTPS)
- "traefik.http.routers.meal.rule=Host(`appmeal.hamoun.fun`)"
- "traefik.http.routers.meal.entrypoints=websecure"
- "traefik.http.routers.meal.tls.certresolver=letsencrypt"
- "traefik.http.services.meal.loadbalancer.server.port=3001"

# Redirection HTTP → HTTPS
- "traefik.http.routers.meal-http.rule=Host(`appmeal.hamoun.fun`)"
- "traefik.http.routers.meal-http.entrypoints=web"
- "traefik.http.routers.meal-http.middlewares=redirect-to-https"

# Middlewares
- "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
- "traefik.http.middlewares.meal-headers.headers.customrequestheaders.X-Forwarded-Proto=https"
- "traefik.http.middlewares.meal-pwa.headers.customresponseheaders.Service-Worker-Allowed=/"
- "traefik.http.middlewares.meal-security.headers.customresponseheaders.X-Content-Type-Options=nosniff"
```

## 🚨 Dépannage

### Problème : Service non détecté par Traefik

```bash
# Vérifier les labels
docker inspect meal-planner-app | grep -A 20 -B 5 traefik

# Vérifier la connectivité réseau
docker network inspect root_default
```

### Problème : Certificat SSL non généré

```bash
# Vérifier les logs Traefik
docker logs [nom-conteneur-traefik]

# Vérifier que le domaine pointe vers le VPS
nslookup appmeal.hamoun.fun
```

### Problème : Application non accessible

```bash
# Vérifier les logs de l'application
docker logs meal-planner-app

# Vérifier que le port 3001 est exposé
docker port meal-planner-app
```

## 📊 Commandes de maintenance

### Surveillance

```bash
# Voir les logs en temps réel
docker logs -f meal-planner-app

# Vérifier l'état des conteneurs
docker ps

# Vérifier l'utilisation des ressources
docker stats
```

### Maintenance

```bash
# Redémarrer l'application
docker-compose -f docker-compose.traefik.yml restart app

# Mettre à jour l'application
git pull
docker-compose -f docker-compose.traefik.yml up -d --build

# Arrêter complètement
docker-compose -f docker-compose.traefik.yml down
```

### Sauvegarde

```bash
# Sauvegarder la base de données
docker exec meal-planner-db-prod pg_dump -U mealuser mealdb > backup.sql

# Restaurer la base de données
docker exec -i meal-planner-db-prod psql -U mealuser mealdb < backup.sql
```

## ✅ Checklist de vérification

- [ ] Traefik est en cours d'exécution
- [ ] Le réseau `root_default` existe
- [ ] Le domaine pointe vers le VPS
- [ ] Les conteneurs sont déployés
- [ ] L'application est accessible en HTTPS
- [ ] Les certificats SSL sont générés
- [ ] L'API fonctionne
- [ ] Le chat AI fonctionne
- [ ] La PWA peut être installée

## 🆘 Support

En cas de problème :

1. Exécutez `./check-traefik.sh` pour un diagnostic complet
2. Vérifiez les logs : `docker logs meal-planner-app`
3. Vérifiez la configuration Traefik : `docker logs [nom-traefik]`
4. Consultez ce guide pour les solutions courantes

## 🔄 Rollback

Si vous devez revenir à Nginx :

```bash
# Arrêter Traefik
docker-compose -f docker-compose.traefik.yml down

# Redémarrer avec Nginx
docker-compose -f docker-compose.prod.yml up -d
``` 