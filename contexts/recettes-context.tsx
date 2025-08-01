"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Recette {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  image?: string;
  ingredients: Array<{ name: string; quantity: string }>;
  instructions: Array<{ text: string }>;
  tips: string[];
  liked: boolean;
  createdAt: string;
  updatedAt: string;
  nutrition?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

interface RecettesContextType {
  recettes: Recette[];
  addRecette: (
    recette: Omit<Recette, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateRecette: (id: number, recette: Partial<Recette>) => void;
  deleteRecette: (id: number) => void;
  getRecetteById: (id: number) => Recette | undefined;
  toggleLike: (id: number) => void;
  isLoading: boolean;
}

const RecettesContext = createContext<RecettesContextType | undefined>(undefined);

// Fonction utilitaire pour sauvegarder en localStorage avec gestion d'erreur
const saveToLocalStorage = (key: string, data: any): boolean => {
  try {
    // Vérifier la taille des données avant sauvegarde
    const dataSize = new Blob([JSON.stringify(data)]).size;
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB pour être sûr
    
    if (dataSize > maxSize) {
      console.warn(`Données trop volumineuses (${(dataSize / 1024 / 1024).toFixed(2)}MB) pour localStorage`);
      
      // Si les données sont trop volumineuses, essayer de nettoyer les images
      const cleanedData = data.map((recette: Recette) => ({
        ...recette,
        image: recette.image ? undefined : undefined // Supprimer les images pour économiser l'espace
      }));
      
      const cleanedSize = new Blob([JSON.stringify(cleanedData)]).size;
      if (cleanedSize <= maxSize) {
        localStorage.setItem(key, JSON.stringify(cleanedData));
        console.log("Images supprimées pour économiser l'espace localStorage");
        return true;
      } else {
        console.error("Impossible de sauvegarder même sans images");
        return false;
      }
    }
    
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde dans localStorage:", error);
    
    // Si c'est une erreur de quota, essayer de nettoyer le localStorage
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        // Supprimer les anciennes données pour libérer de l'espace
        localStorage.removeItem(key);
        localStorage.setItem(key, JSON.stringify(data));
        console.log("Espace libéré et données sauvegardées");
        return true;
      } catch (cleanupError) {
        console.error("Impossible de libérer l'espace localStorage:", cleanupError);
        return false;
      }
    }
    
    return false;
  }
};

// Fonction utilitaire pour charger depuis localStorage avec gestion d'erreur
const loadFromLocalStorage = (key: string): any | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Erreur lors du chargement depuis localStorage:", error);
    return null;
  }
};

const defaultRecettes: Recette[] = [
  {
    id: 1,
    title: "Cookies aux pépites de chocolat",
    description: "Délicieux cookies moelleux avec des pépites de chocolat noir",
    category: "Dessert",
    difficulty: "Facile",
    prepTime: "15 min",
    cookTime: "12 min",
    servings: 24,
    image: "",
    ingredients: [
      { name: "farine", quantity: "250g" },
      { name: "beurre", quantity: "125g" },
      { name: "sucre", quantity: "100g" },
      { name: "œufs", quantity: "1" },
      { name: "pépites de chocolat", quantity: "150g" },
      { name: "vanille", quantity: "1 c.à.c" },
    ],
    instructions: [
      { text: "Préchauffer le four à 180°C" },
      { text: "Mélanger le beurre ramolli avec le sucre" },
      { text: "Ajouter l'œuf et la vanille" },
      { text: "Incorporer la farine et les pépites" },
      { text: "Former des boules et les déposer sur une plaque" },
      { text: "Cuire 12 minutes" },
    ],
    tips: [
      "Laisser reposer la pâte 30 min au frigo pour plus de moelleux",
      "Ne pas trop cuire pour garder le moelleux",
    ],
    liked: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
  },
  {
    id: 2,
    title: "Pâtes à la carbonara",
    description: "Classique italien avec des œufs, du parmesan et du lard",
    category: "Plat principal",
    difficulty: "Moyen",
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 4,
    image: "",
    ingredients: [
      { name: "pâtes", quantity: "400g" },
      { name: "lardons", quantity: "200g" },
      { name: "œufs", quantity: "4" },
      { name: "parmesan", quantity: "100g" },
      { name: "poivre noir", quantity: "selon goût" },
    ],
    instructions: [
      { text: "Faire cuire les pâtes dans l'eau salée" },
      { text: "Faire revenir les lardons à la poêle" },
      { text: "Battre les œufs avec le parmesan râpé" },
      { text: "Égoutter les pâtes en gardant un peu d'eau" },
      { text: "Mélanger les pâtes avec les lardons" },
      { text: "Ajouter le mélange œufs-parmesan hors du feu" },
    ],
    tips: [
      "Ne pas cuire les œufs, ils doivent juste épaissir",
      "Garder un peu d'eau de cuisson pour lier la sauce",
    ],
    liked: false,
    createdAt: "2024-01-16T12:00:00.000Z",
    updatedAt: "2024-01-16T12:00:00.000Z",
  },
];

export function RecettesProvider({ children }: { children: ReactNode }) {
  const [recettes, setRecettes] = useState<Recette[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les recettes depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedRecettes = loadFromLocalStorage("babounette-recettes");
      if (savedRecettes) {
        setRecettes(savedRecettes);
      } else {
        // Première utilisation, utiliser les recettes par défaut
        setRecettes(defaultRecettes);
        saveToLocalStorage("babounette-recettes", defaultRecettes);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des recettes:", error);
      setRecettes(defaultRecettes);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder les recettes dans localStorage quand elles changent
  useEffect(() => {
    if (!isLoading && recettes.length > 0) {
      const success = saveToLocalStorage("babounette-recettes", recettes);
      if (!success) {
        console.warn("Impossible de sauvegarder les recettes dans localStorage");
        // Optionnel : afficher une notification à l'utilisateur
        // alert("Attention : Impossible de sauvegarder les données localement. Les images peuvent être supprimées pour économiser l'espace.");
      }
    }
  }, [recettes, isLoading]);

  const addRecette = (
    newRecette: Omit<Recette, "id" | "createdAt" | "updatedAt">
  ) => {
    const now = new Date().toISOString();
    const id = Math.max(...recettes.map((r) => r.id), 0) + 1;

    const recette: Recette = {
      ...newRecette,
      id,
      createdAt: now,
      updatedAt: now,
    };

    setRecettes((prev) => [...prev, recette]);
  };

  const updateRecette = (id: number, updates: Partial<Recette>) => {
    setRecettes((prev) =>
      prev.map((recette) =>
        recette.id === id
          ? { ...recette, ...updates, updatedAt: new Date().toISOString() }
          : recette
      )
    );
  };

  const deleteRecette = (id: number) => {
    setRecettes((prev) => prev.filter((recette) => recette.id !== id));
  };

  const getRecetteById = (id: number) => {
    return recettes.find((recette) => recette.id === id);
  };

  const toggleLike = (id: number) => {
    updateRecette(id, { liked: !getRecetteById(id)?.liked });
  };

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
  );
}

export function useRecettes() {
  const context = useContext(RecettesContext);
  if (context === undefined) {
    throw new Error("useRecettes must be used within a RecettesProvider");
  }
  return context;
}
