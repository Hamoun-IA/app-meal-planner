"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
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
  Star,
  Edit2,
  Trash2,
} from "lucide-react";
import { useState, use } from "react";
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple";
import { useRecettes } from "@/contexts/recettes-context";
import { useRouter } from "next/navigation";

interface RecettePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RecettePage({ params }: RecettePageProps) {
  const { playBackSound, playClickSound } = useAppSoundsSimple();
  const { getRecetteById, deleteRecette, toggleLike } = useRecettes();
  const router = useRouter();
  const [servings, setServings] = useState(4);
  const [ingredients, setIngredients] = useState<
    Array<{ name: string; quantity: string; checked: boolean }>
  >([]);
  const [instructions, setInstructions] = useState<
    Array<{ text: string; completed: boolean }>
  >([]);
  const [activeTab, setActiveTab] = useState<
    "ingredients" | "instructions" | "tips"
  >("ingredients");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Unwrap params avec React.use()
  const { id } = use(params);
  const recette = getRecetteById(Number.parseInt(id));

  // Initialiser les états avec les données de la recette
  useState(() => {
    if (recette) {
      setIngredients(
        recette.ingredients.map((ing) => ({ ...ing, checked: false }))
      );
      setInstructions(
        recette.instructions.map((inst, index) => ({
          text: inst.text,
          completed: false,
        }))
      );
      setServings(recette.servings);
    }
  });

  const handleBackClick = () => {
    console.log("Back button clicked!");
    playBackSound();
  };

  const handleLikeClick = () => {
    if (recette) {
      playClickSound();
      toggleLike(recette.id);
    }
  };

  const handleDeleteRecette = () => {
    if (recette) {
      playClickSound();
      deleteRecette(recette.id);
      router.push("/recettes");
    }
  };

  const handleIngredientCheck = (index: number) => {
    playClickSound();
    setIngredients((prev) =>
      prev.map((ingredient, i) =>
        i === index
          ? { ...ingredient, checked: !ingredient.checked }
          : ingredient
      )
    );
  };

  const handleInstructionComplete = (index: number) => {
    playClickSound();
    setInstructions((prev) =>
      prev.map((instruction, i) =>
        i === index
          ? { ...instruction, completed: !instruction.completed }
          : instruction
      )
    );
  };

  const adjustServings = (change: number) => {
    playClickSound();
    const newServings = Math.max(1, servings + change);
    setServings(newServings);
  };

  if (!recette) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">Recette non trouvée 🥺</p>
          <Button
            asChild
            className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500"
          >
            <Link href="/recettes">Retour aux recettes</Link>
          </Button>
        </div>
      </div>
    );
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Supprimer la recette ?
              </h3>
              <p className="text-gray-600 mb-6">
                Cette action est irréversible. Es-tu sûre de vouloir supprimer
                cette recette ?
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    playClickSound();
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDeleteRecette}
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
              <Link href="/recettes">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <ChefHat className="w-6 h-6 text-white" />
              <h1 className="text-white font-semibold text-xl">
                {recette.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              <Link href={`/recettes/${recette.id}/modifier`}>
                <Edit2 className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                playClickSound();
                setShowDeleteConfirm(true);
              }}
              className="text-white hover:bg-white/20 p-2"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              className="text-white hover:bg-white/20 p-2"
            >
              <Heart
                className={`w-5 h-5 ${recette.liked ? "fill-current text-red-300" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
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
              src={
                recette.image ||
                "/placeholder.svg?height=400&width=600&query=recette"
              }
              alt={recette.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {recette.category}
              </span>
            </div>
            {recette.nutrition && (
              <div className="absolute bottom-4 right-4 flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">4.8</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              {recette.title}
            </h1>
            <p className="text-gray-600 mb-4">{recette.description}</p>

            {/* Recipe Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <Clock className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold text-gray-800">
                  {Number.parseInt(recette.prepTime.replace(" min", "")) +
                    Number.parseInt(recette.cookTime.replace(" min", ""))}{" "}
                  min
                </p>
              </div>
              <div className="text-center p-3 bg-rose-50 rounded-lg">
                <Timer className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Préparation</p>
                <p className="font-semibold text-gray-800">
                  {recette.prepTime}
                </p>
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
                  <span className="font-semibold text-gray-800 min-w-[2rem] text-center">
                    {servings}
                  </span>
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
                <p className="font-semibold text-gray-800">
                  {recette.difficulty}
                </p>
              </div>
            </div>

            {/* Nutrition Info */}
            {recette.nutrition && (
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Informations nutritionnelles (par portion)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Calories</p>
                    <p className="font-semibold">
                      {recette.nutrition.calories}
                    </p>
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
            )}
          </div>
        </div>

        {/* Tabs */}
        <div
          className="bg-white rounded-2xl shadow-lg mb-6 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex border-b border-gray-200">
            {[
              { key: "ingredients", label: "Ingrédients", icon: "🥄" },
              { key: "instructions", label: "Instructions", icon: "📝" },
              { key: "tips", label: "Conseils", icon: "💡" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.key as typeof activeTab);
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
                    {ingredients.filter((i) => i.checked).length}/
                    {ingredients.length} cochés
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
                        ingredient.checked
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {ingredient.checked && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={`flex-1 ${ingredient.checked ? "line-through text-gray-500" : "text-gray-800"}`}
                    >
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
                  <h3 className="text-lg font-semibold text-gray-800">
                    Instructions
                  </h3>
                  <span className="text-sm text-gray-500">
                    {instructions.filter((i) => i.completed).length}/
                    {instructions.length} terminées
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
                          <span className="text-sm font-medium text-pink-600">
                            {index + 1}
                          </span>
                        )}
                      </button>
                      <p
                        className={`text-gray-800 leading-relaxed ${
                          instruction.completed
                            ? "line-through text-gray-500"
                            : ""
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Conseils de chef 👩‍🍳
                </h3>
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
        <div
          className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter à ma liste de courses
            </Button>
            <Button
              variant="outline"
              className="border-pink-200 hover:bg-pink-50 bg-transparent"
            >
              <Timer className="w-4 h-4 mr-2" />
              Démarrer le minuteur
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
