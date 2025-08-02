"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { ArrowLeft, Plus, ShoppingCart, Trash2, Settings, X, Check, Edit2, Package } from "lucide-react"
import { useState } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"
import { useProduits } from "@/contexts/produits-context"

export default function CoursesPage() {
  const [newItem, setNewItem] = useState("")
  const [newQuantity, setNewQuantity] = useState("")
  const [selectedProduit, setSelectedProduit] = useState("")
  const [newCategory, setNewCategory] = useState("") // Declare newCategory variable
  const { produits } = useProduits()

  const [categories, setCategories] = useState([
    "Produits laitiers",
    "Boulangerie",
    "Fruits & Légumes",
    "Épicerie sucrée",
    "Viande & Poisson",
    "Surgelés",
    "Boissons",
    "Hygiène & Beauté",
    "Entretien",
    "Divers",
  ])

  const [items, setItems] = useState([
    { id: 1, name: "Lait", completed: false, category: "Produits laitiers", quantity: "1 Litre" },
    { id: 2, name: "Pain", completed: false, category: "Boulangerie", quantity: "2 Unité" },
    { id: 3, name: "Pommes", completed: false, category: "Fruits & Légumes", quantity: "1 Kilogramme" },
    { id: 4, name: "Chocolat", completed: false, category: "Épicerie sucrée", quantity: "200 Gramme" },
    { id: 5, name: "Yaourts", completed: false, category: "Produits laitiers", quantity: "4 Unité" },
  ])

  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("Divers")

  const { playBackSound, playClickSound } = useAppSoundsSimple()

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const addItem = () => {
    if (!selectedProduit || !newQuantity.trim()) return

    playClickSound()
    const produit = produits.find((p) => p.id === Number.parseInt(selectedProduit))
    if (!produit) return

    const newQuantityNum = Number.parseFloat(newQuantity)
    if (isNaN(newQuantityNum)) return

    // Vérifier s'il existe déjà un article avec le même nom et type de quantité (non coché)
    const existingItemIndex = items.findIndex(
      (item) => item.name === produit.nom && item.quantity.includes(produit.typeQuantite) && !item.completed,
    )

    if (existingItemIndex !== -1) {
      // Fusionner avec l'article existant
      const existingItem = items[existingItemIndex]
      const existingQuantityMatch = existingItem.quantity.match(/^([\d.]+)/)
      const existingQuantityNum = existingQuantityMatch ? Number.parseFloat(existingQuantityMatch[1]) : 0

      const totalQuantity = existingQuantityNum + newQuantityNum

      const updatedItems = [...items]
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: `${totalQuantity} ${produit.typeQuantite}`,
      }

      setItems(updatedItems)
    } else {
      // Créer un nouvel article
      const item = {
        id: Date.now(),
        name: produit.nom,
        completed: false,
        category: produit.categorie,
        quantity: `${newQuantity} ${produit.typeQuantite}`,
      }

      setItems([...items, item])
    }

    setSelectedProduit("")
    setNewQuantity("")
  }

  const toggleItem = (id: number) => {
    playClickSound()
    const item = items.find((item) => item.id === id)
    if (item && !item.completed) {
      // Animation de disparition puis suppression après un délai
      setItems(items.map((item) => (item.id === id ? { ...item, completed: true } : item)))

      // Supprimer l'article après 500ms pour laisser le temps à l'animation
      setTimeout(() => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
      }, 500)
    }
  }

  const deleteItem = (id: number) => {
    playClickSound()
    setItems(items.filter((item) => item.id !== id))
  }

  // Gestion des catégories
  const addCategory = () => {
    if (!newCategory.trim() || categories.includes(newCategory)) return

    playClickSound()
    setCategories([...categories, newCategory])
    setNewCategory("")
  }

  const deleteCategory = (categoryToDelete: string) => {
    if (categoryToDelete === "Divers") return // Empêcher la suppression de "Divers"

    playClickSound()

    // Déplacer tous les articles de cette catégorie vers "Divers"
    setItems(items.map((item) => (item.category === categoryToDelete ? { ...item, category: "Divers" } : item)))

    // Supprimer la catégorie
    setCategories(categories.filter((cat) => cat !== categoryToDelete))

    // Si c'était la catégorie sélectionnée, basculer vers "Divers"
    if (selectedCategory === categoryToDelete) {
      setSelectedCategory("Divers")
    }
  }

  const startEditCategory = (category: string) => {
    playClickSound()
    setEditingCategory(category)
    setEditCategoryName(category)
  }

  const saveEditCategory = () => {
    if (!editCategoryName.trim() || editCategoryName === editingCategory) {
      setEditingCategory(null)
      return
    }

    if (categories.includes(editCategoryName)) {
      alert("Cette catégorie existe déjà !")
      return
    }

    playClickSound()

    // Mettre à jour le nom de la catégorie
    setCategories(categories.map((cat) => (cat === editingCategory ? editCategoryName : cat)))

    // Mettre à jour les articles avec le nouveau nom de catégorie
    setItems(items.map((item) => (item.category === editingCategory ? { ...item, category: editCategoryName } : item)))

    // Mettre à jour la catégorie sélectionnée si nécessaire
    if (selectedCategory === editingCategory) {
      setSelectedCategory(editCategoryName)
    }

    setEditingCategory(null)
    setEditCategoryName("")
  }

  const cancelEditCategory = () => {
    playClickSound()
    setEditingCategory(null)
    setEditCategoryName("")
  }

  // Filtrer les articles pour ne montrer que ceux non cochés
  const activeItems = items.filter((item) => !item.completed)
  const completedCount = items.filter((item) => item.completed).length
  const totalCount = items.length

  // Catégories qui ont des articles actifs - ORDRE FIXE basé sur le tableau categories
  const activeCategoriesSet = new Set(activeItems.map((item) => item.category))
  const displayedCategories = categories.filter((category) => activeCategoriesSet.has(category))

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

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => {
                playClickSound()
                setShowCategoryManager(!showCategoryManager)
              }}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Catégories
            </Button>

            <Button
              asChild
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
              onMouseDown={() => playClickSound()}
            >
              <Link href="/courses/gestion">
                <Package className="w-4 h-4 mr-2" />
                Gérer les produits
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Category Manager */}
        {showCategoryManager && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Gestion des catégories</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  playClickSound()
                  setShowCategoryManager(false)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

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
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Categories list */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {editingCategory === category ? (
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
                        <span className="font-medium text-gray-800">{category}</span>
                        <span className="text-sm text-gray-500">
                          ({activeItems.filter((item) => item.category === category).length} articles)
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditCategory(category)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        {category !== "Divers" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCategory(category)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Item */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 animate-fade-in-up">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={selectedProduit}
                onChange={(e) => {
                  playClickSound()
                  setSelectedProduit(e.target.value)
                }}
                className="px-4 py-2 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none bg-white"
              >
                <option value="">Choisir un produit</option>
                {produits.map((produit) => (
                  <option key={produit.id} value={produit.id}>
                    {produit.nom} ({produit.categorie})
                  </option>
                ))}
              </select>
              <Input
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                placeholder="Quantité (ex: 2)"
                className="border-pink-200 focus:border-pink-400"
                onKeyPress={(e) => e.key === "Enter" && addItem()}
              />
              <Button
                onClick={addItem}
                disabled={!selectedProduit || !newQuantity.trim()}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
            {selectedProduit && (
              <div className="text-sm text-gray-600">
                Type de quantité:{" "}
                <span className="font-medium text-pink-600">
                  {produits.find((p) => p.id === Number.parseInt(selectedProduit))?.typeQuantite}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Shopping List by Category */}
        <div className="space-y-4">
          {displayedCategories.map((category, categoryIndex) => {
            const categoryItems = activeItems.filter((item) => item.category === category)

            return (
              <div
                key={category}
                className="bg-white rounded-2xl shadow-lg p-4 animate-fade-in-up"
                style={{ animationDelay: `${(categoryIndex + 2) * 0.1}s` }}
              >
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mr-2"></span>
                  {category}
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
                        onCheckedChange={() => toggleItem(item.id)}
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
                        onClick={() => deleteItem(item.id)}
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

        {activeItems.length === 0 && (
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
    </div>
  )
}
