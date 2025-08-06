/**
 * Script pour nettoyer manuellement le localStorage
 * À exécuter dans la console du navigateur si nécessaire
 */

function cleanupLocalStorage() {
  const keysToRemove = [
    'babounette-produits',
    'shopping-list',
    'produits',
    'categories',
    'babounette-categories',
    'babounette-shopping-list',
  ]

  let removedCount = 0

  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      console.log(`✅ Supprimé: ${key}`)
      removedCount++
    }
  })

  console.log(`🧹 Nettoyage terminé: ${removedCount} clé(s) supprimée(s)`)

  // Vérifier s'il reste des données liées
  const remainingKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('babounette') || key.includes('shopping') || key.includes('produit'))) {
      remainingKeys.push(key)
    }
  }

  if (remainingKeys.length > 0) {
    console.log('⚠️ Données restantes:', remainingKeys)
  } else {
    console.log('✅ Aucune donnée restante')
  }
}

// Exécuter le nettoyage
cleanupLocalStorage() 