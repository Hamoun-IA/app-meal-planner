"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiService } from "@/lib/services/api-service"

export interface Recette {
  id: string
  name: string
  description?: string
  category?: string
  difficulty?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  imageUrl?: string
  ingredients?: Array<{ ingredient: { name: string }; quantity: number; unit: string }>
  instructions?: string[]
  tips?: string
  liked?: boolean
  createdAt?: string
  updatedAt?: string
}

interface RecettesContextType {
  recettes: Recette[]
  addRecette: (recette: Omit<Recette, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateRecette: (id: string, recette: Partial<Recette>) => Promise<void>
  deleteRecette: (id: string) => Promise<void>
  getRecetteById: (id: string) => Recette | undefined
  toggleLike: (id: string) => Promise<void>
  isLoading: boolean
  error: string | null
  refreshRecettes: () => Promise<void>
}

const RecettesContext = createContext<RecettesContextType | undefined>(undefined)

export function RecettesProvider({ children }: { children: ReactNode }) {
  const [recettes, setRecettes] = useState<Recette[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRecettes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.getRecettes()
      
      if (response.error) {
        setError(response.error)
        console.error('Erreur lors du chargement des recettes:', response.error)
      } else if (response.data) {
        // Transformer les données de l'API pour correspondre à notre interface
        const transformedRecettes = response.data.recipes.map((recipe: any) => ({
          id: recipe.id,
          name: recipe.name,
          description: recipe.tips || '',
          category: recipe.dishType || 'Autres',
          difficulty: recipe.difficulty || 'FACILE',
          prepTime: recipe.prepTime || 0,
          cookTime: recipe.cookTime || 0,
          servings: recipe.servings || 4, // Utiliser la valeur de la DB ou 4 par défaut
          imageUrl: recipe.imageUrl || '/placeholder.svg?height=400&width=600',
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          tips: recipe.tips || '',
          liked: recipe.liked || false, // Utiliser la valeur de la DB
          createdAt: recipe.createdAt || new Date().toISOString(),
          updatedAt: recipe.updatedAt || new Date().toISOString(),
        }))
        
        setRecettes(transformedRecettes)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Erreur lors du chargement des recettes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les recettes au démarrage
  useEffect(() => {
    loadRecettes()
  }, [])

  const addRecette = async (newRecette: Omit<Recette, "id" | "createdAt" | "updatedAt">) => {
    try {
      setError(null)
      
      // Transformer les données pour l'API
      const apiData = {
        name: newRecette.name,
        prepTime: newRecette.prepTime || 0,
        cookTime: newRecette.cookTime || 0,
        difficulty: newRecette.difficulty || 'FACILE',
        dishType: newRecette.category || 'PLAT_PRINCIPAL',
        instructions: newRecette.instructions || [],
        tips: newRecette.tips || '',
        ingredients: newRecette.ingredients?.map(ing => ({
          ingredientId: ing.ingredient.id || '',
          quantity: ing.quantity,
          unit: ing.unit,
        })) || [],
      }

      const response = await apiService.createRecette(apiData)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      } else if (response.data) {
        // Recharger les recettes pour avoir les données fraîches
        await loadRecettes()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création'
      setError(errorMessage)
      throw error
    }
  }

  const updateRecette = async (id: string, updates: Partial<Recette>) => {
    try {
      setError(null)
      
      const response = await apiService.updateRecette(id, updates)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      } else {
        // Recharger les recettes
        await loadRecettes()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      setError(errorMessage)
      throw error
    }
  }

  const deleteRecette = async (id: string) => {
    try {
      setError(null)
      
      const response = await apiService.deleteRecette(id)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      } else {
        // Recharger les recettes
        await loadRecettes()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression'
      setError(errorMessage)
      throw error
    }
  }

  const getRecetteById = (id: string) => {
    return recettes.find((recette) => recette.id === id)
  }

  const toggleLike = async (id: string) => {
    try {
      setError(null)
      
      const response = await apiService.toggleLikeRecette(id)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      } else if (response.data) {
        // Recharger les recettes pour avoir les données fraîches
        await loadRecettes()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du toggle like'
      setError(errorMessage)
      console.error('Erreur lors du toggle like:', error)
    }
  }

  const refreshRecettes = async () => {
    await loadRecettes()
  }

  return (
    <RecettesContext.Provider
      value={{
        recettes,
        addRecette,
        updateRecette,
        deleteRecette,
        getRecetteById,
        toggleLike,
        isLoading,
        error,
        refreshRecettes,
      }}
    >
      {children}
    </RecettesContext.Provider>
  )
}

export function useRecettes() {
  const context = useContext(RecettesContext)
  if (context === undefined) {
    throw new Error("useRecettes must be used within a RecettesProvider")
  }
  return context
}
