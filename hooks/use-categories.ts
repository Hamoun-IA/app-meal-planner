import { useState, useEffect } from 'react'

export interface Category {
  id: string
  name: string
  _count?: {
    ingredients: number
    shoppingItems: number
  }
}

export interface CategoryCreateInput {
  name: string
}

export interface CategoryUpdateInput {
  name: string
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger toutes les catégories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
    const response = await fetch(`${apiUrl}/categories`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des catégories')
      }
      
      const data = await response.json()
      setCategories(data.data.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur lors du chargement des catégories:', err)
    } finally {
      setLoading(false)
    }
  }

  // Créer une nouvelle catégorie
  const createCategory = async (input: CategoryCreateInput): Promise<Category | null> => {
    try {
      setError(null)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
    const response = await fetch(`${apiUrl}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de la catégorie')
      }

      const data = await response.json()
      const newCategory = data.data
      
      setCategories(prev => [...prev, newCategory])
      return newCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
      console.error('Erreur lors de la création de la catégorie:', err)
      return null
    }
  }

  // Mettre à jour une catégorie
  const updateCategory = async (id: string, input: CategoryUpdateInput): Promise<Category | null> => {
    try {
      setError(null)
      
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la catégorie')
      }

      const data = await response.json()
      const updatedCategory = data.data
      
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat))
      return updatedCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      console.error('Erreur lors de la mise à jour de la catégorie:', err)
      return null
    }
  }

  // Supprimer une catégorie
  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression de la catégorie')
      }

      setCategories(prev => prev.filter(cat => cat.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      console.error('Erreur lors de la suppression de la catégorie:', err)
      return false
    }
  }

  // Obtenir une catégorie par ID
  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(cat => cat.id === id)
  }

  // Obtenir une catégorie par nom
  const getCategoryByName = (name: string): Category | undefined => {
    return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase())
  }

  // Charger les catégories au montage
  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByName,
  }
} 