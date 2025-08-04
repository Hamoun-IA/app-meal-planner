"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft, ChefHat, Clock, Users, Camera, Plus, Minus, X, Save, Loader2 } from "lucide-react"
import { useState, useEffect, use } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/services/api-service"
import { ImageUpload } from '@/components/ui/image-upload'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Ingredient {
  id: string
  name: string
  category: string
  units: string[]
}

interface ModifierRecettePageProps {
  params: Promise<{
    id: string
  }>
}

export default function ModifierRecettePage({ params }: ModifierRecettePageProps) {
  const { playBackSound, playClickSound } = useAppSoundsSimple()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([])
  const [recette, setRecette] = useState({
    name: "",
    description: "",
    dishType: "",
    difficulty: "",
    prepTime: 0,
    cookTime: 0,
    servings: 4,
    image: "",
    imageUrl: "", // Ajout du champ imageUrl
    ingredients: [{ ingredientId: "", quantity: 1, unit: "G" }],
    instructions: [""],
    tips: "",
    liked: false,
  })

  // Déballer les params avec React.use()
  const { id } = use(params)

  // Charger les données de la recette existante et les ingrédients disponibles
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger la recette
        const recipeResponse = await apiService.getRecetteById(id)
        if (recipeResponse.data) {
          const recipeData = recipeResponse.data
          setRecette({
            name: recipeData.name,
            description: recipeData.tips || "",
            dishType: recipeData.dishType || "",
            difficulty: recipeData.difficulty || "",
            prepTime: recipeData.prepTime || 0,
            cookTime: recipeData.cookTime || 0,
            servings: recipeData.servings || 4, // Utiliser la valeur de la DB ou 4 par défaut
            image: "/placeholder.svg?height=400&width=600",
            imageUrl: recipeData.imageUrl || "", // Charger l'imageUrl
            ingredients: recipeData.ingredients?.map((ing: any) => ({
              ingredientId: ing.ingredient.id,
              quantity: ing.quantity,
              unit: ing.unit,
            })) || [{ ingredientId: "", quantity: 1, unit: "G" }],
            instructions: recipeData.instructions || [""],
            tips: recipeData.tips || "",
            liked: false,
          })
        }

        // Charger les ingrédients disponibles
        const ingredientsResponse = await apiService.getIngredients({ limit: 100 })
        if (ingredientsResponse.data) {
          setAvailableIngredients(ingredientsResponse.data.ingredients)
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      }
    }

    loadData()
  }, [id])

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const handleInputChange = (field: string, value: string | number) => {
    playClickSound()
    setRecette((prev) => ({ ...prev, [field]: value }))
  }

  const addIngredient = () => {
    playClickSound()
    setRecette((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredientId: "", quantity: 1, unit: "G" }],
    }))
  }

  const removeIngredient = (index: number) => {
    playClickSound()
    setRecette((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  const updateIngredient = (index: number, field: string, value: string | number) => {
    setRecette((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    }))
  }

  const addInstruction = () => {
    playClickSound()
    setRecette((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }))
  }

  const removeInstruction = (index: number) => {
    playClickSound()
    setRecette((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }))
  }

  const updateInstruction = (index: number, value: string) => {
    setRecette((prev) => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => (i === index ? value : instruction)),
    }))
  }

  const adjustServings = (change: number) => {
    playClickSound()
    const newServings = Math.max(1, recette.servings + change)
    setRecette((prev) => ({ ...prev, servings: newServings }))
  }

  const nextStep = () => {
    playClickSound()
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    playClickSound()
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSave = async () => {
    playClickSound()

    // Validation basique
    if (!recette.name.trim()) {
      alert("Le nom est obligatoire !")
      return
    }

    if (!recette.dishType) {
      alert("Le type de plat est obligatoire !")
      return
    }

    if (!recette.difficulty) {
      alert("La difficulté est obligatoire !")
      return
    }

    const validInstructions = recette.instructions.filter(inst => inst.trim())
    if (validInstructions.length < 2) {
      alert("Au moins 2 instructions sont requises !")
      return
    }

    // Vérifier que chaque instruction a au moins 10 caractères
    const shortInstructions = validInstructions.filter(inst => inst.trim().length < 10)
    if (shortInstructions.length > 0) {
      alert(`Les instructions suivantes sont trop courtes (minimum 10 caractères) :\n${shortInstructions.map((inst, index) => `${index + 1}. "${inst}"`).join('\n')}`)
      return
    }

    // Vérifier qu'il y a au moins un ingrédient valide
    const validIngredients = recette.ingredients.filter(ing => ing.ingredientId && ing.ingredientId.trim() !== "")
    if (validIngredients.length === 0) {
      alert("Au moins un ingrédient est requis ! Veuillez sélectionner un ingrédient pour chaque ligne.")
      return
    }

    // Vérifier que tous les ingrédients ont un ingredientId valide
    const invalidIngredients = recette.ingredients.filter(ing => !ing.ingredientId || ing.ingredientId.trim() === "")
    if (invalidIngredients.length > 0) {
      alert("Certains ingrédients n'ont pas été sélectionnés. Veuillez choisir un ingrédient pour chaque ligne ou supprimer les lignes vides.")
      return
    }

    // Nettoyer les données
    const cleanedRecette = {
      ...recette,
      ingredients: validIngredients,
      instructions: validInstructions,
    }

    try {
      setIsLoading(true)
      
      // Transformer les données pour correspondre à l'API
      const apiData = {
        name: cleanedRecette.name,
        prepTime: cleanedRecette.prepTime > 0 ? cleanedRecette.prepTime : 15, // Minimum 15 minutes si vide
        cookTime: cleanedRecette.cookTime > 0 ? cleanedRecette.cookTime : 10, // Minimum 10 minutes si vide
        difficulty: cleanedRecette.difficulty as any,
        dishType: cleanedRecette.dishType as any,
        instructions: cleanedRecette.instructions,
        tips: cleanedRecette.tips,
        servings: cleanedRecette.servings, // Inclure le nombre de portions
        ingredients: cleanedRecette.ingredients.map(ing => ({
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          unit: ing.unit as any,
        })),
        imageUrl: cleanedRecette.imageUrl || undefined, // Inclure l'imageUrl
      }
      
      // Mettre à jour la recette via l'API
      const response = await apiService.updateRecette(id, apiData)
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Rediriger vers la page de détail
      router.push(`/recettes/${id}`)
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la modification de la recette'
      alert(`Erreur lors de la modification de la recette : ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const dishTypes = [
    { value: "DESSERT", label: "Dessert" },
    { value: "PLAT_PRINCIPAL", label: "Plat principal" },
    { value: "ACCOMPAGNEMENT", label: "Accompagnement" },
    { value: "ENTREE", label: "Entrée" },
    { value: "PETIT_DEJEUNER", label: "Petit-déjeuner" },
    { value: "APERITIF", label: "Apéritif" },
    { value: "BOISSON", label: "Boisson" },
  ]

  const difficulties = [
    { value: "FACILE", label: "Facile" },
    { value: "MOYEN", label: "Moyen" },
    { value: "DIFFICILE", label: "Difficile" },
  ]

  const units = [
    { value: "G", label: "Grammes (g)" },
    { value: "KG", label: "Kilogrammes (kg)" },
    { value: "ML", label: "Millilitres (ml)" },
    { value: "CL", label: "Centilitres (cl)" },
    { value: "L", label: "Litres (l)" },
    { value: "C_A_C", label: "Cuillère à café" },
    { value: "C_A_S", label: "Cuillère à soupe" },
    { value: "PINCEE", label: "Pincée" },
    { value: "POIGNEE", label: "Poignée" },
    { value: "BOUQUET", label: "Bouquet" },
    { value: "GOUTTE", label: "Goutte" },
    { value: "PIECE", label: "Pièce" },
  ]

  const steps = [
    { number: 1, title: "Informations", icon: "📝" },
    { number: 2, title: "Ingrédients", icon: "🥄" },
    { number: 3, title: "Instructions", icon: "👩‍🍳" },
    { number: 4, title: "Finalisation", icon: "✨" },
  ]

  if (!recette) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">Chargement de la recette...</p>
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin mx-auto mt-4" />
        </div>
      </div>
    )
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
              <Link href={`/recettes/${id}`}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <ChefHat className="w-6 h-6 text-white" />
              <h1 className="text-white font-semibold text-xl">Modifier la recette</h1>
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    currentStep >= step.number
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <span className="text-lg">{step.icon}</span>
                </div>
                <div className="ml-3 hidden md:block">
                  <p
                    className={`text-sm font-medium ${currentStep >= step.number ? "text-pink-600" : "text-gray-500"}`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 md:w-20 h-1 mx-4 rounded-full transition-all ${
                      currentStep > step.number ? "bg-pink-300" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {/* Step 1: Informations générales */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Informations générales</h2>

              {/* Photo de la recette */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo de la recette</label>
                <ImageUpload
                  currentImageUrl={recette.imageUrl}
                  onImageChange={(imageUrl) => handleInputChange("imageUrl", imageUrl)}
                />
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la recette *</label>
                <Input
                  value={recette.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: Cookies aux pépites de chocolat"
                  className="border-pink-200 focus:border-pink-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={recette.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Décris ta recette en quelques mots..."
                  className="border-pink-200 focus:border-pink-400 min-h-[100px]"
                />
              </div>

              {/* Type de plat et Difficulté */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de plat *</label>
                  <select
                    value={recette.dishType}
                    onChange={(e) => handleInputChange("dishType", e.target.value)}
                    className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                  >
                    <option value="">Choisir un type de plat</option>
                    {dishTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulté *</label>
                  <select
                    value={recette.difficulty}
                    onChange={(e) => handleInputChange("difficulty", e.target.value)}
                    className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                  >
                    <option value="">Choisir la difficulté</option>
                    {difficulties.map((diff) => (
                      <option key={diff.value} value={diff.value}>
                        {diff.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Temps et Portions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temps de préparation (optionnel)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      value={recette.prepTime || ""}
                      onChange={(e) => handleInputChange("prepTime", Number(e.target.value) || 0)}
                      placeholder="15 min (défaut)"
                      className="pl-10 border-pink-200 focus:border-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temps de cuisson (optionnel)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      value={recette.cookTime || ""}
                      onChange={(e) => handleInputChange("cookTime", Number(e.target.value) || 0)}
                      placeholder="10 min (défaut)"
                      className="pl-10 border-pink-200 focus:border-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portions</label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustServings(-1)}
                      className="border-pink-200 hover:bg-pink-50"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-pink-50 rounded-lg">
                      <Users className="w-4 h-4 text-pink-600" />
                      <span className="font-medium text-gray-800">{recette.servings}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustServings(1)}
                      className="border-pink-200 hover:bg-pink-50"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Ingrédients */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Ingrédients</h2>
                <Button onClick={addIngredient} className="bg-gradient-to-r from-pink-500 to-rose-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>

              <div className="space-y-4">
                {recette.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={ingredient.ingredientId}
                        onChange={(e) => updateIngredient(index, "ingredientId", e.target.value)}
                        className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                      >
                        <option value="">Choisir un ingrédient</option>
                        {availableIngredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                        className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                      >
                        <option value="G">Choisir une unité</option>
                        {units.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, "quantity", Number(e.target.value))}
                      placeholder="Quantité"
                      className="w-24 border-pink-200 focus:border-pink-400"
                    />
                    {recette.ingredients.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Instructions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Instructions</h2>
                <Button onClick={addInstruction} className="bg-gradient-to-r from-pink-500 to-rose-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>

              <div className="space-y-4">
                {recette.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-pink-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={`Étape ${index + 1}: Décris cette étape en détail (minimum 10 caractères)...`}
                        className="border-pink-200 focus:border-pink-400 min-h-[80px]"
                      />
                      <div className="mt-1 text-xs text-gray-500">
                        {instruction.length}/10 caractères minimum
                        {instruction.length < 10 && instruction.length > 0 && (
                          <span className="text-red-500 ml-2">⚠️ Trop court</span>
                        )}
                      </div>
                    </div>
                    {recette.instructions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Finalisation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Conseils et finalisation</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conseils de chef (optionnel)</label>
                <Textarea
                  value={recette.tips}
                  onChange={(e) => handleInputChange("tips", e.target.value)}
                  placeholder="Partage un conseil utile..."
                  className="border-pink-200 focus:border-pink-400 min-h-[100px]"
                />
              </div>

              {/* Résumé de la recette */}
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Résumé de ta recette ✨</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Nom:</p>
                    <p className="font-medium">{recette.name || "Non défini"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Type de plat:</p>
                    <p className="font-medium">{recette.dishType || "Non défini"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Difficulté:</p>
                    <p className="font-medium">{recette.difficulty || "Non définie"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Portions:</p>
                    <p className="font-medium">{recette.servings} personnes</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ingrédients:</p>
                    <p className="font-medium">{recette.ingredients.filter((i) => i.ingredientId).length} ingrédients</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Étapes:</p>
                    <p className="font-medium">{recette.instructions.filter((i) => i).length} étapes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-pink-200 hover:bg-pink-50 disabled:opacity-50 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <div className="flex items-center space-x-2">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentStep >= step.number ? "bg-pink-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Suivant
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
