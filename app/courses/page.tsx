"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { ArrowLeft, Plus, ShoppingCart, Trash2, Settings, Check, Package, ChevronDown } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"
import { useProduits } from "@/contexts/produits-context"
import { useShoppingList } from "@/hooks/use-shopping-list"
import { useCategories } from "@/hooks/use-categories"
import { CategoryManager } from "@/components/category-manager"
import { Autocomplete } from "@/components/ui/autocomplete"

interface Ingredient {
  id: string
  name: string
  category?: {
    id: string
    name: string
  }
  units: string[]
}

export default function CoursesPage() {
  const [newItem, setNewItem] = useState("")
  const [newQuantity, setNewQuantity] = useState("")
  const [selectedProduit, setSelectedProduit] = useState("")
  const [selectedProduitId, setSelectedProduitId] = useState("")
  const [selectedType, setSelectedType] = useState<"shopping" | "ingredient">("shopping")
  const [selectedUnit, setSelectedUnit] = useState("")
  const [showUnitDropdown, setShowUnitDropdown] = useState(false)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [ingredientsLoading, setIngredientsLoading] = useState(false)
  
  const { produits } = useProduits()
  const { activeItems, toggleItem, removeItem, addItem, isLoading: shoppingLoading } = useShoppingList()
  const { categories, loading: categoriesLoading } = useCategories()

  const [showCategoryManager, setShowCategoryManager] = useState(false)

  const { playBackSound, playClickSound } = useAppSoundsSimple()

  // Charger les ingrédients depuis l'API
  useEffect(() => {
    const loadIngredients = async () => {
      setIngredientsLoading(true)
      try {
        const response = await fetch("/api/ingredients")
        if (response.ok) {
          const data = await response.json()
          setIngredients(data.data || [])
        }
      } catch (error) {
        console.error("Erreur lors du chargement des ingrédients:", error)
      } finally {
        setIngredientsLoading(false)
      }
    }

    loadIngredients()
  }, [])

  // Convertir les produits et ingrédients en options pour l'autocomplete
  const produitOptions = useMemo(() => {
    const shoppingOptions = produits.map((produit) => ({
      id: `shopping_${produit.id}`,
      label: produit.nom,
      description: `${produit.categorie} (Produit)`,
      type: "shopping" as const,
      originalId: produit.id,
    }))

    const ingredientOptions = ingredients.map((ingredient) => ({
      id: `ingredient_${ingredient.id}`,
      label: ingredient.name,
      description: `${ingredient.category?.name || "Sans catégorie"} (Ingrédient)`,
      type: "ingredient" as const,
      originalId: ingredient.id,
    }))

    return [...shoppingOptions, ...ingredientOptions]
  }, [produits, ingredients])

  // Obtenir les unités disponibles pour l'élément sélectionné
  const getAvailableUnits = () => {
    if (!selectedProduitId) return []
    
    if (selectedType === "shopping") {
      const produit = produits.find((p) => p.id === selectedProduitId)
      return produit?.unit ? [produit.unit] : []
    } else {
      const ingredient = ingredients.find((i) => i.id === selectedProduitId)
      return ingredient?.units || []
    }
  }

  // Réinitialiser l'unité sélectionnée quand le produit change
  useEffect(() => {
    const availableUnits = getAvailableUnits()
    if (availableUnits.length > 0) {
      setSelectedUnit(availableUnits[0])
    } else {
      setSelectedUnit("")
    }
    setShowUnitDropdown(false)
  }, [selectedProduitId, selectedType])

  // Organiser l'affichage des catégories avec les articles - utilisation de useMemo pour éviter les re-rendus
  const { displayedCategories, groupedItems } = useMemo(() => {
    if (categoriesLoading || shoppingLoading) {
      return { displayedCategories: [], groupedItems: {} }
    }

    // Grouper les articles par catégorie
    const grouped = activeItems.reduce((groups, item) => {
      const category = item.category || 'Autres'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    }, {} as Record<string, typeof activeItems>)

    // Créer la liste des catégories à afficher - uniquement celles qui ont des articles
    // Utiliser les catégories existantes de la DB qui correspondent aux articles
    const categoriesToDisplay = categories
      .filter(category => grouped[category.name] && grouped[category.name].length > 0)
      .map(category => ({
        id: category.id,
        name: category.name,
        itemCount: grouped[category.name]?.length || 0
      }))

    // Ajouter les catégories qui ne sont pas dans la DB mais qui ont des articles
    const dbCategoryNames = new Set(categories.map(cat => cat.name))
    const missingCategories = Object.keys(grouped)
      .filter(categoryName => !dbCategoryNames.has(categoryName) && grouped[categoryName].length > 0)
      .map(categoryName => ({
        id: categoryName, // Utiliser le nom comme ID temporaire
        name: categoryName,
        itemCount: grouped[categoryName].length
      }))

    return {
      displayedCategories: [...categoriesToDisplay, ...missingCategories],
      groupedItems: grouped
    }
  }, [activeItems, categories, categoriesLoading, shoppingLoading])

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const handleProduitSelect = (option: { 
    id: string; 
    label: string; 
    description?: string;
    type: "shopping" | "ingredient";
    originalId: string;
  }) => {
    playClickSound()
    setSelectedProduit(option.label)
    setSelectedProduitId(option.originalId)
    setSelectedType(option.type)
  }

  const handleUnitSelect = (unit: string) => {
    setSelectedUnit(unit)
    setShowUnitDropdown(false)
    playClickSound()
  }

  const addItemFromProduit = () => {
    if (!selectedProduitId || !newQuantity.trim() || !selectedUnit) return

    playClickSound()
    
    let itemName = ""
    let itemCategory = ""
    let itemQuantity = ""

    if (selectedType === "shopping") {
      const produit = produits.find((p) => p.id === selectedProduitId)
      if (!produit) return

      itemName = produit.nom
      itemCategory = produit.categorie
      itemQuantity = `${newQuantity} ${selectedUnit}`
    } else {
      const ingredient = ingredients.find((i) => i.id === selectedProduitId)
      if (!ingredient) return

      itemName = ingredient.name
      itemCategory = ingredient.category?.name || "Ingrédients"
      itemQuantity = `${newQuantity} ${selectedUnit}`
    }

    // Ajouter l'article via le service
    addItem({
      name: itemName,
      quantity: itemQuantity,
      category: itemCategory,
      completed: false
    })

    setSelectedProduit("")
    setSelectedProduitId("")
    setSelectedType("shopping")
    setSelectedUnit("")
    setNewQuantity("")
  }

  const handleToggleItem = (id: string) => {
    playClickSound()
    toggleItem(id)
  }

  const handleDeleteItem = (id: string) => {
    playClickSound()
    removeItem(id)
  }

  // Compter les articles terminés (ceux qui ne sont plus dans activeItems)
  const completedCount = 0 // Les articles terminés sont automatiquement supprimés par le service
  const totalCount = activeItems.length

  const availableUnits = getAvailableUnits()
  const hasMultipleUnits = availableUnits.length > 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute top-20 left-20 w-12 h-12 bg-pink-200/30 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-40 right-32 w-8 h-8 bg-rose-200/40 rounded-full blur-lg animate-float-medium delay-1000"></div>

      {/* Header */}
      <div className="bg-gradient-to-r from-rose-400 to-pink-400 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:bg-white/20 active:scale-95 transition-transform duration-100"
              onMouseDown={handleBackClick}
            >
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-white font-semibold text-xl">Liste de courses</h1>
                <p className="text-white/80 text-sm">
                  {activeItems.length} articles restants
                  {completedCount > 0 && (
                    <span className="ml-2 text-white/60">
                      ({completedCount} terminé{completedCount > 1 ? "s" : ""})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
            <Button
              onClick={() => {
                playClickSound()
                setShowCategoryManager(true)
              }}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 p-2 md:px-3 md:py-2"
              title="Gérer les catégories"
            >
              <Settings className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Catégories</span>
            </Button>

            <Button
              asChild
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 p-2 md:px-3 md:py-2"
              onMouseDown={() => playClickSound()}
              title="Gérer les produits"
            >
              <Link href="/courses/gestion">
                <Package className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Gérer les produits</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Add Item */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 animate-fade-in-up">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Autocomplete
                  options={produitOptions}
                  value={selectedProduit}
                  onValueChange={setSelectedProduit}
                  onSelect={handleProduitSelect}
                  placeholder="Rechercher un produit ou ingrédient..."
                  disabled={produits.length === 0 && ingredients.length === 0}
                  maxSuggestions={8}
                />
              </div>
              <Input
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                placeholder="Quantité"
                className="border-pink-200 focus:border-pink-400"
                onKeyPress={(e) => e.key === "Enter" && addItemFromProduit()}
              />
              {selectedProduitId && (
                <div className="relative">
                  {hasMultipleUnits ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUnitDropdown(!showUnitDropdown)
                          playClickSound()
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {selectedUnit}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUnitDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showUnitDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                          {availableUnits.map((unit) => (
                            <button
                              key={unit}
                              onClick={() => handleUnitSelect(unit)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                              <span className="text-sm font-medium text-gray-700">{unit}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedUnit}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <Button
                onClick={addItemFromProduit}
                disabled={!selectedProduitId || !newQuantity.trim() || !selectedUnit}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {(shoppingLoading || categoriesLoading || ingredientsLoading) && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la liste de courses...</p>
          </div>
        )}

        {/* Shopping List by Category */}
        {!shoppingLoading && !categoriesLoading && !ingredientsLoading && (
          <div className="space-y-4">
            {displayedCategories.map((category, categoryIndex) => {
              const categoryItems = groupedItems[category.name] || []

              return (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl shadow-lg p-4 animate-fade-in-up"
                  style={{ animationDelay: `${(categoryIndex + 2) * 0.1}s` }}
                >
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mr-2"></span>
                    {category.name}
                    <span className="ml-2 text-sm text-gray-500">
                      ({categoryItems.length} article{categoryItems.length > 1 ? "s" : ""})
                    </span>
                  </h3>

                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                          item.completed ? "bg-green-50 opacity-50 scale-95 transform" : "hover:bg-gray-50"
                        }`}
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleToggleItem(item.id)}
                          className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                        />
                        <div className="flex-1 flex items-center space-x-2">
                          <span className={`${item.completed ? "line-through text-gray-500" : "text-gray-800"}`}>
                            {item.name}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.completed
                                ? "bg-gray-100 text-gray-500"
                                : "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border border-pink-200"
                            }`}
                          >
                            {item.quantity}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeItems.length === 0 && !shoppingLoading && !categoriesLoading && !ingredientsLoading && (
          <div className="text-center py-12">
            <div className="mb-6">
              {completedCount > 0 ? (
                <>
                  <Check className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <p className="text-green-600 text-lg font-semibold">Courses terminées ! 🎉</p>
                  <p className="text-gray-500 mb-4">
                    Tu as coché {completedCount} article{completedCount > 1 ? "s" : ""} ✨
                  </p>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">Ta liste est vide ! 🛒</p>
                  <p className="text-gray-500 mb-4">Ajoute tes premiers articles ci-dessus ✨</p>
                </>
              )}
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              <Link href="/courses/gestion">
                <Settings className="w-4 h-4 mr-2" />
                Gérer les produits
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        title="Gestion des catégories"
      />
    </div>
  )
}
