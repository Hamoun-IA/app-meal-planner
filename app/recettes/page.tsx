"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Heart,
  Search,
  Users,
  Grid3X3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"
import { useRecettes } from "@/contexts/recettes-context"

export default function RecettesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { playBackSound, playClickSound } = useAppSoundsSimple()
  const { recettes, deleteRecette, toggleLike, isLoading, error } = useRecettes()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"alphabetical" | "time" | "date" | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState({
    difficulty: [] as string[],
    category: [] as string[],
  })
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedFilter, setExpandedFilter] = useState<"difficulty" | "category" | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const handleDeleteRecette = async (id: string) => {
    try {
      playClickSound()
      await deleteRecette(id)
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleLikeToggle = async (id: string) => {
    try {
      playClickSound()
      await toggleLike(id)
    } catch (error) {
      console.error('Erreur lors du toggle like:', error)
    }
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType as keyof typeof prev].includes(value)
        ? prev[filterType as keyof typeof prev].filter((item: string) => item !== value)
        : [...prev[filterType as keyof typeof prev], value],
    }))
  }

  const clearFilters = () => {
    setFilters({
      difficulty: [],
      category: [],
    })
  }

  const filteredRecettes = recettes.filter((recette) => {
    const matchesSearch =
      recette.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recette.category && recette.category.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDifficulty = filters.difficulty.length === 0 || (recette.difficulty && filters.difficulty.includes(recette.difficulty))
    const matchesCategory = filters.category.length === 0 || (recette.category && filters.category.includes(recette.category))

    return matchesSearch && matchesDifficulty && matchesCategory
  })

  const filteredAndSortedRecettes = filteredRecettes.sort((a, b) => {
    if (!sortBy) return 0

    let comparison = 0

    if (sortBy === "alphabetical") {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy === "time") {
      const timeA = (a.prepTime || 0) + (a.cookTime || 0)
      const timeB = (b.prepTime || 0) + (b.cookTime || 0)
      comparison = timeA - timeB
    } else if (sortBy === "date") {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      comparison = dateA - dateB
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  const handleSort = (criteria: "alphabetical" | "time" | "date") => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(criteria)
      setSortOrder("asc")
    }
  }

  const toggleFilterExpansion = (filterType: "difficulty" | "category") => {
    setExpandedFilter(expandedFilter === filterType ? null : filterType)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute top-20 left-20 w-12 h-12 bg-pink-200/30 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-40 right-32 w-8 h-8 bg-rose-200/40 rounded-full blur-lg animate-float-medium delay-1000"></div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Supprimer la recette ?</h3>
              <p className="text-gray-600 mb-6">
                Cette action est irréversible. Es-tu sûre de vouloir supprimer cette recette ?
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
                  onClick={() => handleDeleteRecette(showDeleteConfirm)}
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
      <div className="bg-gradient-to-r from-pink-400 to-rose-400 p-4 shadow-lg">
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
              <ChefHat className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-white font-semibold text-xl">Mes Recettes</h1>
                <p className="text-white/80 text-sm">
                  {recettes.length} recette{recettes.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Add Recipe Button */}
            <Button
              asChild
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 p-2 md:px-3 md:py-2"
              title="Ajouter une recette"
            >
              <Link href="/recettes/ajouter">
                <Plus className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Ajouter</span>
              </Link>
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-white/20 rounded-full p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  playClickSound()
                  setViewMode("grid")
                }}
                className={`rounded-full p-2 transition-all ${
                  viewMode === "grid" ? "bg-white/30 text-white" : "text-white/70 hover:text-white hover:bg-white/20"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  playClickSound()
                  setViewMode("list")
                }}
                className={`rounded-full p-2 transition-all ${
                  viewMode === "list" ? "bg-white/30 text-white" : "text-white/70 hover:text-white hover:bg-white/20"
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Search Bar with Filter Button */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 animate-fade-in-up">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une recette... 🍳"
                className="pl-10 rounded-full border-pink-200 focus:border-pink-400"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                playClickSound()
                setShowMobileFilters(!showMobileFilters)
              }}
              className="flex-shrink-0 p-3 border-pink-200 hover:bg-pink-50 rounded-full relative"
            >
              <Filter className="w-4 h-4" />
              {(sortBy || filters.difficulty.length > 0 || filters.category.length > 0) && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(sortBy ? 1 : 0) + filters.difficulty.length + filters.category.length}
                </span>
              )}
            </Button>
          </div>

          {/* Quick indicators */}
          {(sortBy || filters.difficulty.length > 0 || filters.category.length > 0) && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
              {sortBy && (
                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs flex items-center">
                  {sortBy === "alphabetical" ? "A-Z" : sortBy === "time" ? "Temps" : "Date"}
                  {sortOrder === "asc" ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />}
                </span>
              )}
              {filters.difficulty.length > 0 && (
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                  {filters.difficulty.length} difficulté{filters.difficulty.length > 1 ? "s" : ""}
                </span>
              )}
              {filters.category.length > 0 && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  {filters.category.length} catégorie{filters.category.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {/* Expandable Filter/Sort Panel */}
          {showMobileFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-fade-in-up">
              {/* Sort Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Trier par
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort("alphabetical")}
                    className={`transition-all px-3 py-2 h-auto ${
                      sortBy === "alphabetical"
                        ? "bg-pink-100 border-pink-300 text-pink-700"
                        : "border-gray-200 hover:bg-pink-50"
                    }`}
                  >
                    <span className="mr-2">A-Z</span>
                    {sortBy === "alphabetical" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 ml-1" />
                      ) : (
                        <ArrowDown className="w-3 h-3 ml-1" />
                      ))}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort("time")}
                    className={`transition-all px-3 py-2 h-auto ${
                      sortBy === "time"
                        ? "bg-pink-100 border-pink-300 text-pink-700"
                        : "border-gray-200 hover:bg-pink-50"
                    }`}
                  >
                    <Clock className="w-3 h-3 mr-2" />
                    <span className="mr-1">Temps</span>
                    {sortBy === "time" &&
                      (sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort("date")}
                    className={`transition-all px-3 py-2 h-auto ${
                      sortBy === "date"
                        ? "bg-pink-100 border-pink-300 text-pink-700"
                        : "border-gray-200 hover:bg-pink-50"
                    }`}
                  >
                    <span className="mr-1">Date</span>
                    {sortBy === "date" &&
                      (sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </Button>
                </div>
                {sortBy && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      playClickSound()
                      setSortBy(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 mt-2 w-full"
                  >
                    Réinitialiser le tri
                  </Button>
                )}
              </div>

              {/* Compact Filter Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </h4>

                {/* Filter Type Buttons */}
                <div className="space-y-3">
                  {/* Filter Toggle Buttons - Side by side */}
                  <div className="flex flex-wrap gap-2">
                    {/* Difficulty Filter Toggle */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        playClickSound()
                        toggleFilterExpansion("difficulty")
                      }}
                      className={`justify-between transition-all px-3 py-2 h-auto ${
                        filters.difficulty.length > 0
                          ? "bg-purple-50 border-purple-200 text-purple-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center">
                        Difficulté
                        {filters.difficulty.length > 0 && (
                          <span className="ml-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {filters.difficulty.length}
                          </span>
                        )}
                      </span>
                      {expandedFilter === "difficulty" ? (
                        <ChevronUp className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-2" />
                      )}
                    </Button>

                    {/* Category Filter Toggle */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        playClickSound()
                        toggleFilterExpansion("category")
                      }}
                      className={`justify-between transition-all px-3 py-2 h-auto ${
                        filters.category.length > 0
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center">
                        Type de plat
                        {filters.category.length > 0 && (
                          <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {filters.category.length}
                          </span>
                        )}
                      </span>
                      {expandedFilter === "category" ? (
                        <ChevronUp className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-2" />
                      )}
                    </Button>
                  </div>

                  {/* Difficulty Options */}
                  {expandedFilter === "difficulty" && (
                    <div className="flex flex-wrap gap-2 pl-4 animate-fade-in-up">
                      {["Très facile", "Facile", "Moyen", "Difficile"].map((difficulty) => (
                        <Button
                          key={difficulty}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            playClickSound()
                            handleFilterChange("difficulty", difficulty)
                          }}
                          className={`transition-all text-xs px-3 py-1 h-auto ${
                            filters.difficulty.includes(difficulty)
                              ? "bg-purple-100 border-purple-300 text-purple-700"
                              : "border-gray-200 hover:bg-purple-50"
                          }`}
                        >
                          {difficulty}
                          {filters.difficulty.includes(difficulty) && <span className="ml-1 text-purple-500">✓</span>}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Category Options */}
                  {expandedFilter === "category" && (
                    <div className="flex flex-wrap gap-2 pl-4 animate-fade-in-up">
                      {["Dessert", "Plat principal", "Petit-déjeuner", "Entrée", "Apéritif", "Boisson"].map(
                        (category) => (
                          <Button
                            key={category}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              playClickSound()
                              handleFilterChange("category", category)
                            }}
                            className={`transition-all text-xs px-3 py-1 h-auto ${
                              filters.category.includes(category)
                                ? "bg-blue-100 border-blue-300 text-blue-700"
                                : "border-gray-200 hover:bg-blue-50"
                            }`}
                          >
                            {category}
                            {filters.category.includes(category) && <span className="ml-1 text-blue-500">✓</span>}
                          </Button>
                        ),
                      )}
                    </div>
                  )}
                </div>

                {/* Clear Filters Button */}
                {(filters.difficulty.length > 0 || filters.category.length > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      playClickSound()
                      clearFilters()
                    }}
                    className="text-gray-500 hover:text-gray-700 w-full mt-3"
                  >
                    Effacer tous les filtres
                  </Button>
                )}
              </div>

              {/* Close button */}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    playClickSound()
                    setShowMobileFilters(false)
                  }}
                  className="w-full text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Recipe Display */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des recettes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 text-lg mb-2">Erreur lors du chargement</p>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              Réessayer
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          // Mode Grille
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedRecettes.map((recette, index) => (
              <div
                key={recette.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img
                    src={recette.imageUrl || "/placeholder.svg?height=200&width=300&query=recette"}
                    alt={recette.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => handleLikeToggle(recette.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${recette.liked ? "text-pink-500 fill-current" : "text-gray-400"}`} />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {recette.category}
                    </span>
                  </div>
                  {/* Action buttons */}
                  <div className="absolute top-3 left-3 flex space-x-2">
                    <Button asChild size="sm" variant="ghost" className="p-2 bg-white/80 hover:bg-white rounded-full">
                      <Link href={`/recettes/${recette.id}/modifier`}>
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        playClickSound()
                        setShowDeleteConfirm(recette.id)
                      }}
                      className="p-2 bg-white/80 hover:bg-white rounded-full"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{recette.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {(recette.prepTime || 0) + (recette.cookTime || 0)}{" "}
                        min
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{recette.servings} pers.</span>
                    </div>
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                      {recette.difficulty}
                    </span>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    <Link href={`/recettes/${recette.id}`}>Voir la recette</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Mode Liste
          <div className="space-y-4">
            {filteredAndSortedRecettes.map((recette, index) => (
              <div
                key={recette.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in-up relative group sm:hover:shadow-xl"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Lien cliquable sur mobile qui couvre toute la carte */}
                <Link 
                  href={`/recettes/${recette.id}`}
                  className="absolute inset-0 z-10 sm:hidden"
                  onClick={() => playClickSound()}
                />
                
                <div className="flex items-center p-3 sm:p-4">
                  <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 mr-3 sm:mr-4">
                    <img
                      src={recette.imageUrl || "/placeholder.svg?height=80&width=80&query=recette"}
                      alt={recette.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => handleLikeToggle(recette.id)}
                      className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <Heart className={`w-3 h-3 ${recette.liked ? "text-pink-500 fill-current" : "text-gray-400"}`} />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-1 truncate">{recette.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {(recette.prepTime || 0) + (recette.cookTime || 0)}{" "}
                              min
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{recette.servings} pers.</span>
                          </div>
                          <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                            {recette.difficulty}
                          </span>
                        </div>
                        <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {recette.category}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 flex-shrink-0 relative z-20">
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 sm:p-2"
                        >
                          <Link href={`/recettes/${recette.id}/modifier`}>
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            playClickSound()
                            setShowDeleteConfirm(recette.id)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        {/* Bouton "Voir" caché sur mobile, visible sur desktop */}
                        <Button
                          asChild
                          size="sm"
                          className="hidden sm:flex bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-600 flex-shrink-0 text-sm px-3"
                        >
                          <Link href={`/recettes/${recette.id}`}>Voir</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAndSortedRecettes.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Aucune recette trouvée 🥺</p>
            <p className="text-gray-500 mb-4">Essaie avec d'autres mots-clés !</p>
            <Button
              asChild
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              <Link href="/recettes/ajouter">
                <Plus className="w-4 h-4 mr-2" />
                Créer ta première recette
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
