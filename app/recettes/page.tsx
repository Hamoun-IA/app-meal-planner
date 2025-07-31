"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, ChefHat, Clock, Heart, Search, Users } from "lucide-react"
import { useState } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"

export default function RecettesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { playBackSound } = useAppSoundsSimple()

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

  const filteredRecettes = recettes.filter(
    (recette) =>
      recette.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recette.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 animate-fade-in-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une recette... 🍳"
              className="pl-10 rounded-full border-pink-200 focus:border-pink-400"
            />
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecettes.map((recette, index) => (
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
                  <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">{recette.difficulty}</span>
                </div>

                <Button className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                  Voir la recette
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredRecettes.length === 0 && (
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
