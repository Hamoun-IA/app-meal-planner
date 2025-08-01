"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Clock, Users, Heart, Share2, ChefHat, CheckCircle2, Plus, Minus, Timer, Star } from "lucide-react"
import { useState } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"

// Données de démonstration - en réalité, cela viendrait d'une API ou base de données
const getRecetteById = (id: string) => {
  const recettes = {
    "1": {
      id: 1,
      title: "Cookies aux pépites de chocolat",
      image: "/placeholder.svg?height=400&width=600",
      time: "25 min",
      prepTime: "15 min",
      cookTime: "10 min",
      servings: 4,
      difficulty: "Facile",
      liked: true,
      category: "Dessert",
      rating: 4.8,
      description:
        "Des cookies moelleux et croustillants avec de délicieuses pépites de chocolat. La recette parfaite pour un goûter gourmand !",
      ingredients: [
        { name: "Farine", quantity: "200g", checked: false },
        { name: "Beurre mou", quantity: "100g", checked: false },
        { name: "Sucre brun", quantity: "80g", checked: false },
        { name: "Sucre blanc", quantity: "50g", checked: false },
        { name: "Œuf", quantity: "1", checked: false },
        { name: "Pépites de chocolat", quantity: "150g", checked: false },
        { name: "Levure chimique", quantity: "1 c.à.c", checked: false },
        { name: "Sel", quantity: "1 pincée", checked: false },
        { name: "Extrait de vanille", quantity: "1 c.à.c", checked: false },
      ],
      instructions: [
        {
          step: 1,
          text: "Préchauffer le four à 180°C. Dans un saladier, mélanger le beurre mou avec les deux sucres jusqu'à obtenir une texture crémeuse.",
          completed: false,
        },
        {
          step: 2,
          text: "Ajouter l'œuf et l'extrait de vanille, bien mélanger.",
          completed: false,
        },
        {
          step: 3,
          text: "Dans un autre bol, mélanger la farine, la levure et le sel. Incorporer ce mélange sec à la préparation humide.",
          completed: false,
        },
        {
          step: 4,
          text: "Ajouter les pépites de chocolat et mélanger délicatement.",
          completed: false,
        },
        {
          step: 5,
          text: "Former des boules de pâte et les disposer sur une plaque recouverte de papier sulfurisé, en laissant de l'espace entre chaque cookie.",
          completed: false,
        },
        {
          step: 6,
          text: "Enfourner pendant 10-12 minutes jusqu'à ce que les bords soient dorés. Laisser refroidir sur la plaque 5 minutes avant de transférer sur une grille.",
          completed: false,
        },
      ],
      tips: [
        "Pour des cookies plus moelleux, ne pas trop les cuire",
        "Tu peux remplacer les pépites par des chunks de chocolat",
        "La pâte peut être préparée à l'avance et conservée au frigo",
      ],
      nutrition: {
        calories: "280 kcal",
        protein: "4g",
        carbs: "35g",
        fat: "14g",
      },
    },
  }

  return recettes[id as keyof typeof recettes] || null
}

interface RecettePageProps {
  params: {
    id: string
  }
}

