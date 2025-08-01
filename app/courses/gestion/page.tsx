"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  Trash2,
  Edit2,
  Settings,
  X,
  Search,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple";
import { useCourses } from "@/contexts/courses-context";
import { IngredientAutocomplete } from "@/components/ui/ingredient-autocomplete";

export default function GestionCoursesPage() {
  const [newItem, setNewItem] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Divers");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Toutes");
  
  // États pour l'édition des items
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQuantity, setEditItemQuantity] = useState("");
  const [editItemCategory, setEditItemCategory] = useState("");

  const { 
    databaseItems, 
    categories, 
    addDatabaseItem, 
    deleteDatabaseItem,
    updateDatabaseItem,
    getDatabaseItem,
    getCompletedCount,
    getTotalCount
  } = useCourses();

  const { playBackSound, playClickSound } = useAppSoundsSimple();

  const handleBackClick = () => {
    console.log("Back button clicked!");
    playBackSound();
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;

    playClickSound();
    addDatabaseItem({
      name: newItem,
      completed: false,
      category: selectedCategory,
    });
    setNewItem("");
  };

  // Fonctions CRUD pour les items
  const startEditItem = (id: number) => {
    const item = getDatabaseItem(id);
    if (item) {
      playClickSound();
      setEditingItem(id);
      setEditItemName(item.name);
      setEditItemQuantity(item.quantity || "");
      setEditItemCategory(item.category);
    }
  };

  const saveEditItem = () => {
    if (!editingItem || !editItemName.trim()) {
      setEditingItem(null);
      return;
    }

    playClickSound();
    updateDatabaseItem(editingItem, {
      name: editItemName.trim(),
      quantity: editItemQuantity.trim() || undefined,
      category: editItemCategory,
    });

    setEditingItem(null);
    setEditItemName("");
    setEditItemQuantity("");
    setEditItemCategory("");
  };

  const cancelEditItem = () => {
    playClickSound();
    setEditingItem(null);
    setEditItemName("");
    setEditItemQuantity("");
    setEditItemCategory("");
  };

  const handleDeleteItem = (id: number) => {
    playClickSound();
    deleteDatabaseItem(id);
  };

  // Filtrage des items - Afficher TOUS les items dans la page de gestion
  const filteredItems = databaseItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "Toutes" || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const completedCount = getCompletedCount();
  const totalCount = getTotalCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute top-20 left-20 w-12 h-12 bg-pink-200/30 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-40 right-32 w-8 h-8 bg-rose-200/40 rounded-full blur-lg animate-float-medium delay-1000"></div>

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
                <h1 className="text-white font-semibold text-xl">
                  Gestion des courses
                </h1>
                <p className="text-white/80 text-sm">
                  {completedCount}/{totalCount} articles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Add Item Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un article</h2>
          <div className="space-y-4">
            {/* Champ de recherche avec autosuggestion */}
            <div className="flex-1">
              <IngredientAutocomplete
                value={newItem}
                onChange={setNewItem}
                placeholder="Nom de l'article... 🛒"
              />
            </div>
            
            {/* Sélecteur de catégorie */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 min-w-fit">
                Catégorie :
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  playClickSound();
                  setSelectedCategory(e.target.value);
                }}
                className="flex-1 px-4 py-2 border border-pink-200 rounded-full focus:border-pink-400 focus:outline-none bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAddItem}
                className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un article..."
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-pink-200 rounded focus:border-pink-400 focus:outline-none bg-white"
              >
                <option value="Toutes">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Liste des articles ({filteredItems.length})</h2>
          
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">Aucun article trouvé ! 🛒</p>
              <p className="text-gray-500">
                Ajoutez des articles ou modifiez vos filtres ✨
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nom</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Quantité</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Catégorie</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {editingItem === item.id ? (
                          <Input
                            value={editItemName}
                            onChange={(e) => setEditItemName(e.target.value)}
                            className="border-pink-200 focus:border-pink-400"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") saveEditItem();
                              if (e.key === "Escape") cancelEditItem();
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="text-gray-800 font-medium">
                            {item.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingItem === item.id ? (
                          <Input
                            value={editItemQuantity}
                            onChange={(e) => setEditItemQuantity(e.target.value)}
                            placeholder="Quantité"
                            className="border-pink-200 focus:border-pink-400"
                          />
                        ) : (
                          <span className="text-gray-600">{item.quantity || "-"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingItem === item.id ? (
                          <select
                            value={editItemCategory}
                            onChange={(e) => setEditItemCategory(e.target.value)}
                            className="border border-pink-200 rounded focus:border-pink-400 focus:outline-none bg-white"
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-block bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                            {item.category}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-500 text-sm">
                          {item.source ? item.source.split(', ')[0] : "Manuel"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {editingItem === item.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={saveEditItem}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditItem}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditItem(item.id)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 