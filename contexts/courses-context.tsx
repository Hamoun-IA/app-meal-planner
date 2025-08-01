"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { categorizeIngredient } from "@/lib/ingredient-database";

export interface CourseItem {
  id: number;
  name: string;
  completed: boolean;
  category: string;
  quantity?: string;
  source?: string; // Pour indiquer d'où vient l'article (ex: "Recette: Nom de la recette")
}

// Interface pour l'historique des ingrédients
export interface IngredientHistory {
  name: string;
  category: string;
  lastUsed: number; // timestamp
  usageCount: number;
}

interface CoursesContextType {
  items: CourseItem[];
  categories: string[];
  ingredientHistory: IngredientHistory[];
  addItem: (item: Omit<CourseItem, "id">) => void;
  addItems: (items: Omit<CourseItem, "id">[]) => void;
  toggleItem: (id: number) => void;
  deleteItem: (id: number) => void;
  updateItem: (id: number, updates: Partial<Omit<CourseItem, "id">>) => void;
  getItem: (id: number) => CourseItem | undefined;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  getItemsByCategory: (category: string) => CourseItem[];
  getCompletedCount: () => number;
  getTotalCount: () => number;
  getIngredientHistory: () => IngredientHistory[];
  addToHistory: (name: string, category: string) => void;
  // Fonctions pour la base de données de gestion (INDÉPENDANTE)
  databaseItems: CourseItem[];
  addDatabaseItem: (item: Omit<CourseItem, "id">) => void;
  updateDatabaseItem: (id: number, updates: Partial<Omit<CourseItem, "id">>) => void;
  deleteDatabaseItem: (id: number) => void;
  getDatabaseItem: (id: number) => CourseItem | undefined;
  getDatabaseItems: () => CourseItem[];
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

// Fonction utilitaire pour parser une quantité et extraire le nombre et l'unité
export const parseQuantity = (quantity: string): { value: number; unit: string } => {
  if (!quantity) return { value: 0, unit: "g" };
  
  // Patterns pour différents formats de quantités
  const patterns = [
    /^(\d+(?:\.\d+)?)\s*(g|kg|ml|l|cl|oz|lb|tasse|cuillère|pincée|sachet|botte|tranche|unité)$/i,
    /^(\d+(?:\.\d+)?)\s*$/,
    /^(\d+(?:\.\d+)?)\s*(.*)$/
  ];
  
  for (const pattern of patterns) {
    const match = quantity.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2] ? match[2].trim().toLowerCase() : "";
      
      // Si pas d'unité explicite, utiliser "unité" au lieu de "g"
      const normalizedUnit = unit ? normalizeUnit(unit) : "unité";
      
      return { value, unit: normalizedUnit };
    }
  }
  
  return { value: 0, unit: "g" };
};

// Fonction pour normaliser les unités
export const normalizeUnit = (unit: string): string => {
  const unitMap: { [key: string]: string } = {
    'kg': 'kg',
    'kilos': 'kg',
    'kilogramme': 'kg',
    'g': 'g',
    'gramme': 'g',
    'grammes': 'g',
    'ml': 'ml',
    'millilitre': 'ml',
    'millilitres': 'ml',
    'l': 'l',
    'litre': 'l',
    'litres': 'l',
    'cl': 'cl',
    'centilitre': 'cl',
    'centilitres': 'cl',
    'oz': 'oz',
    'once': 'oz',
    'onces': 'oz',
    'lb': 'lb',
    'livre': 'lb',
    'livres': 'lb',
    'tasse': 'tasse',
    'tasses': 'tasse',
    'cuillère': 'cuillère',
    'cuillères': 'cuillère',
    'pincée': 'pincée',
    'pincées': 'pincée',
    'sachet': 'sachet',
    'sachets': 'sachet',
    'botte': 'botte',
    'bottes': 'botte',
    'tranche': 'tranche',
    'tranches': 'tranche',
    'unité': 'unité',
    'unités': 'unité'
  };
  
  return unitMap[unit] || unit;
};

// Fonction utilitaire pour formater une quantité
export const formatQuantity = (value: number, unit: string): string => {
  if (value === 0) return "";
  
  // Formater selon l'unité
  if (unit === 'kg' && value >= 1) {
    return `${value}kg`;
  } else if (unit === 'kg' && value < 1) {
    return `${(value * 1000).toFixed(0)}g`;
  } else if (unit === 'l' && value >= 1) {
    return `${value}l`;
  } else if (unit === 'l' && value < 1) {
    return `${(value * 1000).toFixed(0)}ml`;
  } else if (unit === 'unité') {
    // Pour les unités discrètes, ne pas afficher l'unité si c'est 1
    return value === 1 ? "1" : `${value}`;
  } else {
    return `${value}${unit}`;
  }
};

