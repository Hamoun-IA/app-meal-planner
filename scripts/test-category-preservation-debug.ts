// Test de débogage pour la préservation des catégories
console.log("🧪 Test de débogage pour la préservation des catégories :\n");

// Simulation de la base de données de gestion
const databaseItems = [
  { id: 1, name: "Papier toilette", completed: false, category: "Hygiène" },
  { id: 2, name: "Lessive", completed: false, category: "Entretien" },
  { id: 3, name: "Dentifrice", completed: false, category: "Hygiène" },
  { id: 4, name: "Coca Cola", completed: false, category: "Boissons" },
  { id: 5, name: "Chips", completed: false, category: "Snacks" }
];

// Simulation de l'historique manuel
const ingredientHistory = [
  { name: "Lait", category: "Produits Laitiers", lastUsed: Date.now(), usageCount: 3 },
  { name: "Pain", category: "Céréales et Pains", lastUsed: Date.now(), usageCount: 5 }
];

// Simulation de la base de données d'ingrédients
const INGREDIENT_DATABASE = {
  "Produits Laitiers": ["Lait", "Yaourt", "Fromage"],
  "Céréales et Pains": ["Pain", "Riz", "Pâtes"],
  "Fruits et Légumes": ["Pommes", "Bananes", "Carottes"]
};

console.log("📊 Test de la génération des suggestions :");

// Simuler la génération des suggestions (comme dans useIngredientSuggestions)
const generateSuggestions = (searchTerm: string) => {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  const allSuggestions: Array<{name: string, category: string, source: string}> = [];
  
  // Ajouter les ingrédients de la base de données
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
  
  // Ajouter les articles de la base de données de gestion
  databaseItems.forEach(item => {
    if (item.name.toLowerCase().includes(normalizedSearch)) {
      allSuggestions.push({
        name: item.name,
        category: item.category,
        source: 'database'
      });
    }
  });
  
  // Ajouter l'historique manuel
  ingredientHistory.forEach(item => {
    if (item.name.toLowerCase().includes(normalizedSearch)) {
      allSuggestions.push({
        name: item.name,
        category: item.category,
        source: 'history'
      });
    }
  });
  
  // Dédupliquer
  const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) => 
    index === self.findIndex(s => s.name === suggestion.name && s.category === suggestion.category)
  );
  
  // Trier par priorité
  const sortedSuggestions = uniqueSuggestions.sort((a, b) => {
    if (a.source === 'database' && b.source !== 'database') return -1;
    if (a.source !== 'database' && b.source === 'database') return 1;
    if (a.source === 'history' && b.source !== 'history') return -1;
    if (a.source !== 'history' && b.source === 'history') return 1;
    return a.name.localeCompare(b.name, 'fr');
  });
  
  return sortedSuggestions.slice(0, 20);
};

// Test avec différents termes de recherche
const testSearchTerms = [
  "papier",
  "lait",
  "coca",
  "chips",
  "dentifrice"
];

testSearchTerms.forEach(searchTerm => {
  console.log(`\n🔍 Recherche pour "${searchTerm}" :`);
  const suggestions = generateSuggestions(searchTerm);
  
  if (suggestions.length > 0) {
    console.log(`  Suggestions trouvées :`);
    suggestions.forEach((suggestion, index) => {
      console.log(`    ${index + 1}. "${suggestion.name}" → ${suggestion.category} (${suggestion.source})`);
    });
  } else {
    console.log(`  Aucune suggestion trouvée`);
  }
});

// Test de la logique de sélection
console.log("\n🔧 Test de la logique de sélection :");

const testSelectionLogic = (selectedItem: string, selectedCategory: string = "") => {
  console.log(`\n📝 Sélection de "${selectedItem}" (catégorie sélectionnée: "${selectedCategory}")`);
  
  // Simuler la recherche dans les suggestions
  const suggestions = generateSuggestions(selectedItem);
  const existingSuggestion = suggestions.find(
    suggestion => suggestion.name.toLowerCase() === selectedItem.toLowerCase()
  );
  
  console.log(`  Recherche dans suggestions : ${suggestions.length} suggestions disponibles`);
  
  if (existingSuggestion) {
    console.log(`  ✅ Suggestion trouvée : "${existingSuggestion.name}" → ${existingSuggestion.category} (${existingSuggestion.source})`);
  } else {
    console.log(`  ❌ Aucune suggestion trouvée pour "${selectedItem}"`);
  }
  
  // Déterminer la catégorie finale
  let finalCategory = selectedCategory;
  if (!finalCategory && existingSuggestion) {
    finalCategory = existingSuggestion.category;
    console.log(`  📌 Catégorie déterminée depuis les suggestions : "${finalCategory}"`);
  } else if (finalCategory) {
    console.log(`  📌 Catégorie utilisée depuis la sélection : "${finalCategory}"`);
  } else {
    console.log(`  ⚠️ Aucune catégorie déterminée`);
  }
  
  return finalCategory;
};

// Tests de sélection
const selectionTests = [
  {
    item: "Papier toilette",
    selectedCategory: "Hygiène",
    expected: "Hygiène",
    description: "Article de la base de données avec catégorie sélectionnée"
  },
  {
    item: "Papier toilette",
    selectedCategory: "",
    expected: "Hygiène",
    description: "Article de la base de données sans catégorie sélectionnée"
  },
  {
    item: "Lait",
    selectedCategory: "",
    expected: "Produits Laitiers",
    description: "Article de l'historique sans catégorie sélectionnée"
  },
  {
    item: "Coca Cola",
    selectedCategory: "",
    expected: "Boissons",
    description: "Article de la base de données sans catégorie sélectionnée"
  }
];

selectionTests.forEach((test, index) => {
  console.log(`\n  ${index + 1}. ${test.description} :`);
  const result = testSelectionLogic(test.item, test.selectedCategory);
  
  if (result === test.expected) {
    console.log(`     ✅ Résultat correct : "${result}"`);
  } else {
    console.log(`     ❌ Résultat incorrect : "${result}" (attendu: "${test.expected}")`);
  }
});

// Test de débogage spécifique
console.log("\n🐛 Débogage spécifique :");

const debugSpecificCases = [
  {
    case: "Pourquoi 'Papier toilette' ne garde pas sa catégorie ?",
    steps: [
      "1. Utilisateur tape 'papier'",
      "2. Suggestions incluent 'Papier toilette' de la base de données",
      "3. Utilisateur sélectionne 'Papier toilette'",
      "4. onSelectWithCategory devrait être appelé avec 'Hygiène'",
      "5. selectedItemCategory devrait être mis à jour",
      "6. handleAddItem devrait utiliser cette catégorie"
    ]
  }
];

debugSpecificCases.forEach((debugCase, index) => {
  console.log(`\n  ${index + 1}. ${debugCase.case}`);
  debugCase.steps.forEach(step => {
    console.log(`     ${step}`);
  });
});

console.log("\n✅ Test de débogage terminé !");
console.log("\n💡 Points à vérifier :");
console.log("  - Les suggestions incluent-elles bien les databaseItems ?");
console.log("  - onSelectWithCategory est-il appelé correctement ?");
console.log("  - selectedItemCategory est-il mis à jour ?");
console.log("  - handleAddItem utilise-t-il la bonne catégorie ?"); 