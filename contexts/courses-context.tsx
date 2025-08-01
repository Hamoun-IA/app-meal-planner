"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CourseItem {
  id: number;
  name: string;
  completed: boolean;
  category: string;
  quantity?: string;
  source?: string; // Pour indiquer d'où vient l'article (ex: "Recette: Nom de la recette")
}

interface CoursesContextType {
  items: CourseItem[];
  categories: string[];
  addItem: (item: Omit<CourseItem, "id">) => void;
  addItems: (items: Omit<CourseItem, "id">[]) => void;
  toggleItem: (id: number) => void;
  deleteItem: (id: number) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  getItemsByCategory: (category: string) => CourseItem[];
  getCompletedCount: () => number;
  getTotalCount: () => number;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export const useCourses = () => {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error("useCourses must be used within a CoursesProvider");
  }
  return context;
};

interface CoursesProviderProps {
  children: ReactNode;
}

export const CoursesProvider: React.FC<CoursesProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CourseItem[]>([
    { id: 1, name: "Lait", completed: false, category: "Produits laitiers" },
    { id: 2, name: "Pain", completed: true, category: "Boulangerie" },
    { id: 3, name: "Pommes", completed: false, category: "Fruits & Légumes" },
    { id: 4, name: "Chocolat", completed: false, category: "Épicerie sucrée" },
    { id: 5, name: "Yaourts", completed: true, category: "Produits laitiers" },
  ]);

  const [categories, setCategories] = useState([
    "Produits laitiers",
    "Boulangerie",
    "Fruits & Légumes",
    "Épicerie sucrée",
    "Viande & Poisson",
    "Surgelés",
    "Boissons",
    "Hygiène & Beauté",
    "Entretien",
    "Divers",
  ]);

  const addItem = (item: Omit<CourseItem, "id">) => {
    const newItem: CourseItem = {
      ...item,
      id: Date.now(),
    };
    setItems((prev) => [...prev, newItem]);
  };

  const addItems = (newItems: Omit<CourseItem, "id">[]) => {
    const itemsWithIds = newItems.map((item) => ({
      ...item,
      id: Date.now() + Math.random(), // Pour éviter les doublons d'ID
    }));
    setItems((prev) => [...prev, ...itemsWithIds]);
  };

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories((prev) => [...prev, category]);
    }
  };

  const deleteCategory = (category: string) => {
    if (category === "Divers") return; // Empêcher la suppression de "Divers"

    // Déplacer tous les articles de cette catégorie vers "Divers"
    setItems((prev) =>
      prev.map((item) =>
        item.category === category ? { ...item, category: "Divers" } : item
      )
    );

    // Supprimer la catégorie
    setCategories((prev) => prev.filter((cat) => cat !== category));
  };

  const updateCategory = (oldName: string, newName: string) => {
    // Mettre à jour le nom de la catégorie
    setCategories((prev) =>
      prev.map((cat) => (cat === oldName ? newName : cat))
    );

    // Mettre à jour les articles avec le nouveau nom de catégorie
    setItems((prev) =>
      prev.map((item) =>
        item.category === oldName ? { ...item, category: newName } : item
      )
    );
  };

  const getItemsByCategory = (category: string) => {
    return items.filter((item) => item.category === category);
  };

  const getCompletedCount = () => {
    return items.filter((item) => item.completed).length;
  };

  const getTotalCount = () => {
    return items.length;
  };

  const value: CoursesContextType = {
    items,
    categories,
    addItem,
    addItems,
    toggleItem,
    deleteItem,
    addCategory,
    deleteCategory,
    updateCategory,
    getItemsByCategory,
    getCompletedCount,
    getTotalCount,
  };

  return (
    <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
  );
}; 