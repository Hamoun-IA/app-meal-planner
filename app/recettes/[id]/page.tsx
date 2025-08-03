"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  Users,
  Heart,
  Share2,
  ChefHat,
  CheckCircle2,
  Plus,
  Minus,
  Timer,
  Edit2,
  Trash2,
  Loader2,
  Camera,
} from "lucide-react"
import { useState, useEffect, use } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"
import { useRecettes } from "@/contexts/recettes-context"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/services/api-service"

interface RecettePageProps {
  params: Promise<{
    id: string
  }>
}

export default function RecettePage({ params }: RecettePageProps) {
  const { playBackSound, playClickSound } = useAppSoundsSimple()
  const { deleteRecette, toggleLike } = useRecettes()
  const router = useRouter()
  const [servings, setServings] = useState(4)
  const [originalServings, setOriginalServings] = useState(4)
  const [ingredients, setIngredients] = useState<Array<{ name: string; quantity: number; unit: string; checked: boolean; originalQuantity: number }>>([])
  const [instructions, setInstructions] = useState<Array<{ text: string; completed: boolean }>>([])
  const [activeTab, setActiveTab] = useState<"ingredients" | "instructions" | "tips">("ingredients")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [recette, setRecette] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Déballer les params avec React.use()
  const { id } = use(params)

  // Charger la recette depuis l'API
  useEffect(() => {
    const loadRecette = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await apiService.getRecetteById(id)
        
        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setRecette(response.data)
          
          // Initialiser les ingrédients avec les quantités originales
          if (response.data.ingredients) {
            setIngredients(response.data.ingredients.map((ing: any) => ({
              name: ing.ingredient.name,
              quantity: ing.quantity,
              unit: ing.unit,
              checked: false,
              originalQuantity: ing.quantity
            })))
          }
          
          // Initialiser les instructions
          if (response.data.instructions) {
            setInstructions(response.data.instructions.map((inst: string) => ({
              text: inst,
              completed: false
            })))
          }
          
          const originalServingsCount = response.data.servings || 4
          setOriginalServings(originalServingsCount)
          setServings(originalServingsCount)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecette()
  }, [id])

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const handleLikeClick = async () => {
    if (recette) {
      try {
        playClickSound()
        await toggleLike(recette.id)
        // Recharger la recette pour avoir l'état à jour
        const response = await apiService.getRecetteById(id)
        if (response.data) {
          setRecette(response.data)
        }
      } catch (error) {
        console.error('Erreur lors du toggle like:', error)
      }
    }
  }

  const handleDeleteRecette = async () => {
    if (recette) {
      try {
        playClickSound()
        await deleteRecette(recette.id)
        router.push("/recettes")
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
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

  // Calculer les quantités ajustées selon le nombre de portions
  const calculateAdjustedQuantity = (originalQuantity: number, currentServings: number, originalServings: number) => {
    const ratio = currentServings / originalServings
    return Math.round(originalQuantity * ratio * 100) / 100 // Arrondir à 2 décimales
  }

  const adjustServings = (change: number) => {
    playClickSound()
    const newServings = Math.max(1, servings + change)
    setServings(newServings)
    
    // Mettre à jour les quantités d'ingrédients selon le nouveau nombre de portions
    setIngredients(prev => prev.map(ingredient => ({
      ...ingredient,
      quantity: calculateAdjustedQuantity(ingredient.originalQuantity, newServings, originalServings)
    })))
  }

  // État de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-pink-500 mb-4" />
          <p className="text-gray-600">Chargement de la recette...</p>
        </div>
      </div>
    )
  }

  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-red-500" />
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
      </div>
    )
  }

  // Recette non trouvée
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
                    setShowDeleteConfirm(false)
                  }}
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  Annuler
                </Button>
                <Button onClick={handleDeleteRecette} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
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
              <Link href="/recettes">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <ChefHat className="w-6 h-6 text-white" />
              <h1 className="text-white font-semibold text-xl">{recette.name}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
              <Link href={`/recettes/${recette.id}/modifier`}>
                <Edit2 className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                playClickSound()
                setShowDeleteConfirm(true)
              }}
              className="text-white hover:bg-white/20 p-2"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLikeClick} className="text-white hover:bg-white/20 p-2">
              <Heart className={`w-5 h-5 ${recette.liked ? "fill-current text-red-300" : ""}`} />
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
              src={recette.imageUrl || "/placeholder.svg?height=400&width=600&query=recette"}
              alt={recette.name}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {recette.dishType || recette.category || 'Autres'}
              </span>
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{recette.name}</h1>
            <p className="text-gray-600 mb-4">{recette.tips || recette.description || ''}</p>

            {/* Recipe Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <Clock className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold text-gray-800">
                  {(recette.prepTime || 0) + (recette.cookTime || 0)} min
                </p>
              </div>
              <div className="text-center p-3 bg-rose-50 rounded-lg">
                <Timer className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Préparation</p>
                <p className="font-semibold text-gray-800">{recette.prepTime || 0} min</p>
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
                  {servings !== originalServings && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        playClickSound()
                        setServings(originalServings)
                        setIngredients(prev => prev.map(ingredient => ({
                          ...ingredient,
                          quantity: ingredient.originalQuantity
                        })))
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 ml-2"
                      title="Réinitialiser aux portions originales"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
              <div className="text-center p-3 bg-rose-50 rounded-lg">
                <ChefHat className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Difficulté</p>
                <p className="font-semibold text-gray-800">{recette.difficulty || 'FACILE'}</p>
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
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Ingrédients pour {servings} portion{servings > 1 ? "s" : ""}
                    </h3>
                    {servings !== originalServings && (
                      <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-medium">
                        Quantités ajustées
                      </span>
                    )}
                  </div>
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
                      {ingredient.quantity} {ingredient.unit}
                      {servings !== originalServings && (
                        <span className="text-xs text-gray-500 ml-1">
                          (original: {ingredient.originalQuantity})
                        </span>
                      )}
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
                          <span className="text-sm font-medium text-pink-600">{index + 1}</span>
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
                {recette.tips ? (
                  typeof recette.tips === 'string' ? (
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-yellow-600 text-lg">💡</span>
                      <p className="text-gray-800">{recette.tips}</p>
                    </div>
                  ) : (
                    recette.tips.map((tip: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <span className="text-yellow-600 text-lg">💡</span>
                        <p className="text-gray-800">{tip}</p>
                      </div>
                    ))
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucun conseil disponible pour cette recette</p>
                  </div>
                )}
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
