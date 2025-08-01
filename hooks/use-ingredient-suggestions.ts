import { useState, useEffect, useMemo } from "react";
import { useRecettes } from "@/contexts/recettes-context";

export interface IngredientSuggestion {
  name: string;
  frequency: number; // Nombre de fois où cet ingrédient apparaît
  lastUsed?: string; // Date de dernière utilisation
}

export const useIngredientSuggestions = () => {
  const { recettes } = useRecettes();
  const [suggestions, setSuggestions] = useState<IngredientSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<IngredientSuggestion[]>([]);

  // Extraire tous les ingrédients uniques des recettes existantes
  const allIngredients = useMemo(() => {
    const ingredientMap = new Map<string, { count: number; lastUsed?: string }>();
    
    recettes.forEach(recette => {
      recette.ingredients.forEach(ingredient => {
        const name = ingredient.name.trim().toLowerCase();
        if (name) {
          const existing = ingredientMap.get(name);
          if (existing) {
            existing.count++;
          } else {
            ingredientMap.set(name, { count: 1 });
          }
        }
      });
    });

    return Array.from(ingredientMap.entries()).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitaliser
      frequency: data.count,
      lastUsed: data.lastUsed
    })).sort((a, b) => b.frequency - a.frequency); // Trier par fréquence décroissante
  }, [recettes]);

  // Mettre à jour les suggestions
  useEffect(() => {
    setSuggestions(allIngredients);
  }, [allIngredients]);

  // Filtrer les suggestions basées sur l'entrée utilisateur
  const filterSuggestions = (input: string) => {
    if (!input.trim()) {
      setFilteredSuggestions(suggestions.slice(0, 10)); // Top 10 par défaut
      return;
    }

    const inputLower = input.toLowerCase();
    const filtered = suggestions
      .filter(suggestion => 
        suggestion.name.toLowerCase().includes(inputLower)
      )
      .slice(0, 8); // Limiter à 8 suggestions

    setFilteredSuggestions(filtered);
  };

  // Obtenir les suggestions populaires (top 10)
  const getPopularSuggestions = () => {
    return suggestions.slice(0, 10);
  };

  // Obtenir les suggestions récentes (si on avait un historique)
  const getRecentSuggestions = () => {
    return suggestions.slice(0, 5); // Pour l'instant, retourne les 5 premiers
  };

  return {
    suggestions: filteredSuggestions,
    popularSuggestions: getPopularSuggestions(),
    recentSuggestions: getRecentSuggestions(),
    filterSuggestions,
    clearSuggestions: () => setFilteredSuggestions([])
  };
}; 