/**
 * Utilitaire pour nettoyer le localStorage des anciennes données
 * qui ne sont plus utilisées depuis la migration vers la base de données
 */

export const cleanupLocalStorage = () => {
  if (typeof window === 'undefined') return

  try {
    // Supprimer les anciennes clés de localStorage
    const keysToRemove = [
      'babounette-produits', // Anciens produits du localStorage
      'shopping-list', // Ancienne liste de courses
      'produits', // Autres clés possibles
      'categories', // Anciennes catégories
    ]

    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        console.log(`✅ Supprimé du localStorage: ${key}`)
      }
    })

    console.log('🧹 Nettoyage du localStorage terminé')
  } catch (error) {
    console.error('Erreur lors du nettoyage du localStorage:', error)
  }
}

// Fonction pour vérifier s'il reste des données dans le localStorage
export const checkLocalStorageData = () => {
  if (typeof window === 'undefined') return []

  const remainingKeys: string[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.includes('babounette') || key?.includes('shopping') || key?.includes('produit')) {
      remainingKeys.push(key)
    }
  }

  return remainingKeys
} 