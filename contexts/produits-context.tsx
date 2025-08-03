"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Produit {
  id: string
  nom: string
  categorie: string
  typeQuantite: string
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
    typeQuantite: "Unité", // Valeur par défaut car ShoppingItem n'a pas de typeQuantite
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
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du produit')
      }

      const result = await response.json()
      const produit = convertShoppingItemToProduit(result.data)
      setProduits(prev => [...prev, produit])
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error)
      setError("Impossible d'ajouter le produit")
      throw error
    }
  }

  const updateProduit = async (id: string, updates: Partial<Produit>) => {
    try {
      setError(null)
      
      // Trouver la catégorie correspondante si elle a changé
      let categoryId: string | undefined
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
          categoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du produit')
      }

      const result = await response.json()
      const updatedProduit = convertShoppingItemToProduit(result.data)
      setProduits(prev =>
        prev.map(produit =>
          produit.id === id ? updatedProduit : produit,
        ),
      )
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error)
      setError("Impossible de mettre à jour le produit")
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

      setProduits(prev => prev.filter(produit => produit.id !== id))
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error)
      setError("Impossible de supprimer le produit")
      throw error
    }
  }

  const getProduitById = (id: string) => {
    return produits.find(produit => produit.id === id)
  }

  const refreshProduits = async () => {
    await loadProduits()
  }

  return (
    <ProduitsContext.Provider
      value={{
        produits,
        addProduit,
        updateProduit,
        deleteProduit,
        getProduitById,
        isLoading,
        error,
        refreshProduits,
      }}
    >
      {children}
    </ProduitsContext.Provider>
  )
}

export function useProduits() {
  const context = useContext(ProduitsContext)
  if (context === undefined) {
    throw new Error("useProduits must be used within a ProduitsProvider")
  }
  return context
}
