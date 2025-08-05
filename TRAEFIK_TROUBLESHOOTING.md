# 🔧 Guide de Dépannage Traefik - Babounette

## 🚨 Problèmes Courants et Solutions

### 1. **Traefik ne détecte pas l'application**

**Symptômes :**
- L'application n'est pas accessible via Traefik
- Erreur 404 ou "Service Unavailable"

**Solutions :**
```bash
# Vérifier que le réseau Traefik existe
docker network ls | grep traefik

# Vérifier que l'application est sur le bon réseau
docker inspect babounette | grep -A 10 "Networks"

# Redémarrer l'application
docker-compose -f docker-compose.traefik.yml restart
```

### 2. **Certificat SSL non généré**

**Symptômes :**
- Erreur de certificat SSL
- Traefik ne génère pas automatiquement le certificat

**Solutions :**
```bash
# Vérifier la configuration Let's Encrypt
docker logs traefik | grep -i "certificate"

# Vérifier que le domaine pointe vers votre VPS
nslookup babounette.votre-domaine.com

# Forcer le renouvellement du certificat
docker exec traefik traefik certs renew
```

### 3. **Headers PWA manquants**

**Symptômes :**
- L'installation PWA ne fonctionne pas
- Service Worker non autorisé

**Solutions :**
```bash
# Vérifier les headers dans la réponse
curl -I https://babounette.votre-domaine.com

# Vérifier la configuration des middlewares
docker-compose -f docker-compose.traefik.yml config
```

### 4. **Application ne démarre pas**

**Symptômes :**
- Conteneur en état "Exit"
- Logs d'erreur

**Solutions :**
```bash
# Vérifier les logs
docker-compose -f docker-compose.traefik.yml logs babounette

# Vérifier les variables d'environnement
docker-compose -f docker-compose.traefik.yml config

# Reconstruire l'image
docker-compose -f docker-compose.traefik.yml build --no-cache
```

## 🔍 Commandes de Diagnostic

### Vérifier l'état de Traefik
```bash
# État des conteneurs
docker ps | grep traefik

# Logs Traefik
docker logs traefik --tail=50

# Configuration Traefik
docker exec traefik traefik version
```

### Vérifier l'état de l'application
```bash
# État des conteneurs Babounette
docker-compose -f docker-compose.traefik.yml ps

# Logs de l'application
docker-compose -f docker-compose.traefik.yml logs babounette

# Test de connectivité
docker exec babounette curl -I http://localhost:3000
```

### Vérifier la configuration réseau
```bash
# Lister les réseaux
docker network ls

# Inspecter le réseau Traefik
docker network inspect traefik-network

# Vérifier les conteneurs sur le réseau
docker network inspect traefik-network -f '{{range .Containers}}{{.Name}} {{end}}'
```

## 📋 Checklist de Configuration

### Prérequis Traefik
- [ ] Traefik installé et en cours d'exécution
- [ ] Réseau `traefik-network` créé
- [ ] Certificat Let's Encrypt configuré
- [ ] Ports 80 et 443 ouverts

### Configuration Application
- [ ] Dockerfile optimisé pour la production
- [ ] Variables d'environnement configurées
- [ ] Fichiers PWA générés (icônes, manifest)
- [ ] Service Worker accessible

### Configuration Traefik
- [ ] Labels Traefik corrects
- [ ] Middlewares PWA configurés
- [ ] Headers de sécurité ajoutés
- [ ] TLS configuré

## 🛠️ Scripts de Diagnostic

### Script de vérification rapide
```bash
#!/bin/bash
echo "🔍 Diagnostic Traefik Babounette"

echo "1. Vérification Traefik..."
docker ps | grep traefik || echo "❌ Traefik non trouvé"

echo "2. Vérification réseau..."
docker network ls | grep traefik || echo "❌ Réseau Traefik manquant"

echo "3. Vérification application..."
docker ps | grep babounette || echo "❌ Application non trouvée"

echo "4. Test de connectivité..."
curl -I https://babounette.votre-domaine.com 2>/dev/null || echo "❌ Application non accessible"

echo "5. Vérification certificat..."
openssl s_client -connect babounette.votre-domaine.com:443 -servername babounette.votre-domaine.com < /dev/null 2>/dev/null | grep "subject=" || echo "❌ Certificat SSL invalide"
```

## 📞 Support

Si les problèmes persistent :

1. **Collectez les logs :**
   ```bash
   docker logs traefik > traefik.log
   docker-compose -f docker-compose.traefik.yml logs > babounette.log
   ```

2. **Vérifiez la configuration :**
   ```bash
   docker-compose -f docker-compose.traefik.yml config > config.yml
   ```

3. **Testez la connectivité :**
   ```bash
   curl -v https://babounette.votre-domaine.com
   ```

4. **Vérifiez les certificats :**
   ```bash
   openssl s_client -connect babounette.votre-domaine.com:443 -servername babounette.votre-domaine.com
   ``` 