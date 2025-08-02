"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { categorizeIngredient } from "@/lib/ingredient-database";

// Fonction utilitaire pour sauvegarder en localStorage avec gestion d'erreur
const saveToLocalStorage = (key: string, data: any): boolean => {
  try {
    // Vérifier la taille des données avant sauvegarde
    const dataSize = new Blob([JSON.stringify(data)]).size;
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB pour être sûr
    
    if (dataSize > maxSize) {
      console.warn(`Données trop volumineuses (${(dataSize / 1024 / 1024).toFixed(2)}MB) pour localStorage`);
      return false;
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

export interface CourseItem {
  id: number;
  name: string;
  completed: boolean;
  category: string;
  unit?: string; // Unité de mesure (g, kg, l, ml, unité, etc.) ou vide pour unités simples
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
  addItemsFromRecipe: (ingredients: Array<{ name: string; quantity: string }>, recipeName: string) => void;
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
  resetDatabaseItems: () => void;
  cleanIngredientHistory: () => void;
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

  // Articles par défaut pour la base de données de gestion
  const defaultDatabaseItems: CourseItem[] = [
    { id: 1, name: "Lait", completed: false, category: "Produits Laitiers", unit: "l" },
    { id: 2, name: "Pain", completed: false, category: "Céréales et Pains", unit: "" }, // Unité simple
    { id: 3, name: "Pommes", completed: false, category: "Fruits et Légumes", unit: "" }, // Unité simple
    { id: 4, name: "Yaourt", completed: false, category: "Produits Laitiers", unit: "" }, // Unité simple
    { id: 5, name: "Poulet", completed: false, category: "Viandes et Poissons", unit: "g" },
    { id: 6, name: "Riz", completed: false, category: "Céréales et Pains", unit: "kg" },
    { id: 7, name: "Tomates", completed: false, category: "Fruits et Légumes", unit: "" }, // Unité simple
    { id: 8, name: "Fromage", completed: false, category: "Produits Laitiers", unit: "g" },
  ];

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

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedItems = loadFromLocalStorage("courseItems");
      const savedDatabaseItems = loadFromLocalStorage("babounette-database-items");
      const savedCategories = loadFromLocalStorage("courseCategories");
      const savedHistory = loadFromLocalStorage("ingredientHistory");

      if (savedItems) {
        setItems(savedItems);
      }
      if (savedDatabaseItems) {
        setDatabaseItems(savedDatabaseItems);
      } else {
        // Première utilisation, utiliser les articles par défaut
        setDatabaseItems(defaultDatabaseItems);
        saveToLocalStorage("babounette-database-items", defaultDatabaseItems);
      }
      if (savedCategories) {
        setCategories(savedCategories);
      }
      if (savedHistory) {
        setIngredientHistory(savedHistory);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  }, []);

  // Sauvegarder les items de la liste de courses
  useEffect(() => {
    if (items.length > 0) {
      const success = saveToLocalStorage("courseItems", items);
      if (!success) {
        console.warn("Impossible de sauvegarder les items de la liste de courses");
      }
    }
  }, [items]);

  // Sauvegarder la base de données de gestion
  useEffect(() => {
    if (databaseItems.length > 0) {
      const success = saveToLocalStorage("babounette-database-items", databaseItems);
      if (!success) {
        console.warn("Impossible de sauvegarder la base de données de gestion");
      }
    } else {
      // Si la base de données est vide, supprimer la clé du localStorage
      localStorage.removeItem("babounette-database-items");
    }
  }, [databaseItems]);

  // Sauvegarder les catégories
  useEffect(() => {
    const success = saveToLocalStorage("courseCategories", categories);
    if (!success) {
      console.warn("Impossible de sauvegarder les catégories");
    }
  }, [categories]);

  // Sauvegarder l'historique des ingrédients
  useEffect(() => {
    if (ingredientHistory.length > 0) {
      const success = saveToLocalStorage("ingredientHistory", ingredientHistory);
      if (!success) {
        console.warn("Impossible de sauvegarder l'historique des ingrédients");
      }
    } else {
      // Si l'historique est vide, supprimer la clé du localStorage
      localStorage.removeItem("ingredientHistory");
    }
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
         // Pour les unités, on garde la première unité rencontrée
         const newUnit = categorizedItem.unit || existingItem.unit;
        
         // Fusionner les sources
         const newSource = existingItem.source && categorizedItem.source
           ? `${existingItem.source}, ${categorizedItem.source}`
           : categorizedItem.source || existingItem.source;

         const updatedItems = [...prev];
         updatedItems[existingItemIndex] = {
           ...existingItem,
           unit: newUnit,
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
           // Pour les unités, on garde la première unité rencontrée
           const newUnit = categorizedItem.unit || existingItem.unit;
           
           // Fusionner les sources
           const newSource = existingItem.source && categorizedItem.source
             ? `${existingItem.source}, ${categorizedItem.source}`
             : categorizedItem.source || existingItem.source;

           updatedItems[existingItemIndex] = {
             ...existingItem,
             unit: newUnit,
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

  const addItemsFromRecipe = (ingredients: Array<{ name: string; quantity: string }>, recipeName: string) => {
    const convertedItems: Omit<CourseItem, "id">[] = ingredients.map((ingredient) => {
      // Chercher l'ingrédient dans la base de données de gestion
      const databaseItem = databaseItems.find(
        item => item.name.toLowerCase() === ingredient.name.toLowerCase()
      );

      // Si l'ingrédient existe dans la base de données, utiliser son unité
      if (databaseItem && databaseItem.unit) {
        // Parser la quantité de la recette
        const parsedQuantity = parseQuantity(ingredient.quantity);
        
        // Si la quantité a une unité, essayer de la convertir
        let finalQuantity = ingredient.quantity;
        if (parsedQuantity.unit && parsedQuantity.unit !== databaseItem.unit) {
          const converted = convertToCommonUnit(parsedQuantity, databaseItem.unit);
          if (converted) {
            finalQuantity = formatQuantity(converted.value, converted.unit);
          }
        }
        
        return {
          name: ingredient.name,
          completed: false,
          category: databaseItem.category,
          unit: databaseItem.unit,
          source: `Recette: ${recipeName} (${finalQuantity})`,
        };
      } else {
        // Si l'ingrédient n'existe pas dans la base de données, utiliser la quantité originale
        return {
          name: ingredient.name,
          completed: false,
          category: categorizeIngredient(ingredient.name, categories),
          source: `Recette: ${recipeName} (${ingredient.quantity})`,
        };
      }
    });

    // Ajouter les items convertis
    addItems(convertedItems);
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
    setDatabaseItems((prev) => {
      const itemToDelete = prev.find((item) => item.id === id);
      if (itemToDelete) {
        // Nettoyer l'historique pour cet article supprimé
        setIngredientHistory((history) => 
          history.filter((histItem) => 
            !(histItem.name.toLowerCase() === itemToDelete.name.toLowerCase() && 
              histItem.category === itemToDelete.category)
          )
        );
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const getDatabaseItem = (id: number) => {
    return databaseItems.find((item) => item.id === id);
  };

  const getDatabaseItems = () => {
    return databaseItems;
  };

  const resetDatabaseItems = () => {
    setDatabaseItems(defaultDatabaseItems);
    saveToLocalStorage("babounette-database-items", defaultDatabaseItems);
    
    // Nettoyer l'historique des ingrédients qui ne sont plus dans la base de données
    setIngredientHistory((history) => {
      const currentDatabaseNames = defaultDatabaseItems.map(item => 
        item.name.toLowerCase()
      );
      return history.filter((histItem) => 
        currentDatabaseNames.includes(histItem.name.toLowerCase())
      );
    });
  };

  const cleanIngredientHistory = () => {
    setIngredientHistory((history) => {
      const currentDatabaseNames = databaseItems.map(item => 
        item.name.toLowerCase()
      );
      return history.filter((histItem) => 
        currentDatabaseNames.includes(histItem.name.toLowerCase())
      );
    });
  };

  const value: CoursesContextType = {
    items,
    categories,
    ingredientHistory,
    addItem,
    addItems,
    addItemsFromRecipe,
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
    resetDatabaseItems,
    cleanIngredientHistory,
  };

  return (
    <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
  );
}; 