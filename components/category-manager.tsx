"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Check, Edit2, Trash2 } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export function CategoryManager({ isOpen, onClose, title = "Gestion des catégories" }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategories()

  const { playClickSound } = useAppSoundsSimple()

  // Gestion des catégories avec l'API
  const addCategory = async () => {
    if (!newCategory.trim()) return

    playClickSound()
    const result = await createCategory({ name: newCategory.trim() })
    if (result) {
      setNewCategory("")
    }
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (categoryName === "Autres") return // Empêcher la suppression de "Autres"

    playClickSound()
    await deleteCategory(categoryId)
  }

  const startEditCategory = (categoryId: string, categoryName: string) => {
    playClickSound()
    setEditingCategory(categoryId)
    setEditCategoryName(categoryName)
  }

  const saveEditCategory = async () => {
    if (!editCategoryName.trim() || !editingCategory) {
      setEditingCategory(null)
      return
    }

    playClickSound()
    const result = await updateCategory(editingCategory, { name: editCategoryName.trim() })
    if (result) {
      setEditingCategory(null)
      setEditCategoryName("")
    }
  }

  const cancelEditCategory = () => {
    playClickSound()
    setEditingCategory(null)
    setEditCategoryName("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              playClickSound()
              onClose()
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {categoriesError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{categoriesError}</p>
          </div>
        )}

        {/* Add new category */}
        <div className="flex space-x-3 mb-4">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nouvelle catégorie..."
            className="flex-1 border-pink-200 focus:border-pink-400"
            onKeyPress={(e) => e.key === "Enter" && addCategory()}
          />
          <Button
            onClick={addCategory}
            disabled={categoriesLoading}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Categories list */}
        <div className="space-y-2">
          {categoriesLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Chargement des catégories...</p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {editingCategory === category.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="flex-1 h-8 border-pink-200 focus:border-pink-400"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") saveEditCategory()
                        if (e.key === "Escape") cancelEditCategory()
                      }}
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveEditCategory}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditCategory}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <span className="w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"></span>
                      <span className="font-medium text-gray-800">{category.name}</span>
                      {category._count && (
                        <span className="text-xs text-gray-400">
                          ({category._count.ingredients} ingrédients, {category._count.shoppingItems} courses)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditCategory(category.id, category.name)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      {category.name !== "Autres" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {categories.length === 0 && !categoriesLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune catégorie trouvée</p>
            <p className="text-sm text-gray-400 mt-2">Créez votre première catégorie ci-dessus</p>
          </div>
        )}
      </div>
    </div>
  )
} 