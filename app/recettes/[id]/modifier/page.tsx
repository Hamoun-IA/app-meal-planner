"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Users,
  Camera,
  Plus,
  Minus,
  X,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple";
import { useRecettes } from "@/contexts/recettes-context";
import { useRouter } from "next/navigation";

interface ModifierRecettePageProps {
  params: {
    id: string;
  };
}

export default function ModifierRecettePage({
  params,
}: ModifierRecettePageProps) {
  const { playBackSound, playClickSound } = useAppSoundsSimple();
  const { getRecetteById, updateRecette } = useRecettes();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [recette, setRecette] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    prepTime: "",
    cookTime: "",
    servings: 4,
    image: "",
    ingredients: [{ name: "", quantity: "" }],
    instructions: [{ text: "" }],
    tips: [""],
    liked: false,
  });

  const originalRecette = getRecetteById(Number.parseInt(params.id));

  // Charger les données de la recette existante
  useEffect(() => {
    if (originalRecette) {
      setRecette({
        title: originalRecette.title,
        description: originalRecette.description,
        category: originalRecette.category,
        difficulty: originalRecette.difficulty,
        prepTime: originalRecette.prepTime,
        cookTime: originalRecette.cookTime,
        servings: originalRecette.servings,
        image: originalRecette.image || "",
        ingredients: originalRecette.ingredients,
        instructions: originalRecette.instructions,
        tips: originalRecette.tips,
        liked: originalRecette.liked,
      });
    }
  }, [originalRecette]);

  const handleBackClick = () => {
    console.log("Back button clicked!");
    playBackSound();
  };

  const handleInputChange = (field: string, value: string | number) => {
    playClickSound();
    setRecette((prev) => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    playClickSound();
    setRecette((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: "" }],
    }));
  };

  const removeIngredient = (index: number) => {
    playClickSound();
    setRecette((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    setRecette((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      ),
    }));
  };

  const addInstruction = () => {
    playClickSound();
    setRecette((prev) => ({
      ...prev,
      instructions: [...prev.instructions, { text: "" }],
    }));
  };

  const removeInstruction = (index: number) => {
    playClickSound();
    setRecette((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setRecette((prev) => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) =>
        i === index ? { text: value } : instruction
      ),
    }));
  };

  const addTip = () => {
    playClickSound();
    setRecette((prev) => ({
      ...prev,
      tips: [...prev.tips, ""],
    }));
  };

  const removeTip = (index: number) => {
    playClickSound();
    setRecette((prev) => ({
      ...prev,
      tips: prev.tips.filter((_, i) => i !== index),
    }));
  };

  const updateTip = (index: number, value: string) => {
    setRecette((prev) => ({
      ...prev,
      tips: prev.tips.map((tip, i) => (i === index ? value : tip)),
    }));
  };

  const adjustServings = (change: number) => {
    playClickSound();
    const newServings = Math.max(1, recette.servings + change);
    setRecette((prev) => ({ ...prev, servings: newServings }));
  };

  const nextStep = () => {
    playClickSound();
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    playClickSound();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = () => {
    playClickSound();

    if (!originalRecette) {
      alert("Recette non trouvée !");
      return;
    }

    // Validation basique
    if (!recette.title.trim()) {
      alert("Le titre est obligatoire !");
      return;
    }

    if (!recette.category) {
      alert("La catégorie est obligatoire !");
      return;
    }

    if (!recette.difficulty) {
      alert("La difficulté est obligatoire !");
      return;
    }

    // Nettoyer les données
    const cleanedRecette = {
      title: recette.title,
      description: recette.description,
      category: recette.category,
      difficulty: recette.difficulty,
      prepTime: recette.prepTime,
      cookTime: recette.cookTime,
      servings: recette.servings,
      image: recette.image,
      ingredients: recette.ingredients.filter(
        (ing) => ing.name.trim() && ing.quantity.trim()
      ),
      instructions: recette.instructions.filter((inst) => inst.text.trim()),
      tips: recette.tips.filter((tip) => tip.trim()),
      liked: recette.liked,
    };

    // Mettre à jour la recette
    updateRecette(originalRecette.id, cleanedRecette);

    // Rediriger vers la page de détail
    router.push(`/recettes/${originalRecette.id}`);
  };

  if (!originalRecette) {
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

  const categories = [
    "Dessert",
    "Plat principal",
    "Petit-déjeuner",
    "Entrée",
    "Apéritif",
    "Boisson",
  ];
  const difficulties = ["Très facile", "Facile", "Moyen", "Difficile"];

  const steps = [
    { number: 1, title: "Informations", icon: "📝" },
    { number: 2, title: "Ingrédients", icon: "🥄" },
    { number: 3, title: "Instructions", icon: "👩‍🍳" },
    { number: 4, title: "Finalisation", icon: "✨" },
  ];

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
              <Link href={`/recettes/${originalRecette.id}`}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <ChefHat className="w-6 h-6 text-white" />
              <h1 className="text-white font-semibold text-xl">
                Modifier la recette
              </h1>
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
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
        <div
          className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Step 1: Informations générales */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Informations générales
              </h2>

              {/* Photo de la recette */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de la recette
                </label>
                <div className="border-2 border-dashed border-pink-200 rounded-lg p-8 text-center hover:border-pink-300 transition-colors">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Clique pour modifier la photo
                  </p>
                  <p className="text-sm text-gray-500">JPG, PNG jusqu'à 5MB</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-pink-200 hover:bg-pink-50 bg-transparent"
                  >
                    Choisir une photo
                  </Button>
                </div>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la recette *
                </label>
                <Input
                  value={recette.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ex: Cookies aux pépites de chocolat"
                  className="border-pink-200 focus:border-pink-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={recette.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Décris ta recette en quelques mots..."
                  className="border-pink-200 focus:border-pink-400 min-h-[100px]"
                />
              </div>

              {/* Catégorie et Difficulté */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={recette.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                  >
                    <option value="">Choisir une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté *
                  </label>
                  <select
                    value={recette.difficulty}
                    onChange={(e) =>
                      handleInputChange("difficulty", e.target.value)
                    }
                    className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                  >
                    <option value="">Choisir la difficulté</option>
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Temps et Portions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps de préparation
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      value={recette.prepTime}
                      onChange={(e) =>
                        handleInputChange("prepTime", e.target.value)
                      }
                      placeholder="15 min"
                      className="pl-10 border-pink-200 focus:border-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps de cuisson
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      value={recette.cookTime}
                      onChange={(e) =>
                        handleInputChange("cookTime", e.target.value)
                      }
                      placeholder="10 min"
                      className="pl-10 border-pink-200 focus:border-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portions
                  </label>
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
                      <span className="font-medium text-gray-800">
                        {recette.servings}
                      </span>
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
                <h2 className="text-2xl font-bold text-gray-800">
                  Ingrédients
                </h2>
                <Button
                  onClick={addIngredient}
                  className="bg-gradient-to-r from-pink-500 to-rose-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>

              <div className="space-y-4">
                {recette.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        value={ingredient.name}
                        onChange={(e) =>
                          updateIngredient(index, "name", e.target.value)
                        }
                        placeholder="Nom de l'ingrédient"
                        className="border-pink-200 focus:border-pink-400"
                      />
                      <Input
                        value={ingredient.quantity}
                        onChange={(e) =>
                          updateIngredient(index, "quantity", e.target.value)
                        }
                        placeholder="Quantité (ex: 200g)"
                        className="border-pink-200 focus:border-pink-400"
                      />
                    </div>
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
                <h2 className="text-2xl font-bold text-gray-800">
                  Instructions
                </h2>
                <Button
                  onClick={addInstruction}
                  className="bg-gradient-to-r from-pink-500 to-rose-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>

              <div className="space-y-4">
                {recette.instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-pink-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </div>
                    <Textarea
                      value={instruction.text}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Étape ${index + 1}: Décris cette étape en détail...`}
                      className="flex-1 border-pink-200 focus:border-pink-400 min-h-[80px]"
                    />
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
              <h2 className="text-2xl font-bold text-gray-800">
                Conseils et finalisation
              </h2>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Conseils de chef (optionnel)
                  </h3>
                  <Button
                    onClick={addTip}
                    variant="outline"
                    className="border-pink-200 hover:bg-pink-50 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un conseil
                  </Button>
                </div>

                <div className="space-y-3">
                  {recette.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                    >
                      <span className="text-yellow-600 text-lg flex-shrink-0">
                        💡
                      </span>
                      <Input
                        value={tip}
                        onChange={(e) => updateTip(index, e.target.value)}
                        placeholder="Partage un conseil utile..."
                        className="flex-1 border-yellow-200 focus:border-yellow-400 bg-white"
                      />
                      {recette.tips.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTip(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Résumé de la recette */}
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Résumé de ta recette ✨
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Titre:</p>
                    <p className="font-medium">
                      {recette.title || "Non défini"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Catégorie:</p>
                    <p className="font-medium">
                      {recette.category || "Non définie"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Difficulté:</p>
                    <p className="font-medium">
                      {recette.difficulty || "Non définie"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Portions:</p>
                    <p className="font-medium">{recette.servings} personnes</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ingrédients:</p>
                    <p className="font-medium">
                      {recette.ingredients.filter((i) => i.name).length}{" "}
                      ingrédients
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Étapes:</p>
                    <p className="font-medium">
                      {recette.instructions.filter((i) => i.text).length} étapes
                    </p>
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
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les modifications
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