// Fonction utilitaire pour additionner deux quantités
export const addQuantities = (q1: string, q2: string): string => {
  const parsed1 = parseQuantity(q1);
  const parsed2 = parseQuantity(q2);
  
  // Si les unités sont différentes, essayer de les convertir
  if (parsed1.unit !== parsed2.unit) {
    // Convertir en unité commune si possible
    const converted = convertToCommonUnit(parsed2, parsed1.unit);
    if (converted) {
      const totalValue = parsed1.value + converted.value;
      return formatQuantity(totalValue, parsed1.unit);
    }
    // Si pas de conversion possible, garder la première unité
    return formatQuantity(parsed1.value, parsed1.unit);
  }
  
  const totalValue = parsed1.value + parsed2.value;
  return formatQuantity(totalValue, parsed1.unit);
};

// Fonction pour convertir une quantité vers une unité commune
const convertToCommonUnit = (quantity: { value: number; unit: string }, targetUnit: string): { value: number; unit: string } | null => {
  const conversions: { [key: string]: { [key: string]: number } } = {
    'kg': { 'g': 1000 },
    'g': { 'kg': 0.001 },
    'l': { 'ml': 1000, 'cl': 100 },
    'ml': { 'l': 0.001, 'cl': 0.1 },
    'cl': { 'l': 0.01, 'ml': 10 }
  };
  
  if (conversions[quantity.unit] && conversions[quantity.unit][targetUnit]) {
    const multiplier = conversions[quantity.unit][targetUnit];
    return { value: quantity.value * multiplier, unit: targetUnit };
  }
  
  return null;
};

