import { useState, useEffect } from 'react'
import { shoppingListService, ShoppingListItem } from '@/lib/services/shopping-list-service'

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Charger les articles au montage du composant
  useEffect(() => {
    const loadItems = () => {
      try {
        // Charger les articles
        const storedItems = shoppingListService.getItems()
        setItems(storedItems)
      } catch (error) {
        console.error('Erreur lors du chargement des articles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [])

  // Ajouter un article
  const addItem = (item: Omit<ShoppingListItem, 'id'>) => {
    shoppingListService.addItem(item)
    setItems(shoppingListService.getItems())
  }

  // Ajouter des articles depuis une recette
  const addItemsFromRecipe = (recipeItems: Array<{ name: string; quantity: number; unit: string }>, recipeName: string) => {
    shoppingListService.addItemsFromRecipe(recipeItems, recipeName)
    setItems(shoppingListService.getItems())
  }

  // Marquer un article comme terminé
  const toggleItem = (id: string) => {
    shoppingListService.toggleItem(id)
    setItems(shoppingListService.getItems())
  }

  // Supprimer un article
  const removeItem = (id: string) => {
    shoppingListService.removeItem(id)
    setItems(shoppingListService.getItems())
  }

  // Vider la liste
  const clearList = () => {
    shoppingListService.clearList()
    setItems([])
  }

  // Récupérer les articles actifs (non terminés)
  const activeItems = items.filter(item => !item.completed)
  
  // Récupérer les articles terminés
  const completedItems = items.filter(item => item.completed)

  return {
    items,
    activeItems,
    completedItems,
    isLoading,
    addItem,
    addItemsFromRecipe,
    toggleItem,
    removeItem,
    clearList
  }
} 