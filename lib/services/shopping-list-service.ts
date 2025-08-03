export interface ShoppingListItem {
  id: string
  name: string
  quantity: string
  category: string
  completed: boolean
  fromRecipe?: string // ID de la recette d'origine
}

export class ShoppingListService {
  private readonly STORAGE_KEY = 'shopping-list'

  // Mapper les anciennes catégories vers les catégories existantes de la DB
  private mapCategoryToDB(category: string): string {
    // Utiliser directement les catégories existantes des ingrédients
    // Pas besoin de mapping complexe, utiliser les catégories telles qu'elles sont
    return category || 'Autres'
  }

  // Récupérer tous les articles
  getItems(): ShoppingListItem[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const items = stored ? JSON.parse(stored) : []
      
      // Mapper les catégories vers la DB
      return items.map((item: ShoppingListItem) => ({
        ...item,
        category: this.mapCategoryToDB(item.category)
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération de la liste de courses:', error)
      return []
    }
  }

  // Ajouter des articles depuis une recette
  addItemsFromRecipe(items: Array<{ name: string; quantity: number; unit: string }>, recipeName: string): void {
    if (typeof window === 'undefined') return

    try {
      const currentItems = this.getItems()
      
      // Convertir les ingrédients en articles de courses
      const newItems: ShoppingListItem[] = items.map((item, index) => ({
        id: `${Date.now()}-${index}`,
        name: item.name,
        quantity: `${item.quantity} ${item.unit}`,
        category: this.categorizeIngredient(item.name),
        completed: false,
        fromRecipe: recipeName
      }))

      // Fusionner avec les articles existants (éviter les doublons)
      const mergedItems = this.mergeItems(currentItems, newItems)
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedItems))
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la liste de courses:', error)
    }
  }

  // Ajouter un article individuel
  addItem(item: Omit<ShoppingListItem, 'id'>): void {
    if (typeof window === 'undefined') return

    try {
      const currentItems = this.getItems()
      const newItem: ShoppingListItem = {
        ...item,
        id: Date.now().toString()
      }
      
      const mergedItems = this.mergeItems(currentItems, [newItem])
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedItems))
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un article:', error)
    }
  }

  // Marquer un article comme terminé
  toggleItem(id: string): void {
    if (typeof window === 'undefined') return

    try {
      const currentItems = this.getItems()
      const updatedItems = currentItems.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedItems))
    } catch (error) {
      console.error('Erreur lors de la modification d\'un article:', error)
    }
  }

  // Supprimer un article
  removeItem(id: string): void {
    if (typeof window === 'undefined') return

    try {
      const currentItems = this.getItems()
      const updatedItems = currentItems.filter(item => item.id !== id)
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedItems))
    } catch (error) {
      console.error('Erreur lors de la suppression d\'un article:', error)
    }
  }

  // Vider la liste
  clearList(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Erreur lors du vidage de la liste:', error)
    }
  }

  // Fusionner les articles en évitant les doublons
  private mergeItems(existing: ShoppingListItem[], newItems: ShoppingListItem[]): ShoppingListItem[] {
    const merged = [...existing]
    
    newItems.forEach(newItem => {
      // Chercher un article existant avec le même nom et catégorie (non terminé)
      const existingIndex = merged.findIndex(item => 
        this.normalizeName(item.name) === this.normalizeName(newItem.name) && 
        item.category === newItem.category && 
        !item.completed
      )
      
      if (existingIndex !== -1) {
        // Fusionner les quantités
        const existing = merged[existingIndex]
        const existingQuantity = this.parseQuantity(existing.quantity)
        const newQuantity = this.parseQuantity(newItem.quantity)
        
        if (existingQuantity && newQuantity && this.normalizeUnit(existingQuantity.unit) === this.normalizeUnit(newQuantity.unit)) {
          const totalQuantity = existingQuantity.amount + newQuantity.amount
          merged[existingIndex] = {
            ...existing,
            quantity: `${totalQuantity} ${existingQuantity.unit}`
          }
        } else {
          // Si les unités ne correspondent pas, ajouter comme nouvel article
          merged.push(newItem)
        }
      } else {
        // Ajouter comme nouvel article
        merged.push(newItem)
      }
    })
    
    return merged
  }

  // Catégoriser un ingrédient
  private categorizeIngredient(name: string): string {
    // Utiliser les catégories existantes des ingrédients
    // Cette fonction peut être simplifiée ou supprimée selon les besoins
    const lowerName = name.toLowerCase()
    
    // Mapping simple vers les catégories existantes
    if (lowerName.includes('lait') || lowerName.includes('yaourt') || lowerName.includes('fromage') || lowerName.includes('crème')) {
      return 'Produits laitiers'
    }
    if (lowerName.includes('pain') || lowerName.includes('farine') || lowerName.includes('pâte')) {
      return 'Céréales'
    }
    if (lowerName.includes('pomme') || lowerName.includes('banane') || lowerName.includes('tomate') || lowerName.includes('carotte') || lowerName.includes('salade')) {
      return 'Légumes'
    }
    if (lowerName.includes('poulet') || lowerName.includes('boeuf') || lowerName.includes('poisson') || lowerName.includes('saumon')) {
      return 'Viandes'
    }
    if (lowerName.includes('sel') || lowerName.includes('poivre') || lowerName.includes('épices')) {
      return 'Épices et condiments'
    }
    
    return 'Autres'
  }

  // Parser une quantité (ex: "200 g" -> { amount: 200, unit: "g" })
  private parseQuantity(quantity: string): { amount: number; unit: string } | null {
    const match = quantity.match(/^([\d.]+)\s*(.+)$/)
    if (!match) return null
    
    const amount = parseFloat(match[1])
    const unit = match[2].trim()
    
    return isNaN(amount) ? null : { amount, unit }
  }

  // Normaliser un nom d'ingrédient (minuscules, sans accents, sans espaces multiples)
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim()
  }

  // Normaliser une unité (minuscules, sans espaces, standardisation)
  private normalizeUnit(unit: string): string {
    const normalized = unit
      .toLowerCase()
      .replace(/\s+/g, '') // Supprimer tous les espaces
      .trim()

    // Standardiser les unités communes
    const unitMap: { [key: string]: string } = {
      'g': 'g',
      'gramme': 'g',
      'grammes': 'g',
      'kg': 'kg',
      'kilogramme': 'kg',
      'kilogrammes': 'kg',
      'l': 'l',
      'litre': 'l',
      'litres': 'l',
      'ml': 'ml',
      'millilitre': 'ml',
      'millilitres': 'ml',
      'c.a.s': 'c.a.s',
      'c_a_s': 'c.a.s',
      'cas': 'c.a.s',
      'cuillereasoupe': 'c.a.s',
      'cuillereasoupes': 'c.a.s',
      'c.a.c': 'c.a.c',
      'c_a_c': 'c.a.c',
      'cac': 'c.a.c',
      'cuillereacafe': 'c.a.c',
      'cuillereacafes': 'c.a.c',
      'unite': 'unité',
      'unites': 'unité',
      'pcs': 'unité',
      'piece': 'unité',
      'pieces': 'unité',
    }

    return unitMap[normalized] || normalized
  }
}

// Instance singleton
export const shoppingListService = new ShoppingListService() 