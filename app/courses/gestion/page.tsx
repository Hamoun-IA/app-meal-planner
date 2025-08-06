"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Plus, Edit2, Trash2, Search, Package, Filter, X, Check, Settings, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"
import { useProduits } from "@/contexts/produits-context"
import { useToast } from "@/hooks/use-toast"
import { cleanupLocalStorage, checkLocalStorageData } from "@/lib/utils/cleanup-localStorage"

interface Category {
  id: string
  name: string
}

// Unités de mesure disponibles (basées sur l'enum UnitType)
const units = [
  { value: "G", label: "Gramme (g)" },
  { value: "KG", label: "Kilogramme (kg)" },
  { value: "ML", label: "Millilitre (ml)" },
  { value: "CL", label: "Centilitre (cl)" },
  { value: "L", label: "Litre (l)" },
  { value: "C_A_C", label: "Cuillère à café" },
  { value: "C_A_S", label: "Cuillère à soupe" },
  { value: "PINCEE", label: "Pincée" },
  { value: "POIGNEE", label: "Poignée" },
  { value: "BOUQUET", label: "Bouquet" },
  { value: "GOUTTE", label: "Goutte" },
  { value: "PIECE", label: "Pièce" },
]

export default function GestionProduitsPage() {
  const { playBackSound, playClickSound } = useAppSoundsSimple()
  const { produits, addProduit, updateProduit, deleteProduit, isLoading, error, refreshProduits } = useProduits()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [editingProduit, setEditingProduit] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [formData, setFormData] = useState({
    nom: "",
    categorie: "",
    unit: "",
  })

  // Nettoyer le localStorage au chargement de la page
  useEffect(() => {
    cleanupLocalStorage()
    
    // Vérifier s'il reste des données (pour debug)
    const remainingKeys = checkLocalStorageData()
    if (remainingKeys.length > 0) {
      console.log('⚠️ Données restantes dans localStorage:', remainingKeys)
    }
  }, [])

  // Charger les catégories depuis l'API
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
      const response = await fetch(`${apiUrl}/shopping-items/categories`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des catégories')
      }
      const result = await response.json()
      setCategories(result.data)
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories",
        variant: "destructive",
      })
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Charger les catégories au démarrage
  useEffect(() => {
    loadCategories()
  }, [])

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      categorie: "",
      unit: "",
    })
  }

  const handleAddProduit = async () => {
    playClickSound()

    if (!formData.nom.trim() || !formData.categorie || !formData.unit) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont obligatoires !",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await addProduit({
        nom: formData.nom.trim(),
        categorie: formData.categorie,
        unit: formData.unit,
      })
      
      toast({
        title: "Succès",
        description: "Produit ajouté avec succès !",
      })
      closeModals()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProduit = (id: string) => {
    playClickSound()
    const produit = produits.find((p) => p.id === id)
    if (produit) {
      setFormData({
        nom: produit.nom,
        categorie: produit.categorie,
        unit: produit.unit || "",
      })
      setEditingProduit(id)
      setShowEditModal(true)
    }
  }

  const handleUpdateProduit = async () => {
    playClickSound()

    if (!editingProduit || !formData.nom.trim() || !formData.categorie || !formData.unit) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont obligatoires !",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await updateProduit(editingProduit, {
        nom: formData.nom.trim(),
        categorie: formData.categorie,
        unit: formData.unit,
      })
      
      toast({
        title: "Succès",
        description: "Produit modifié avec succès !",
      })
      closeModals()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le produit",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduit = async (id: string) => {
    playClickSound()
    
    try {
      setIsSubmitting(true)
      await deleteProduit(id)
      
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès !",
      })
      setShowDeleteConfirm(null)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openAddModal = () => {
    playClickSound()
    resetForm()
    setShowAddModal(true)
  }

  const closeModals = () => {
    playClickSound()
    setShowAddModal(false)
    setShowEditModal(false)
    setEditingProduit(null)
    resetForm()
  }

  // Filtrage des produits
  const filteredProduits = produits.filter((produit) => {
    const matchesSearch = produit.nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || produit.categorie === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute top-20 left-20 w-12 h-12 bg-pink-200/30 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-40 right-32 w-8 h-8 bg-rose-200/40 rounded-full blur-lg animate-float-medium delay-1000"></div>

      {/* Error Banner */}
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-4 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refreshProduits()}
            className="ml-4 text-white hover:bg-red-600"
          >
            Réessayer
          </Button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Ajouter un produit</h3>
              <Button variant="ghost" size="sm" onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit *</label>
                <Input
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Lait"
                  className="border-pink-200 focus:border-pink-400"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                  disabled={isSubmitting || categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? "Chargement des catégories..." : "Choisir une catégorie"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unité de mesure *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                  disabled={isSubmitting}
                >
                  <option value="">Choisir une unité</option>
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={closeModals}
                className="flex-1 border-gray-200 hover:bg-gray-50 bg-transparent"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddProduit}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Ajout...
                  </div>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Modifier le produit</h3>
              <Button variant="ghost" size="sm" onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit *</label>
                <Input
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Lait"
                  className="border-pink-200 focus:border-pink-400"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                  disabled={isSubmitting || categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? "Chargement des catégories..." : "Choisir une catégorie"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unité de mesure *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                  disabled={isSubmitting}
                >
                  <option value="">Choisir une unité</option>
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={closeModals}
                className="flex-1 border-gray-200 hover:bg-gray-50 bg-transparent"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpdateProduit}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Modification...
                  </div>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Modifier
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in-up">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Supprimer le produit</h3>
              <p className="text-sm text-gray-500 mb-6">
                Êtes-vous sûr de vouloir supprimer ce produit ? Cette action ne peut pas être annulée.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 border-gray-200 hover:bg-gray-50 bg-transparent"
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => handleDeleteProduit(showDeleteConfirm)}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Suppression...
                    </div>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-rose-400 to-pink-400 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:bg-white/20 active:scale-95 transition-transform duration-100"
              onMouseDown={handleBackClick}
            >
              <Link href="/courses">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-white font-semibold text-xl">Gestion des produits</h1>
                <p className="text-white/80 text-sm">
                  {isLoading ? "Chargement..." : `${produits.length} produit${produits.length > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={openAddModal}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 p-2 md:px-3 md:py-2"
            onMouseDown={() => playClickSound()}
            title="Ajouter un produit"
          >
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Ajouter un produit</span>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un produit..."
                className="pl-10 border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none bg-white"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterCategory("")
                }}
                className="border-gray-200 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        {/* Products List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProduits.map((produit, index) => (
              <div
                key={produit.id}
                className="bg-white rounded-2xl shadow-lg p-4 animate-fade-in-up hover:shadow-xl transition-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">{produit.nom}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">
                        {produit.categorie}
                      </span>
                      {produit.unit && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          {units.find(u => u.value === produit.unit)?.label || produit.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduit(produit.id)}
                      className="text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(produit.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProduits.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Aucun produit trouvé</p>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterCategory ? "Essayez de modifier vos critères de recherche" : "Commencez par ajouter votre premier produit"}
            </p>
            {!searchTerm && !filterCategory && (
              <Button
                onClick={openAddModal}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un produit
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
