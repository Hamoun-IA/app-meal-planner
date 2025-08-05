# 📱 Guide de Test PWA - Babounette

## 🎯 Objectif
Vérifier que l'application PWA fonctionne correctement en production sur mobile.

## 🧪 Tests à effectuer

### 1. **Test du Manifest**
- Ouvrez votre app sur mobile
- Allez dans les outils de développement (Chrome DevTools)
- Vérifiez que `/manifest.json` se charge correctement
- Vérifiez que toutes les icônes sont accessibles

### 2. **Test du Service Worker**
- Ouvrez Chrome DevTools > Application > Service Workers
- Vérifiez que le service worker est enregistré
- Vérifiez qu'il est actif et contrôle la page

### 3. **Test de l'Installation**
- Sur mobile, ouvrez votre app dans Chrome
- Vous devriez voir une bannière "Ajouter à l'écran d'accueil"
- Ou utilisez le menu (⋮) > "Ajouter à l'écran d'accueil"

### 4. **Test Hors Ligne**
- Installez l'app
- Coupez internet
- L'app devrait continuer à fonctionner
- Vérifiez que les pages principales sont en cache

### 5. **Test des Icônes**
- Vérifiez que l'icône apparaît sur l'écran d'accueil
- Vérifiez que l'icône apparaît dans le gestionnaire d'apps
- Vérifiez que l'icône apparaît dans les notifications

## 🔧 Outils de Test

### Fichier de Test Automatique
Ouvrez `https://votre-domaine.com/test-pwa.html` pour un test complet automatique.

### Chrome DevTools
1. Ouvrez Chrome DevTools sur mobile
2. Allez dans Application > Manifest
3. Vérifiez tous les champs
4. Allez dans Application > Service Workers
5. Vérifiez l'état du service worker

### Lighthouse Audit
1. Ouvrez Chrome DevTools
2. Allez dans Lighthouse
3. Sélectionnez "Progressive Web App"
4. Lancez l'audit
5. Vérifiez le score PWA (doit être > 90)

## 📋 Checklist de Validation

- [ ] Manifest.json accessible
- [ ] Service Worker enregistré et actif
- [ ] Icônes de toutes tailles chargées
- [ ] Installation PWA disponible
- [ ] App fonctionne hors ligne
- [ ] Écrans de démarrage iOS corrects
- [ ] Notifications push (optionnel)
- [ ] Score Lighthouse > 90

## 🐛 Problèmes Courants

### 1. **Installation non disponible**
- Vérifiez que le manifest.json est valide
- Vérifiez que les icônes sont accessibles
- Vérifiez que le service worker est actif

### 2. **Icônes manquantes**
- Vérifiez que les fichiers SVG existent dans `/public/icons/`
- Vérifiez les permissions des fichiers sur le serveur
- Vérifiez que les chemins dans le manifest sont corrects

### 3. **Service Worker non actif**
- Vérifiez que le fichier `/sw.js` est accessible
- Vérifiez les erreurs dans la console
- Vérifiez que HTTPS est activé (requis pour PWA)

### 4. **App ne fonctionne pas hors ligne**
- Vérifiez que le service worker met en cache les bonnes ressources
- Vérifiez que la stratégie de cache est correcte
- Vérifiez les erreurs dans la console du service worker

## 🚀 Déploiement

Pour déployer les mises à jour PWA :

```bash
# 1. Générer les icônes si nécessaire
node scripts/generate-pwa-icons.js

# 2. Générer les splash screens si nécessaire
node scripts/generate-splash-screens.js

# 3. Build et déployer
npm run build
# Puis déployer sur votre VPS
```

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs du service worker dans la console
2. Utilisez le fichier de test automatique
3. Vérifiez que tous les fichiers sont bien déployés sur le serveur
4. Vérifiez que HTTPS est activé sur votre domaine 