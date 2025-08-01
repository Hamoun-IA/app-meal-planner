"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  Trash2,
  Edit2,
  Settings,
  X,
  Check,
  Database,
} from "lucide-react";
import { useState } from "react";
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple";
import { useCourses } from "@/contexts/courses-context";
import { useIngredientSuggestions } from "@/hooks/use-ingredient-suggestions";
import { IngredientAutocomplete } from "@/components/ui/ingredient-autocomplete";

export default function CoursesPage() {
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedItemCategory, setSelectedItemCategory] = useState<string>("");

  const { 
    items, 
    categories, 
    addItem, 
    toggleItem, 
    deleteItem, 
    addCategory, 
    deleteCategory, 
    updateCategory,
    getCompletedCount,
    getTotalCount
  } = useCourses();

  const { playBackSound, playClickSound } = useAppSoundsSimple();

  const handleBackClick = () => {
    console.log("Back button clicked!");
    playBackSound();
  };

  const { suggestionsWithCategories } = useIngredientSuggestions(newItem);

  const handleSelectWithCategory = (name: string, category: string) => {
    setSelectedItemCategory(category);
    // Le menu se ferme automatiquement grâce au composant IngredientAutocomplete
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;

    playClickSound();
    
    // Utiliser la catégorie sélectionnée si disponible, sinon chercher dans les suggestions
    let category = selectedItemCategory;
    if (!category) {
      const existingSuggestion = suggestionsWithCategories.find(
        suggestion => suggestion.name.toLowerCase() === newItem.trim().toLowerCase()
      );
      category = existingSuggestion ? existingSuggestion.category : "";
    }
    
    addItem({
      name: newItem,
      completed: false,
      category: category,
    });
    setNewItem("");
    setSelectedItemCategory("");
  };

  const handleToggleItem = (id: number) => {
    playClickSound();
    toggleItem(id);
  };

  const handleDeleteItem = (id: number) => {
    playClickSound();
    deleteItem(id);
  };

  // Gestion des catégories
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;

    playClickSound();
    addCategory(newCategory);
    setNewCategory("");
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    playClickSound();
    deleteCategory(categoryToDelete);
  };

  const handleEditCategory = (category: string) => {
    playClickSound();
    setEditingCategory(category);
    setEditCategoryName(category);
  };

  const saveEditCategory = () => {
    if (!editCategoryName.trim()) return;

    playClickSound();
    updateCategory(editingCategory!, editCategoryName);

    setEditingCategory(null);
    setEditCategoryName("");
  };

  const cancelEditCategory = () => {
    playClickSound();
    setEditingCategory(null);
    setEditCategoryName("");
  };

  const completedCount = getCompletedCount();
  const totalCount = getTotalCount();

  const displayedCategories = categories.filter((category) =>
    items.some((item) => item.category === category)
  );

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
                <h1 className="text-white font-semibold text-xl">
                  Liste de courses
                </h1>
                <p className="text-white/80 text-sm">
                  {totalCount} articles
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                playClickSound();
                setShowCategoryManager(!showCategoryManager);
              }}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Catégories
            </Button>
            <Button
              asChild
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
            >
              <Link href="/courses/gestion">
                <Database className="w-4 h-4 mr-2" />
                Gérer
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
              <h3 className="text-lg font-semibold text-gray-800">
                Gestion des catégories
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  playClickSound();
                  setShowCategoryManager(false);
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
                onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
              />
                              <Button
                  onClick={handleAddCategory}
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
                          if (e.key === "Enter") saveEditCategory();
                          if (e.key === "Escape") cancelEditCategory();
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
                        <span className="font-medium text-gray-800">
                          {category}
                        </span>
                        <span className="text-sm text-gray-500">
                          (
                          {
                            items.filter((item) => item.category === category)
                              .length
                          }{" "}
                          articles)
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        {category !== "Divers" && (
                                                  <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
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
            {/* Champ de recherche avec autosuggestion */}
            <div className="flex-1">
              <IngredientAutocomplete
                value={newItem}
                onChange={setNewItem}
                placeholder="Ajouter un ingrédient..."
                onSelectWithCategory={handleSelectWithCategory}
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Seuls les ingrédients déjà enregistrés sont proposés. Pour ajouter un nouvel article, utilisez la page de gestion.
              </p>
            </div>
            
            {/* Bouton d'ajout */}
            <Button
              onClick={handleAddItem}
              className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Shopping List by Category */}
        <div className="space-y-4">
          {displayedCategories.map((category, categoryIndex) => {
            const categoryItems = items.filter(
              (item) => item.category === category // Plus besoin de filtrer les items complétés
            );

            // Ne pas afficher les catégories vides
            if (categoryItems.length === 0) {
              return null;
            }

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
                    ({categoryItems.length} articles)
                  </span>
                </h3>

                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                      />
                      
                      <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-1">
                            <span className="text-gray-800">
                              {item.name}
                            </span>
                            {item.quantity && (
                              <span className="text-sm text-pink-600 font-medium">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                          {item.source && (
                            <div className="text-xs text-gray-400 mt-1">
                              {item.source.split(', ').map((source, index) => (
                                <span key={index} className="inline-block bg-gray-100 rounded px-1 mr-1 mb-1">
                                  {source}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Ta liste est vide ! 🛒</p>
            <p className="text-gray-500">
              Ajoute tes premiers articles ci-dessus ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
