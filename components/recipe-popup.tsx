import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ChefHat, Users, Star, Save } from "lucide-react"
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
          title: "Recette sauvegardée !",
          description: "La recette a été ajoutée à votre collection.",
          variant: "default",
        })
        onClose()
        // Notifier que la recette a été sauvegardée
        onRecipeSaved?.()
      } else {
        toast({
          title: "Erreur lors de la sauvegarde",
          description: data.error || "Impossible de sauvegarder la recette.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/60 backdrop-blur-2xl border-0 shadow-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            {recipe.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {totalTime} min total
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-gray-500" />
              <Badge className={cn("text-xs", difficultyColors[recipe.difficulty])}>
                {recipe.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <Badge className={cn("text-xs", dishTypeColors[recipe.dishType])}>
                {recipe.dishType.replace('_', ' ')}
              </Badge>
            </div>
          </div>

                     {/* Temps de préparation et cuisson */}
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-lg">
               <h3 className="font-semibold text-gray-900 mb-2">Préparation</h3>
               <p className="text-gray-600">{recipe.prepTime} minutes</p>
             </div>
             <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-lg">
               <h3 className="font-semibold text-gray-900 mb-2">Cuisson</h3>
               <p className="text-gray-600">{recipe.cookTime} minutes</p>
             </div>
           </div>

                     {/* Ingrédients */}
           <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-white/40">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Ingrédients
            </h3>
            <div className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-white/30 last:border-b-0">
                  <span className="text-gray-700">{ingredient.name}</span>
                  <span className="text-gray-500 font-medium">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

                     {/* Instructions */}
           <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-white/40">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Instructions
            </h3>
            <div className="space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

                     {/* Conseils */}
           {recipe.tips && (
             <div className="bg-gradient-to-r from-yellow-50/60 to-orange-50/60 backdrop-blur-md border border-yellow-200/40 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Conseils</h4>
              </div>
              <p className="text-yellow-700">{recipe.tips}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/30">
                         <Button 
               onClick={onClose}
               variant="outline"
               className="flex-1 rounded-xl border-white/40 bg-white/40 backdrop-blur-md hover:bg-white/60"
               disabled={isSaving}
             >
              Fermer
            </Button>
            <Button 
              onClick={handleSaveRecipe}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg"
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