export default function RecettePage({ params }: RecettePageProps) {
  const { playBackSound, playClickSound } = useAppSoundsSimple()
  const [servings, setServings] = useState(4)
  const [ingredients, setIngredients] = useState<Array<{ name: string; quantity: string; checked: boolean }>>([])
  const [instructions, setInstructions] = useState<Array<{ step: number; text: string; completed: boolean }>>([])
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState<"ingredients" | "instructions" | "tips">("ingredients")

  const recette = getRecetteById(params.id)

  // Initialiser les états avec les données de la recette
  useState(() => {
    if (recette) {
      setIngredients(recette.ingredients)
      setInstructions(recette.instructions)
      setIsLiked(recette.liked)
      setServings(recette.servings)
    }
  })

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const handleLikeClick = () => {
    playClickSound()
    setIsLiked(!isLiked)
  }

  const handleIngredientCheck = (index: number) => {
    playClickSound()
    setIngredients((prev) =>
      prev.map((ingredient, i) => (i === index ? { ...ingredient, checked: !ingredient.checked } : ingredient)),
    )
  }

  const handleInstructionComplete = (index: number) => {
    playClickSound()
    setInstructions((prev) =>
      prev.map((instruction, i) => (i === index ? { ...instruction, completed: !instruction.completed } : instruction)),
    )
  }

  const adjustServings = (change: number) => {
    playClickSound()
    const newServings = Math.max(1, servings + change)
    setServings(newServings)
  }

  if (!recette) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">Recette non trouvée 🥺</p>
          <Button asChild className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500">
            <Link href="/recettes">Retour aux recettes</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100">
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
              <Link href="/recettes">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <ChefHat className="w-6 h-6 text-white" />
              <h1 className="text-white font-semibold text-xl">Recette</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleLikeClick} className="text-white hover:bg-white/20 p-2">
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current text-red-300" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 animate-fade-in-up">
          <div className="relative">
            <img
              src={recette.image || "/placeholder.svg"}
              alt={recette.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {recette.category}
              </span>
            </div>
            <div className="absolute bottom-4 right-4 flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{recette.rating}</span>
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{recette.title}</h1>
            <p className="text-gray-600 mb-4">{recette.description}</p>

            {/* Recipe Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <Clock className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold text-gray-800">{recette.time}</p>
              </div>
              <div className="text-center p-3 bg-rose-50 rounded-lg">
                <Timer className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Préparation</p>
                <p className="font-semibold text-gray-800">{recette.prepTime}</p>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <Users className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Portions</p>
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustServings(-1)}
                    className="h-6 w-6 p-0 hover:bg-pink-200"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="font-semibold text-gray-800 min-w-[2rem] text-center">{servings}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustServings(1)}
                    className="h-6 w-6 p-0 hover:bg-pink-200"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="text-center p-3 bg-rose-50 rounded-lg">
                <ChefHat className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Difficulté</p>
                <p className="font-semibold text-gray-800">{recette.difficulty}</p>
              </div>
            </div>

            {/* Nutrition Info */}
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Informations nutritionnelles (par portion)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Calories</p>
                  <p className="font-semibold">{recette.nutrition.calories}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Protéines</p>
                  <p className="font-semibold">{recette.nutrition.protein}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Glucides</p>
                  <p className="font-semibold">{recette.nutrition.carbs}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Lipides</p>
                  <p className="font-semibold">{recette.nutrition.fat}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex border-b border-gray-200">
            {[
              { key: "ingredients", label: "Ingrédients", icon: "🥄" },
              { key: "instructions", label: "Instructions", icon: "📝" },
              { key: "tips", label: "Conseils", icon: "💡" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  playClickSound()
                  setActiveTab(tab.key as typeof activeTab)
                }}
                className={`flex-1 p-4 text-center font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-pink-600 border-b-2 border-pink-500 bg-pink-50"
                    : "text-gray-600 hover:text-pink-500 hover:bg-pink-25"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Ingredients Tab */}
            {activeTab === "ingredients" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Ingrédients pour {servings} portion{servings > 1 ? "s" : ""}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {ingredients.filter((i) => i.checked).length}/{ingredients.length} cochés
                  </span>
                </div>
                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    onClick={() => handleIngredientCheck(index)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                      ingredient.checked
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 hover:bg-pink-50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        ingredient.checked ? "bg-green-500 border-green-500" : "border-gray-300"
                      }`}
                    >
                      {ingredient.checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`flex-1 ${ingredient.checked ? "line-through text-gray-500" : "text-gray-800"}`}>
                      {ingredient.name}
                    </span>
                    <span
                      className={`font-medium ${ingredient.checked ? "line-through text-gray-500" : "text-pink-600"}`}
                    >
                      {ingredient.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Instructions Tab */}
            {activeTab === "instructions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Instructions</h3>
                  <span className="text-sm text-gray-500">
                    {instructions.filter((i) => i.completed).length}/{instructions.length} terminées
                  </span>
                </div>
                {instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all ${
                      instruction.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:border-pink-200"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleInstructionComplete(index)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                          instruction.completed
                            ? "bg-green-500 border-green-500"
                            : "border-pink-300 hover:border-pink-500"
                        }`}
                      >
                        {instruction.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-sm font-medium text-pink-600">{instruction.step}</span>
                        )}
                      </button>
                      <p
                        className={`text-gray-800 leading-relaxed ${
                          instruction.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {instruction.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tips Tab */}
            {activeTab === "tips" && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Conseils de chef 👩‍🍳</h3>
                {recette.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <span className="text-yellow-600 text-lg">💡</span>
                    <p className="text-gray-800">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter à ma liste de courses
            </Button>
            <Button variant="outline" className="border-pink-200 hover:bg-pink-50 bg-transparent">
              <Timer className="w-4 h-4 mr-2" />
              Démarrer le minuteur
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
