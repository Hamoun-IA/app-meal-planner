import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ChefHat, Users, Star, Save, Timer, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export interface RecipePopupData {
  name: string
  prepTime: number
  cookTime: number
  difficulty: "FACILE" | "MOYEN" | "DIFFICILE"
  dishType: "ENTREE" | "PLAT_PRINCIPAL" | "ACCOMPAGNEMENT" | "DESSERT"
  instructions: string[]
  tips?: string
  ingredients: {
    name: string
    quantity: number
    unit: string
  }[]
}

interface RecipePopupProps {
  isOpen: boolean
  onClose: () => void
  recipe: RecipePopupData | null
  onRecipeSaved?: () => void
}

const difficultyColors = {
  FACILE: "bg-green-100 text-green-800",
  MOYEN: "bg-yellow-100 text-yellow-800",
  DIFFICILE: "bg-red-100 text-red-800",
}

const dishTypeColors = {
  ENTREE: "bg-blue-100 text-blue-800",
  PLAT_PRINCIPAL: "bg-purple-100 text-purple-800",
  ACCOMPAGNEMENT: "bg-orange-100 text-orange-800",
  DESSERT: "bg-pink-100 text-pink-800",
}

export function RecipePopup({ isOpen, onClose, recipe, onRecipeSaved }: RecipePopupProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"ingredients" | "instructions" | "tips">("ingredients")
  const { toast } = useToast()

  if (!recipe) return null

  const totalTime = recipe.prepTime + recipe.cookTime

  const handleSaveRecipe = async () => {
    if (!recipe) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Recette sauvegardée ! 🎉",
          description: `"${recipe.name}" a été ajoutée à votre collection de recettes.`,
          variant: "default",
        })
        onClose()
        // Notifier que la recette a été sauvegardée
        onRecipeSaved?.()
      } else {
        toast({
          title: "Erreur lors de la sauvegarde",
          description: data.error || "Impossible de sauvegarder la recette. Veuillez réessayer.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gradient-to-r from-pink-200 to-rose-200 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {recipe.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Info Cards - Inspired by detail page */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <Clock className="w-5 h-5 text-pink-500 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-semibold text-gray-800">{totalTime} min</p>
            </div>
            <div className="text-center p-3 bg-rose-50 rounded-lg">
              <Timer className="w-5 h-5 text-rose-500 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Préparation</p>
              <p className="font-semibold text-gray-800">{recipe.prepTime} min</p>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <ChefHat className="w-5 h-5 text-pink-500 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Difficulté</p>
              <p className="font-semibold text-gray-800">{recipe.difficulty}</p>
            </div>
            <div className="text-center p-3 bg-rose-50 rounded-lg">
              <Users className="w-5 h-5 text-rose-500 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold text-gray-800">{recipe.dishType.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Tabs - Inspired by detail page */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex border-b border-gray-200">
              {[
                { key: "ingredients", label: "Ingrédients", icon: "🥄" },
                { key: "instructions", label: "Instructions", icon: "📝" },
                { key: "tips", label: "Conseils", icon: "💡" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
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
                      Ingrédients
                    </h3>
                    <span className="text-sm text-gray-500">
                      {recipe.ingredients.length} ingrédients
                    </span>
                  </div>
                                     {recipe.ingredients.map((ingredient, index) => (
                     <div
                       key={index}
                       className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-pink-50 border border-transparent hover:border-pink-200 transition-all"
                     >
                       <span className="text-gray-800">
                         {ingredient.name}
                       </span>
                       <span className="font-medium text-pink-600">
                         {ingredient.quantity} {ingredient.unit}
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
                      {recipe.instructions.length} étapes
                    </span>
                  </div>
                  {recipe.instructions.map((instruction, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-gray-200 hover:border-pink-200 transition-all bg-white"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips Tab */}
              {activeTab === "tips" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Conseils</h3>
                  </div>
                  {recipe.tips ? (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-800">Conseils</h4>
                      </div>
                      <p className="text-yellow-700">{recipe.tips}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun conseil disponible pour cette recette</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl border-pink-200 bg-white hover:bg-pink-50"
              disabled={isSaving}
            >
              Fermer
            </Button>
            <Button 
              onClick={handleSaveRecipe}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-sm"
            >
              {isSaving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-pulse" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder la recette
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 