export const CoursesProvider: React.FC<CoursesProviderProps> = ({ children }) => {
  // Liste de courses active (pour la page /courses)
  const [items, setItems] = useState<CourseItem[]>([
    { id: 1, name: "Lait", completed: false, category: "Produits Laitiers" },
    { id: 2, name: "Pain", completed: true, category: "Céréales et Pains" },
    { id: 3, name: "Pommes", completed: false, category: "Fruits et Légumes" },
    { id: 4, name: "Chocolat", completed: false, category: "Sucreries" },
    { id: 5, name: "Yaourts", completed: true, category: "Produits Laitiers" },
  ]);

  // Base de données de gestion (pour la page /courses/gestion) - COMPLÈTEMENT INDÉPENDANTE
  const [databaseItems, setDatabaseItems] = useState<CourseItem[]>([]);

  const [categories, setCategories] = useState([
    "Fruits et Légumes",
    "Viandes et Poissons", 
    "Produits Laitiers",
    "Céréales et Pains",
    "Épices et Condiments",
    "Boissons",
    "Sucreries",
    "Divers",
  ]);

  const [ingredientHistory, setIngredientHistory] = useState<IngredientHistory[]>([]);

  useEffect(() => {
    const savedItems = localStorage.getItem("courseItems");
    const savedDatabaseItems = localStorage.getItem("databaseItems");
    const savedCategories = localStorage.getItem("courseCategories");
    const savedHistory = localStorage.getItem("ingredientHistory");

    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
    if (savedDatabaseItems) {
      setDatabaseItems(JSON.parse(savedDatabaseItems));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    if (savedHistory) {
      setIngredientHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("courseItems", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("databaseItems", JSON.stringify(databaseItems));
  }, [databaseItems]);

  useEffect(() => {
    localStorage.setItem("courseCategories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("ingredientHistory", JSON.stringify(ingredientHistory));
  }, [ingredientHistory]);

  const addItem = (item: Omit<CourseItem, "id">) => {
    setItems((prev) => {
      // Catégoriser automatiquement seulement si aucune catégorie n'est spécifiée
      const categorizedItem = {
        ...item,
        category: item.category || categorizeIngredient(item.name, categories)
      };

      // Enregistrer dans l'historique si c'est un ajout manuel (pas depuis une recette)
      if (!categorizedItem.source || !categorizedItem.source.includes("Recette:")) {
        addToHistory(categorizedItem.name, categorizedItem.category);
      }

      // Chercher un item existant avec le même nom (peu importe la catégorie)
      const existingItemIndex = prev.findIndex(
        (existing) => 
          existing.name.toLowerCase() === categorizedItem.name.toLowerCase()
      );

      if (existingItemIndex !== -1) {
        // Fusionner avec l'item existant
        const existingItem = prev[existingItemIndex];
        const newQuantity = categorizedItem.quantity && existingItem.quantity 
          ? addQuantities(existingItem.quantity, categorizedItem.quantity)
          : categorizedItem.quantity || existingItem.quantity;
        
        // Fusionner les sources
        const newSource = existingItem.source && categorizedItem.source
          ? `${existingItem.source}, ${categorizedItem.source}`
          : categorizedItem.source || existingItem.source;

        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          source: newSource,
        };
        
        return updatedItems;
      } else {
        // Ajouter un nouvel item
        const newItem: CourseItem = {
          ...categorizedItem,
          id: Math.max(...prev.map((item) => item.id), 0) + 1,
        };
        
        return [...prev, newItem];
      }
    });
  };

  const addItems = (newItems: Omit<CourseItem, "id">[]) => {
    setItems((prev) => {
      let updatedItems = [...prev];
      
      newItems.forEach((newItem) => {
        // Catégoriser automatiquement seulement si aucune catégorie n'est spécifiée
        const categorizedItem = {
          ...newItem,
          category: newItem.category || categorizeIngredient(newItem.name, categories)
        };

        // Enregistrer dans l'historique si c'est un ajout manuel (pas depuis une recette)
        if (!categorizedItem.source || !categorizedItem.source.includes("Recette:")) {
          addToHistory(categorizedItem.name, categorizedItem.category);
        }

        // Chercher un item existant avec le même nom (peu importe la catégorie)
        const existingItemIndex = updatedItems.findIndex(
          (existing) => 
            existing.name.toLowerCase() === categorizedItem.name.toLowerCase()
        );

        if (existingItemIndex !== -1) {
          // Fusionner avec l'item existant
          const existingItem = updatedItems[existingItemIndex];
          const newQuantity = categorizedItem.quantity && existingItem.quantity 
            ? addQuantities(existingItem.quantity, categorizedItem.quantity)
            : categorizedItem.quantity || existingItem.quantity;
          
          // Fusionner les sources
          const newSource = existingItem.source && categorizedItem.source
            ? `${existingItem.source}, ${categorizedItem.source}`
            : categorizedItem.source || existingItem.source;

          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            source: newSource,
          };
        } else {
          // Ajouter un nouvel item
          const itemWithId: CourseItem = {
            ...categorizedItem,
            id: Math.max(...updatedItems.map((item) => item.id), 0) + 1,
          };
          updatedItems.push(itemWithId);
        }
      });
      
      return updatedItems;
    });
  };

  const toggleItem = (id: number) => {
    // Supprimer directement l'article de la liste de courses
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: number, updates: Partial<Omit<CourseItem, "id">>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const getItem = (id: number) => {
    return items.find((item) => item.id === id);
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
    // Plus d'articles complétés dans la liste active (ils sont supprimés)
    return 0;
  };

  const getTotalCount = () => {
    return items.length;
  };

  const getIngredientHistory = () => {
    return ingredientHistory;
  };

  const addToHistory = (name: string, category: string) => {
    setIngredientHistory((prev) => {
      const existingItem = prev.find(
        (item) => item.name === name && item.category === category
      );
      if (existingItem) {
        return prev.map((item) =>
          item.name === name && item.category === category
            ? { ...item, usageCount: item.usageCount + 1, lastUsed: Date.now() }
            : item
        );
      } else {
        return [
          ...prev,
          {
            name,
            category,
            lastUsed: Date.now(),
            usageCount: 1,
          },
        ];
      }
    });
  };

  // Fonctions pour la base de données de gestion (COMPLÈTEMENT INDÉPENDANTE)
  const addDatabaseItem = (item: Omit<CourseItem, "id">) => {
    setDatabaseItems((prev) => {
      const newItem: CourseItem = {
        ...item,
        id: Math.max(...prev.map((item) => item.id), 0) + 1,
      };
      return [...prev, newItem];
    });
  };

  const updateDatabaseItem = (id: number, updates: Partial<Omit<CourseItem, "id">>) => {
    setDatabaseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteDatabaseItem = (id: number) => {
    setDatabaseItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getDatabaseItem = (id: number) => {
    return databaseItems.find((item) => item.id === id);
  };

  const getDatabaseItems = () => {
    return databaseItems;
  };

  const value: CoursesContextType = {
    items,
    categories,
    ingredientHistory,
    addItem,
    addItems,
    toggleItem,
    deleteItem,
    updateItem,
    getItem,
    addCategory,
    deleteCategory,
    updateCategory,
    getItemsByCategory,
    getCompletedCount,
    getTotalCount,
    getIngredientHistory,
    addToHistory,
    // Fonctions pour la base de données de gestion (INDÉPENDANTE)
    databaseItems,
    addDatabaseItem,
    updateDatabaseItem,
    deleteDatabaseItem,
    getDatabaseItem,
    getDatabaseItems,
  };

  return (
    <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
  );
}; 