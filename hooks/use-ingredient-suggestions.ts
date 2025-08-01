import { useMemo } from "react";
import { useRecettes } from "@/contexts/recettes-context";
import { useCourses } from "@/contexts/courses-context";
import { INGREDIENT_DATABASE } from "@/lib/ingredient-database";

// Interface pour les suggestions avec catégorie
export interface IngredientSuggestion {
  name: string;
  category: string;
  source: 'database' | 'history' | 'ingredients' | 'recipes';
}

export const useIngredientSuggestions = (searchTerm: string = "") => {
  const { recettes } = useRecettes();
  const { ingredientHistory, databaseItems } = useCourses();

  const suggestions = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    // Structure pour conserver les noms et catégories
    const allSuggestions: IngredientSuggestion[] = [];
    
    // Ajouter les ingrédients de la base de données avec leurs catégories
    Object.entries(INGREDIENT_DATABASE).forEach(([category, ingredients]) => {
      ingredients.forEach(ingredient => {
        if (ingredient.toLowerCase().includes(normalizedSearch)) {
          allSuggestions.push({
            name: ingredient,
            category,
            source: 'ingredients'
          });
        }
      });
    });
    
    // Extraire les ingrédients des recettes existantes
    recettes.forEach(recette => {
      recette.ingredients.forEach(ingredient => {
        if (ingredient.name.toLowerCase().includes(normalizedSearch)) {
          allSuggestions.push({
            name: ingredient.name,
            category: "Divers", // Les ingrédients des recettes n'ont pas de catégorie
            source: 'recipes'
          });
        }
      });
    });
    
    // Ajouter les ingrédients de l'historique manuel avec leurs catégories
    ingredientHistory.forEach(item => {
      if (item.name.toLowerCase().includes(normalizedSearch)) {
        allSuggestions.push({
          name: item.name,
          category: item.category,
          source: 'history'
        });
      }
    });
    
    // Ajouter les articles de la base de données de gestion avec leurs catégories
    databaseItems.forEach(item => {
      if (item.name.toLowerCase().includes(normalizedSearch)) {
        allSuggestions.push({
          name: item.name,
          category: item.category,
          source: 'database'
        });
      }
    });
    
    // Dédupliquer par nom et catégorie
    const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.name === suggestion.name && s.category === suggestion.category)
    );
    
    // Trier par pertinence (base de données de gestion en premier, puis historique manuel, puis exact match, puis par ordre alphabétique)
    const sortedSuggestions = uniqueSuggestions.sort((a, b) => {
      // Priorité 1: Base de données de gestion
      if (a.source === 'database' && b.source !== 'database') return -1;
      if (a.source !== 'database' && b.source === 'database') return 1;
      
      // Priorité 2: Historique manuel
      if (a.source === 'history' && b.source !== 'history') return -1;
      if (a.source !== 'history' && b.source === 'history') return 1;
      
      // Priorité 3: Exact match
      const aExact = a.name.toLowerCase() === normalizedSearch;
      const bExact = b.name.toLowerCase() === normalizedSearch;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Priorité 4: Ordre alphabétique
      return a.name.localeCompare(b.name, 'fr');
    });
    
    return sortedSuggestions.slice(0, 20); // Limiter à 20 suggestions
  }, [searchTerm, recettes, ingredientHistory, databaseItems]);

  const suggestionsByCategory = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const categorizedSuggestions: { [key: string]: string[] } = {};
    
    // Ajouter les ingrédients de la base de données
    Object.entries(INGREDIENT_DATABASE).forEach(([category, ingredients]) => {
      const filtered = ingredients.filter(ingredient =>
        ingredient.toLowerCase().includes(normalizedSearch)
      );
      
      if (filtered.length > 0) {
        categorizedSuggestions[category] = filtered.slice(0, 10);
      }
    });
    
    // Ajouter les ingrédients de l'historique manuel
    ingredientHistory.forEach(item => {
      if (item.name.toLowerCase().includes(normalizedSearch)) {
        if (!categorizedSuggestions[item.category]) {
          categorizedSuggestions[item.category] = [];
        }
        if (!categorizedSuggestions[item.category].includes(item.name)) {
          categorizedSuggestions[item.category].push(item.name);
        }
      }
    });
    
    // Ajouter les articles de la base de données de gestion
    databaseItems.forEach(item => {
      if (item.name.toLowerCase().includes(normalizedSearch)) {
        if (!categorizedSuggestions[item.category]) {
          categorizedSuggestions[item.category] = [];
        }
        if (!categorizedSuggestions[item.category].includes(item.name)) {
          categorizedSuggestions[item.category].push(item.name);
        }
      }
    });
    
    return categorizedSuggestions;
  }, [searchTerm, ingredientHistory, databaseItems]);

  const popularSuggestions = useMemo(() => {
    // Combiner les ingrédients populaires des recettes, de l'historique et de la base de données
    const ingredientCount: { [key: string]: number } = {};
    
    // Compter les ingrédients des recettes
    recettes.forEach(recette => {
      recette.ingredients.forEach(ingredient => {
        const name = ingredient.name.toLowerCase();
        ingredientCount[name] = (ingredientCount[name] || 0) + 1;
      });
    });
    
    // Ajouter les ingrédients de l'historique avec leur compteur d'utilisation
    ingredientHistory.forEach(item => {
      const name = item.name.toLowerCase();
      ingredientCount[name] = (ingredientCount[name] || 0) + item.usageCount;
    });
    
    // Ajouter les articles de la base de données de gestion
    databaseItems.forEach(item => {
      const name = item.name.toLowerCase();
      ingredientCount[name] = (ingredientCount[name] || 0) + 1; // +1 pour chaque article de la base
    });
    
    return Object.entries(ingredientCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name]) => name);
  }, [recettes, ingredientHistory, databaseItems]);

  return {
    suggestions: suggestions.map(s => s.name), // Compatibilité avec l'existant
    suggestionsWithCategories: suggestions, // Nouvelles suggestions avec catégories
    suggestionsByCategory,
    popularSuggestions,
    allCategories: [...new Set([
      ...Object.keys(INGREDIENT_DATABASE), 
      ...ingredientHistory.map(item => item.category),
      ...databaseItems.map(item => item.category)
    ])]
  };
}; 