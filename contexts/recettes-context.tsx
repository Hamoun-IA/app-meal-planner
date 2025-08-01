"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Recette {
  id: number
  title: string
  description: string
  category: string
  difficulty: string
  prepTime: string
  cookTime: string
  servings: number
  image?: string
  ingredients: Array<{ name: string; quantity: string }>
  instructions: Array<{ text: string }>
  tips: string[]
  liked: boolean
  createdAt: string
  updatedAt: string
  nutrition?: {
    calories: string
    protein: string
    carbs: string
    fat: string
  }
}

interface RecettesContextType {
  recettes: Recette[]
  addRecette: (recette: Omit<Recette, "id" | "createdAt" | "updatedAt">) => void
  updateRecette: (id: number, recette: Partial<Recette>) => void
  deleteRecette: (id: number) => void
  getRecetteById: (id: number) => Recette | undefined
  toggleLike: (id: number) => void
  isLoading: boolean
}

const RecettesContext = createContext<RecettesContextType | undefined>(undefined)

const defaultRecettes: Recette[] = [
  {
    id: 1,
    title: "Cookies aux pépites de chocolat",
    description:
      "Des cookies moelleux et croustillants avec de délicieuses pépites de chocolat. La recette parfaite pour un goûter gourmand !",
    category: "Dessert",
    difficulty: "Facile",
    prepTime: "15 min",
    cookTime: "10 min",
    servings: 4,
    image: "/placeholder.svg?height=400&width=600",
    liked: true,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
    ingredients: [
      { name: "Farine", quantity: "200g" },
      { name: "Beurre mou", quantity: "100g" },
      { name: "Sucre brun", quantity: "80g" },
      { name: "Sucre blanc", quantity: "50g" },
      { name: "Œuf", quantity: "1" },
      { name: "Pépites de chocolat", quantity: "150g" },
      { name: "Levure chimique", quantity: "1 c.à.c" },
      { name: "Sel", quantity: "1 pincée" },
      { name: "Extrait de vanille", quantity: "1 c.à.c" },
    ],
    instructions: [
      {
        text: "Préchauffer le four à 180°C. Dans un saladier, mélanger le beurre mou avec les deux sucres jusqu'à obtenir une texture crémeuse.",
      },
      { text: "Ajouter l'œuf et l'extrait de vanille, bien mélanger." },
      {
        text: "Dans un autre bol, mélanger la farine, la levure et le sel. Incorporer ce mélange sec à la préparation humide.",
      },
      { text: "Ajouter les pépites de chocolat et mélanger délicatement." },
      {
        text: "Former des boules de pâte et les disposer sur une plaque recouverte de papier sulfurisé, en laissant de l'espace entre chaque cookie.",
      },
      {
        text: "Enfourner pendant 10-12 minutes jusqu'à ce que les bords soient dorés. Laisser refroidir sur la plaque 5 minutes avant de transférer sur une grille.",
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
  {
    id: 2,
    title: "Salade de quinoa aux légumes",
    description: "Une salade fraîche et nutritive, parfaite pour un déjeuner léger et équilibré.",
    category: "Plat principal",
    difficulty: "Facile",
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 2,
    image: "/placeholder.svg?height=400&width=600",
    liked: false,
    createdAt: "2024-01-12T14:30:00Z",
    updatedAt: "2024-01-12T14:30:00Z",
    ingredients: [
      { name: "Quinoa", quantity: "150g" },
      { name: "Tomates cerises", quantity: "200g" },
      { name: "Concombre", quantity: "1" },
      { name: "Avocat", quantity: "1" },
      { name: "Feta", quantity: "100g" },
      { name: "Huile d'olive", quantity: "3 c.à.s" },
      { name: "Citron", quantity: "1" },
      { name: "Menthe fraîche", quantity: "quelques feuilles" },
    ],
    instructions: [
      { text: "Rincer le quinoa et le cuire dans de l'eau bouillante salée pendant 15 minutes." },
      { text: "Pendant ce temps, couper les tomates cerises en deux, le concombre en dés et l'avocat en lamelles." },
      { text: "Égoutter le quinoa et le laisser refroidir." },
      { text: "Mélanger le quinoa avec les légumes et la feta émiettée." },
      { text: "Préparer la vinaigrette avec l'huile d'olive, le jus de citron, sel et poivre." },
      { text: "Assaisonner la salade et garnir de menthe fraîche." },
    ],
    tips: ["Le quinoa peut être cuit à l'avance", "Ajouter l'avocat au dernier moment pour éviter qu'il noircisse"],
    nutrition: {
      calories: "320 kcal",
      protein: "12g",
      carbs: "28g",
      fat: "18g",
    },
  },
]

export function RecettesProvider({ children }: { children: ReactNode }) {
  const [recettes, setRecettes] = useState<Recette[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Charger les recettes depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedRecettes = localStorage.getItem("babounette-recettes")
      if (savedRecettes) {
        const parsed = JSON.parse(savedRecettes)
        setRecettes(parsed)
      } else {
        // Première utilisation, utiliser les recettes par défaut
        setRecettes(defaultRecettes)
        localStorage.setItem("babounette-recettes", JSON.stringify(defaultRecettes))
      }
    } catch (error) {
      console.error("Erreur lors du chargement des recettes:", error)
      setRecettes(defaultRecettes)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sauvegarder les recettes dans localStorage quand elles changent
  useEffect(() => {
    if (!isLoading && recettes.length > 0) {
      localStorage.setItem("babounette-recettes", JSON.stringify(recettes))
    }
  }, [recettes, isLoading])

  const addRecette = (newRecette: Omit<Recette, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString()
    const id = Math.max(...recettes.map((r) => r.id), 0) + 1

    const recette: Recette = {
      ...newRecette,
      id,
      createdAt: now,
      updatedAt: now,
    }

    setRecettes((prev) => [...prev, recette])
  }

  const updateRecette = (id: number, updates: Partial<Recette>) => {
    setRecettes((prev) =>
      prev.map((recette) =>
        recette.id === id ? { ...recette, ...updates, updatedAt: new Date().toISOString() } : recette,
      ),
    )
  }

  const deleteRecette = (id: number) => {
    setRecettes((prev) => prev.filter((recette) => recette.id !== id))
  }

  const getRecetteById = (id: number) => {
    return recettes.find((recette) => recette.id === id)
  }

  const toggleLike = (id: number) => {
    updateRecette(id, { liked: !getRecetteById(id)?.liked })
  }

  return (
    <RecettesContext.Provider
      value={{
        recettes,
        addRecette,
        updateRecette,
        deleteRecette,
        getRecetteById,
        toggleLike,
        isLoading,
      }}
    >
      {children}
    </RecettesContext.Provider>
  )
}

export function useRecettes() {
  const context = useContext(RecettesContext)
  if (context === undefined) {
    throw new Error("useRecettes must be used within a RecettesProvider")
  }
  return context
}
