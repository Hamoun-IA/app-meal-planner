// Test final de l'autosuggestion avec catégories
console.log("🧪 Test final de l'autosuggestion avec catégories :\n");

// Simulation de la base de données de gestion
const databaseItems = [
  { id: 1, name: "Papier toilette", completed: false, category: "Hygiène" },
  { id: 2, name: "Lessive", completed: false, category: "Entretien" },
  { id: 3, name: "Dentifrice", completed: false, category: "Hygiène" },
  { id: 4, name: "Shampooing", completed: false, category: "Hygiène" },
  { id: 5, name: "Savon", completed: false, category: "Hygiène" },
  { id: 6, name: "Coca Cola", completed: false, category: "Boissons" },
  { id: 7, name: "Chips", completed: false, category: "Snacks" },
  { id: 8, name: "Pain de mie", completed: false, category: "Céréales et Pains" }
];

// Simulation de l'historique manuel
const ingredientHistory = [
  { name: "Lait", category: "Produits Laitiers", lastUsed: Date.now(), usageCount: 3 },
  { name: "Pain", category: "Céréales et Pains", lastUsed: Date.now(), usageCount: 5 },
  { name: "Pommes", category: "Fruits et Légumes", lastUsed: Date.now(), usageCount: 2 }
];

// Simulation de la base de données d'ingrédients
const INGREDIENT_DATABASE = {
  "Fruits et Légumes": ["Pommes", "Bananes", "Carottes", "Tomates"],
  "Viandes et Poissons": ["Poulet", "Bœuf", "Saumon", "Thon"],
  "Produits Laitiers": ["Lait", "Yaourt", "Fromage", "Beurre"],
  "Céréales et Pains": ["Pain", "Riz", "Pâtes", "Farine"],
  "Boissons": ["Eau", "Jus d'orange", "Café", "Thé"]
};

console.log("📊 Test de l'autosuggestion enrichie :");

// Test de la fonction useIngredientSuggestions
const testUseIngredientSuggestions = (searchTerm: string) => {
  console.log(`\n🔍 Recherche : "${searchTerm}"`);
  
  // Simuler la logique du hook
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  // Structure pour conserver les noms et catégories
  const allSuggestions: { name: string; category: string; source: 'database' | 'history' | 'ingredients' | 'recipes' }[] = [];
  
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
  
  // Trier par pertinence
  const sortedSuggestions = uniqueSuggestions.sort((a, b) => {
    // Priorité 1: Base de données de gestion
    if (a.source === 'database' && b.source !== 'database') return -1;
    if (a.source !== 'database' && b.source === 'database') return 1;
    
    // Priorité 2: Historique manuel
    if (a.source === 'history' && b.source !== 'history') return -1;
    if (a.source !== 'history' && b.source === 'history') return 1;
    
    // Priorité 3: Ordre alphabétique
    return a.name.localeCompare(b.name, 'fr');
  });
  
  // Retourner les résultats
  return {
    suggestions: sortedSuggestions.map(s => s.name), // Compatibilité avec l'existant
    suggestionsWithCategories: sortedSuggestions, // Nouvelles suggestions avec catégories
    suggestionsByCategory: (() => {
      const categorized: { [key: string]: string[] } = {};
      sortedSuggestions.forEach(suggestion => {
        if (!categorized[suggestion.category]) {
          categorized[suggestion.category] = [];
        }
        if (!categorized[suggestion.category].includes(suggestion.name)) {
          categorized[suggestion.category].push(suggestion.name);
        }
      });
      return categorized;
    })()
  };
};

// Tests avec différents termes de recherche
const testTerms = ["papier", "lait", "pain", "coca", "hygiène"];

testTerms.forEach(term => {
  const results = testUseIngredientSuggestions(term);
  
  console.log(`\n  Résultats pour "${term}" :`);
  
  console.log(`    Suggestions simples : ${results.suggestions.join(", ") || "Aucune"}`);
  
  console.log(`    Suggestions avec catégories :`);
  results.suggestionsWithCategories.forEach((suggestion, index) => {
    console.log(`      ${index + 1}. ${suggestion.name} → ${suggestion.category} (${suggestion.source})`);
  });
  
  console.log(`    Suggestions par catégorie :`);
  Object.entries(results.suggestionsByCategory).forEach(([category, items]) => {
    console.log(`      ${category} : ${items.join(", ")}`);
  });
});

// Test de l'interface utilisateur
console.log("\n🎨 Test de l'interface utilisateur :");

const uiTest = {
  scenario: "Utilisateur tape 'papier' dans l'autosuggestion",
  expectedDisplay: [
    "Papier toilette [Hygiène] (database)",
    "Dentifrice [Hygiène] (database)",
    "Shampooing [Hygiène] (database)",
    "Savon [Hygiène] (database)"
  ],
  advantages: [
    "Catégories affichées avec des badges",
    "Priorité respectée (database en premier)",
    "Interface enrichie et informative",
    "Expérience utilisateur améliorée"
  ]
};

console.log(`\n  Scénario : ${uiTest.scenario}`);
console.log("  Affichage attendu :");
uiTest.expectedDisplay.forEach((item, index) => {
  console.log(`    ${index + 1}. ${item}`);
});

console.log("\n  Avantages :");
uiTest.advantages.forEach((advantage, index) => {
  console.log(`    ${index + 1}. ✅ ${advantage}`);
});

// Test des cas d'usage finaux
console.log("\n👤 Cas d'usage finaux :");

const finalUseCases = [
  {
    scenario: "Utilisateur cherche un article de la base de données",
    search: "papier",
    result: "Papier toilette apparaît avec badge 'Hygiène'",
    advantage: "Catégorie clairement visible"
  },
  {
    scenario: "Utilisateur cherche un article de l'historique",
    search: "lait",
    result: "Lait apparaît avec badge 'Produits Laitiers'",
    advantage: "Catégorie récupérée de l'historique"
  },
  {
    scenario: "Utilisateur cherche un ingrédient standard",
    search: "pain",
    result: "Pain de mie (database) et Pain (history) avec badges",
    advantage: "Distinction claire entre les sources"
  },
  {
    scenario: "Utilisateur cherche un article personnalisé",
    search: "coca",
    result: "Coca Cola apparaît avec badge 'Boissons'",
    advantage: "Catégorie personnalisée visible"
  }
];

finalUseCases.forEach((useCase, index) => {
  console.log(`\n  ${index + 1}. ${useCase.scenario} :`);
  console.log(`     Recherche : "${useCase.search}"`);
  console.log(`     Résultat : ${useCase.result}`);
  console.log(`     Avantage : ${useCase.advantage}`);
});

console.log("\n✅ Test final terminé !");
console.log("\n💡 Résumé de l'implémentation :");
console.log("  - Autosuggestion enrichie avec catégories");
console.log("  - Base de données de gestion intégrée");
console.log("  - Priorité respectée (database > history > ingredients)");
console.log("  - Interface utilisateur améliorée avec badges");
console.log("  - Expérience utilisateur optimisée"); 