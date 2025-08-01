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
} from "lucide-react"
import { useState } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"

export default function RecettesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { playBackSound } = useAppSoundsSimple()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"alphabetical" | "time" | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState({
    difficulty: [] as string[],
    category: [] as string[],
  })
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedFilter, setExpandedFilter] = useState<"difficulty" | "category" | null>(null)

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const recettes = [
    {
      id: 1,
      title: "Cookies aux pépites de chocolat",
      image: "/placeholder.svg?height=200&width=300",
      time: "25 min",
      servings: 4,
      difficulty: "Facile",
      liked: true,
      category: "Dessert",
    },
    {
      id: 2,
      title: "Salade de quinoa aux légumes",
      image: "/placeholder.svg?height=200&width=300",
      time: "15 min",
      servings: 2,
      difficulty: "Facile",
      liked: false,
      category: "Plat principal",
    },
    {
      id: 3,
      title: "Smoothie bowl aux fruits rouges",
      image: "/placeholder.svg?height=200&width=300",
      time: "10 min",
      servings: 1,
      difficulty: "Très facile",
      liked: true,
      category: "Petit-déjeuner",
    },
    {
      id: 4,
      title: "Pasta à la crème et champignons",
      image: "/placeholder.svg?height=200&width=300",
      time: "30 min",
      servings: 3,
      difficulty: "Moyen",
      liked: false,
      category: "Plat principal",
    },
  ]

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
      recette.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recette.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDifficulty = filters.difficulty.length === 0 || filters.difficulty.includes(recette.difficulty)
    const matchesCategory = filters.category.length === 0 || filters.category.includes(recette.category)

    return matchesSearch && matchesDifficulty && matchesCategory
  })

  const filteredAndSortedRecettes = filteredRecettes.sort((a, b) => {
    if (!sortBy) return 0

    let comparison = 0

    if (sortBy === "alphabetical") {
      comparison = a.title.localeCompare(b.title)
    } else if (sortBy === "time") {
      const timeA = Number.parseInt(a.time.replace(" min", ""))
      const timeB = Number.parseInt(b.time.replace(" min", ""))
      comparison = timeA - timeB
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  const handleSort = (criteria: "alphabetical" | "time") => {
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
              <h1 className="text-white font-semibold text-xl">Mes Recettes</h1>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white/20 rounded-full p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-full p-2 transition-all ${
                viewMode === "grid" ? "bg-white/30 text-white" : "text-white/70 hover:text-white hover:bg-white/20"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-full p-2 transition-all ${
                viewMode === "list" ? "bg-white/30 text-white" : "text-white/70 hover:text-white hover:bg-white/20"
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
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
              onClick={() => setShowMobileFilters(!showMobileFilters)}
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
                  {sortBy === "alphabetical" ? "A-Z" : "Temps"}
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
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort("alphabetical")}
                    className={`transition-all ${
                      sortBy === "alphabetical"
                        ? "bg-pink-100 border-pink-300 text-pink-700"
                        : "border-gray-200 hover:bg-pink-50"
                    }`}
                  >
                    <span className="mr-2">A-Z</span>
                    {sortBy === "alphabetical" &&
                      (sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort("time")}
                    className={`transition-all ${
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
                </div>
                {sortBy && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortBy(null)}
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
                      onClick={() => toggleFilterExpansion("difficulty")}
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
                      onClick={() => toggleFilterExpansion("category")}
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
                          onClick={() => handleFilterChange("difficulty", difficulty)}
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
                            onClick={() => handleFilterChange("category", category)}
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
                    onClick={clearFilters}
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
                  onClick={() => setShowMobileFilters(false)}
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
        {viewMode === "grid" ? (
          // Mode Grille (existant)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedRecettes.map((recette, index) => (
              <div
                key={recette.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img
                    src={recette.image || "/placeholder.svg"}
                    alt={recette.title}
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                    <Heart className={`w-5 h-5 ${recette.liked ? "text-pink-500 fill-current" : "text-gray-400"}`} />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {recette.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{recette.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{recette.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{recette.servings} pers.</span>
                    </div>
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                      {recette.difficulty}
                    </span>
                  </div>

                  <Button className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                    Voir la recette
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Mode Liste (nouveau)
          <div className="space-y-4">
            {filteredAndSortedRecettes.map((recette, index) => (
              <div
                key={recette.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center p-4">
                  <div className="relative flex-shrink-0 w-20 h-20 mr-4">
                    <img
                      src={recette.image || "/placeholder.svg"}
                      alt={recette.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                      <Heart className={`w-3 h-3 ${recette.liked ? "text-pink-500 fill-current" : "text-gray-400"}`} />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">{recette.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{recette.time}</span>
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

                      <Button
                        size="sm"
                        className="ml-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 flex-shrink-0"
                      >
                        Voir
                      </Button>
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
            <p className="text-gray-500">Essaie avec d'autres mots-clés !</p>
          </div>
        )}
      </div>
    </div>
  )
}
