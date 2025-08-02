"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Plus, Edit2, Trash2, Search, Package, Filter, X, Check, Settings } from "lucide-react"
import { useState } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"
import { useProduits } from "@/contexts/produits-context"

export default function GestionProduitsPage() {
  const { playBackSound, playClickSound } = useAppSoundsSimple()
  const { produits, addProduit, updateProduit, deleteProduit, isLoading } = useProduits()

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [editingProduit, setEditingProduit] = useState<number | null>(null)
  const [filterCategory, setFilterCategory] = useState("")

  const [formData, setFormData] = useState({
    nom: "",
    categorie: "",
    typeQuantite: "",
  })

  const categories = [
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
  ]

  const typesQuantite = ["Unité", "Gramme", "Kilogramme", "Litre", "Millilitre", "Paquet", "Boîte", "Sachet"]

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      categorie: "",
      typeQuantite: "",
    })
  }

  const handleAddProduit = () => {
    playClickSound()

    if (!formData.nom.trim() || !formData.categorie || !formData.typeQuantite) {
      alert("Tous les champs sont obligatoires !")
      return
    }

    addProduit({
      nom: formData.nom.trim(),
      categorie: formData.categorie,
      typeQuantite: formData.typeQuantite,
    })

    resetForm()
    setShowAddModal(false)
  }

  const handleEditProduit = (id: number) => {
    playClickSound()
    const produit = produits.find((p) => p.id === id)
    if (produit) {
      setFormData({
        nom: produit.nom,
        categorie: produit.categorie,
        typeQuantite: produit.typeQuantite,
      })
      setEditingProduit(id)
      setShowEditModal(true)
    }
  }

  const handleUpdateProduit = () => {
    playClickSound()

    if (!formData.nom.trim() || !formData.categorie || !formData.typeQuantite || !editingProduit) {
      alert("Tous les champs sont obligatoires !")
      return
    }

    updateProduit(editingProduit, {
      nom: formData.nom.trim(),
      categorie: formData.categorie,
      typeQuantite: formData.typeQuantite,
    })

    resetForm()
    setShowEditModal(false)
    setEditingProduit(null)
  }

  const handleDeleteProduit = (id: number) => {
    playClickSound()
    deleteProduit(id)
    setShowDeleteConfirm(null)
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                >
                  <option value="">Choisir une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de quantité *</label>
                <select
                  value={formData.typeQuantite}
                  onChange={(e) => setFormData({ ...formData, typeQuantite: e.target.value })}
                  className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                >
                  <option value="">Choisir un type</option>
                  {typesQuantite.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddProduit}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                >
                  <option value="">Choisir une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de quantité *</label>
                <select
                  value={formData.typeQuantite}
                  onChange={(e) => setFormData({ ...formData, typeQuantite: e.target.value })}
                  className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                >
                  <option value="">Choisir un type</option>
                  {typesQuantite.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpdateProduit}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Supprimer le produit ?</h3>
              <p className="text-gray-600 mb-6">
                Cette action est irréversible. Es-tu sûre de vouloir supprimer ce produit ?
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    playClickSound()
                    setShowDeleteConfirm(null)
                  }}
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => handleDeleteProduit(showDeleteConfirm)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  Supprimer
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
              <Settings className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-white font-semibold text-xl">Gestion des produits</h1>
                <p className="text-white/80 text-sm">
                  {produits.length} produit{produits.length > 1 ? "s" : ""} enregistré{produits.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={openAddModal}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un produit... 🔍"
                className="pl-10 rounded-full border-pink-200 focus:border-pink-400"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => {
                  playClickSound()
                  setFilterCategory(e.target.value)
                }}
                className="px-4 py-2 border border-pink-200 rounded-full focus:border-pink-400 focus:outline-none bg-white min-w-[200px]"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {filterCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    playClickSound()
                    setFilterCategory("")
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div
          className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-pink-100 to-rose-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Produit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Catégorie</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Type de quantité</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProduits.map((produit, index) => (
                  <tr
                    key={produit.id}
                    className="hover:bg-pink-25 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-800">{produit.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-700">
                        {produit.categorie}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-medium">{produit.typeQuantite}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduit(produit.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            playClickSound()
                            setShowDeleteConfirm(produit.id)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProduits.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">Aucun produit trouvé 📦</p>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterCategory
                  ? "Essaie avec d'autres critères !"
                  : "Commence par ajouter ton premier produit !"}
              </p>
              <Button
                onClick={openAddModal}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        {filteredProduits.length > 0 && (
          <div
            className="bg-white rounded-2xl shadow-lg p-6 mt-6 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{produits.length}</div>
                <div className="text-sm text-gray-600">Produits total</div>
              </div>
              <div className="text-center p-4 bg-rose-50 rounded-lg">
                <div className="text-2xl font-bold text-rose-600">{new Set(produits.map((p) => p.categorie)).size}</div>
                <div className="text-sm text-gray-600">Catégories</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">
                  {new Set(produits.map((p) => p.typeQuantite)).size}
                </div>
                <div className="text-sm text-gray-600">Types de quantité</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
