// Script de test pour la fusion des articles de la liste de courses
// À exécuter dans la console du navigateur

// Simuler le service de liste de courses
class ShoppingListService {
  constructor() {
    this.items = []
  }

  getItems() {
    return this.items
  }

  addItemsFromRecipe(items, recipeName) {
    const newItems = items.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      name: item.name,
      quantity: `${item.quantity} ${item.unit}`,
      category: this.categorizeIngredient(item.name),
      completed: false,
      fromRecipe: recipeName
    }))

    this.items = this.mergeItems(this.items, newItems)
  }

  mergeItems(existing, newItems) {
    const merged = [...existing]
    
    newItems.forEach(newItem => {
      const existingIndex = merged.findIndex(item => 
        this.normalizeName(item.name) === this.normalizeName(newItem.name) && 
        item.category === newItem.category && 
        !item.completed
      )
      
      if (existingIndex !== -1) {
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
          merged.push(newItem)
        }
      } else {
        merged.push(newItem)
      }
    })
    
    return merged
  }

  normalizeName(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  normalizeUnit(unit) {
    const normalized = unit
      .toLowerCase()
      .replace(/\s+/g, '')
      .trim()

    const unitMap = {
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

  parseQuantity(quantity) {
    const match = quantity.match(/^([\d.]+)\s*(.+)$/)
    if (!match) return null
    
    const amount = parseFloat(match[1])
    const unit = match[2].trim()
    
    return isNaN(amount) ? null : { amount, unit }
  }

  categorizeIngredient(name) {
    const lowerName = name.toLowerCase()
    
    if (lowerName.includes('carotte')) {
      return 'Fruits & Légumes'
    }
    if (lowerName.includes('miel')) {
      return 'Épicerie sucrée'
    }
    
    return 'Divers'
  }
}

// Tests
const service = new ShoppingListService()

console.log('=== Test 1: Ajout de carottes ===')
service.addItemsFromRecipe([
  { name: 'Carotte', quantity: 500, unit: 'G' }
], 'Recette 1')
console.log('Après premier ajout:', service.getItems())

service.addItemsFromRecipe([
  { name: 'carotte', quantity: 500, unit: 'G' }
], 'Recette 2')
console.log('Après deuxième ajout:', service.getItems())

console.log('\n=== Test 2: Ajout de miel ===')
service.addItemsFromRecipe([
  { name: 'Miel', quantity: 2, unit: 'C_A_S' }
], 'Recette 3')
console.log('Après premier ajout:', service.getItems())

service.addItemsFromRecipe([
  { name: 'miel', quantity: 2, unit: 'C_A_S' }
], 'Recette 4')
console.log('Après deuxième ajout:', service.getItems())

console.log('\n=== Test 3: Unités différentes ===')
service.addItemsFromRecipe([
  { name: 'Sucre', quantity: 100, unit: 'g' }
], 'Recette 5')
console.log('Après premier ajout:', service.getItems())

service.addItemsFromRecipe([
  { name: 'sucre', quantity: 200, unit: 'grammes' }
], 'Recette 6')
console.log('Après deuxième ajout:', service.getItems()) 