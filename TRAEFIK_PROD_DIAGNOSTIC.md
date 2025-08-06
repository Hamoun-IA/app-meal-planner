# 🔧 Diagnostic Traefik - Configuration Production

## 🎯 Votre Configuration Actuelle

- **Domaine** : `appmeal.hamoun.fun`
- **Réseau Traefik** : `root_default`
- **Port Application** : `3001`
- **Certificat** : `mytlschallenge`

## 🚨 Problèmes Courants avec votre Configuration

### 1. **Problème de Port**

**Symptôme** : Application non accessible
```bash
# Vérifier que l'app écoute sur le bon port
docker exec meal-planner-app netstat -tlnp | grep 3001
```

**Solution** : Vérifiez que votre Dockerfile expose le port 3001
```dockerfile
EXPOSE 3001
```

### 2. **Problème de Réseau**

**Symptôme** : Traefik ne trouve pas l'application
```bash
# Vérifier le réseau
docker network inspect root_default

# Vérifier que l'app est sur le bon réseau
docker inspect meal-planner-app | grep -A 10 "Networks"
```

**Solution** : Assurez-vous que le réseau `root_default` existe
```bash
docker network ls | grep root_default
```

### 3. **Problème de Certificat**

**Symptôme** : Erreur SSL
```bash
# Vérifier les certificats Traefik
docker exec traefik traefik certs list

# Vérifier la configuration Let's Encrypt
docker logs traefik | grep -i "certificate"
```

**Solution** : Vérifiez que `mytlschallenge` est configuré dans Traefik

### 4. **Problème de Headers PWA**

**Symptôme** : Installation PWA ne fonctionne pas
```bash
# Vérifier les headers
curl -I https://appmeal.hamoun.fun

# Vérifier le Service Worker
curl -I https://appmeal.hamoun.fun/sw.js
```

## 🔍 Script de Diagnostic Complet

```bash
#!/bin/bash
echo "🔍 Diagnostic Traefik Production"

echo "1. Vérification Traefik..."
docker ps | grep traefik || echo "❌ Traefik non trouvé"

echo "2. Vérification réseau..."
docker network ls | grep root_default || echo "❌ Réseau root_default manquant"

echo "3. Vérification application..."
docker ps | grep meal-planner-app || echo "❌ Application non trouvée"

echo "4. Vérification port..."
docker exec meal-planner-app netstat -tlnp | grep 3001 || echo "❌ Port 3001 non accessible"

echo "5. Test de connectivité..."
curl -I https://appmeal.hamoun.fun 2>/dev/null || echo "❌ Application non accessible"

echo "6. Vérification certificat..."
openssl s_client -connect appmeal.hamoun.fun:443 -servername appmeal.hamoun.fun < /dev/null 2>/dev/null | grep "subject=" || echo "❌ Certificat SSL invalide"

echo "7. Vérification PWA..."
curl -I https://appmeal.hamoun.fun/manifest.json 2>/dev/null || echo "❌ Manifest non accessible"
curl -I https://appmeal.hamoun.fun/sw.js 2>/dev/null || echo "❌ Service Worker non accessible"
```

## 🛠️ Commandes de Dépannage

### Vérifier l'état des conteneurs
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Vérifier les logs
```bash
# Logs de l'application
docker-compose -f docker-compose.prod.yml logs app

# Logs Traefik
docker logs traefik --tail=50

# Logs PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# Logs Redis
docker-compose -f docker-compose.prod.yml logs redis
```

### Vérifier la configuration Traefik
```bash
# Configuration complète
docker exec traefik traefik config

# Routers actifs
docker exec traefik traefik config | grep -A 10 "meal"

# Services actifs
docker exec traefik traefik config | grep -A 5 "meal"
```

### Tester la connectivité interne
```bash
# Test depuis l'application
docker exec meal-planner-app curl -I http://localhost:3001

# Test depuis Traefik
docker exec traefik curl -I http://meal-planner-app:3001
```

## 📋 Checklist de Vérification

### Prérequis
- [ ] Traefik en cours d'exécution
- [ ] Réseau `root_default` créé
- [ ] Certificat `mytlschallenge` configuré
- [ ] Domaine `appmeal.hamoun.fun` pointe vers le VPS

### Application
- [ ] Conteneur `meal-planner-app` en cours d'exécution
- [ ] Port 3001 exposé et accessible
- [ ] Variables d'environnement configurées
- [ ] Fichiers PWA générés

### Traefik
- [ ] Labels Traefik corrects
- [ ] Middlewares PWA configurés
- [ ] Headers de sécurité ajoutés
- [ ] TLS configuré

### Base de données
- [ ] PostgreSQL en cours d'exécution
- [ ] Redis en cours d'exécution
- [ ] Connexion à la base de données fonctionnelle

## 🚀 Déploiement

```bash
# Rendre le script exécutable
chmod +x scripts/deploy-prod-pwa.sh

# Déployer
./scripts/deploy-prod-pwa.sh
```

## 📞 Support

Si les problèmes persistent :

1. **Collectez les logs :**
   ```bash
   docker-compose -f docker-compose.prod.yml logs > app.log
   docker logs traefik > traefik.log
   ```

2. **Vérifiez la configuration :**
   ```bash
   docker-compose -f docker-compose.prod.yml config > config.yml
   ```

3. **Testez la connectivité :**
   ```bash
   curl -v https://appmeal.hamoun.fun
   ```

4. **Vérifiez les certificats :**
   ```bash
   openssl s_client -connect appmeal.hamoun.fun:443 -servername appmeal.hamoun.fun
   ``` 