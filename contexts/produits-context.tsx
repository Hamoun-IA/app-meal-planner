"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Produit {
  id: string
  nom: string
  categorie: string
  unit: string
  createdAt: string
  updatedAt: string
}

interface ProduitsContextType {
  produits: Produit[]
  addProduit: (produit: Omit<Produit, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateProduit: (id: string, produit: Partial<Produit>) => Promise<void>
  deleteProduit: (id: string) => Promise<void>
  getProduitById: (id: string) => Produit | undefined
  isLoading: boolean
  error: string | null
  refreshProduits: () => Promise<void>
}

const ProduitsContext = createContext<ProduitsContextType | undefined>(undefined)

// Fonction pour convertir ShoppingItem API response en Produit
const convertShoppingItemToProduit = (item: any): Produit => {
  return {
    id: item.id,
    nom: item.name,
    categorie: item.category?.name || "Autres",
    unit: item.unit || "PIECE", // Valeur par défaut si pas d'unité
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export function ProduitsProvider({ children }: { children: ReactNode }) {
  const [produits, setProduits] = useState<Produit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les produits depuis l'API
  const loadProduits = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/shopping-items')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits')
      }
      
      const result = await response.json()
      const convertedProduits = result.data.map(convertShoppingItemToProduit)
      setProduits(convertedProduits)
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error)
      setError("Impossible de charger les produits")
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les produits au démarrage
  useEffect(() => {
    loadProduits()
  }, [])

  const addProduit = async (newProduit: Omit<Produit, "id" | "createdAt" | "updatedAt">) => {
    try {
      setError(null)
      
      // Trouver la catégorie correspondante
      const categoriesResponse = await fetch('/api/shopping-items/categories')
      if (!categoriesResponse.ok) {
        throw new Error('Erreur lors de la récupération des catégories')
      }
      
      const categoriesResult = await categoriesResponse.json()
      const category = categoriesResult.data.find((cat: any) => cat.name === newProduit.categorie)
      
      const response = await fetch('/api/shopping-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProduit.nom,
          categoryId: category?.id,
          unit: newProduit.unit,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du produit')
      }

      const result = await response.json()
      const newProduitConverted = convertShoppingItemToProduit(result.data)
      setProduits(prev => [...prev, newProduitConverted])
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error)
      throw error
    }
  }

  const updateProduit = async (id: string, updates: Partial<Produit>) => {
    try {
      setError(null)
      
      // Trouver la catégorie correspondante si elle a changé
      let categoryId = undefined
      if (updates.categorie) {
        const categoriesResponse = await fetch('/api/shopping-items/categories')
        if (categoriesResponse.ok) {
          const categoriesResult = await categoriesResponse.json()
          const category = categoriesResult.data.find((cat: any) => cat.name === updates.categorie)
          categoryId = category?.id
        }
      }
      
      const response = await fetch(`/api/shopping-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updates.nom,
          categoryId: categoryId,
          unit: updates.unit,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la modification du produit')
      }

      const result = await response.json()
      const updatedProduit = convertShoppingItemToProduit(result.data)
      setProduits(prev => prev.map(p => p.id === id ? updatedProduit : p))
    } catch (error) {
      console.error("Erreur lors de la modification du produit:", error)
      throw error
    }
  }

  const deleteProduit = async (id: string) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/shopping-items/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression du produit')
      }

      setProduits(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error)
      throw error
    }
  }

  const getProduitById = (id: string) => {
    return produits.find(p => p.id === id)
  }

  const refreshProduits = async () => {
    await loadProduits()
  }

  const value: ProduitsContextType = {
    produits,
    addProduit,
    updateProduit,
    deleteProduit,
    getProduitById,
    isLoading,
    error,
    refreshProduits,
  }

  return (
    <ProduitsContext.Provider value={value}>
      {children}
    </ProduitsContext.Provider>
  )
}

export function useProduits() {
  const context = useContext(ProduitsContext)
  if (context === undefined) {
    throw new Error('useProduits must be used within a ProduitsProvider')
  }
  return context
}
