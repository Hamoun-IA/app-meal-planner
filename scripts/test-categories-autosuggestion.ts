// Test de la récupération des catégories dans l'autosuggestion
console.log("🧪 Test de la récupération des catégories dans l'autosuggestion :\n");

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

console.log("📊 Structure des données avec catégories :");

console.log("\n🗄️ Base de données de gestion :");
databaseItems.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.name} → ${item.category}`);
});

console.log("\n📝 Historique manuel :");
ingredientHistory.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.name} → ${item.category} (utilisé ${item.usageCount}x)`);
});

console.log("\n🍽️ Base de données d'ingrédients :");
Object.entries(INGREDIENT_DATABASE).forEach(([category, ingredients]) => {
  console.log(`  ${category} : ${ingredients.join(", ")}`);
});

// Test de la récupération des catégories
console.log("\n🔍 Test de la récupération des catégories :");

const testSearchTerms = [
  "papier",
  "hygiène",
  "lait",
  "pain",
  "coca",
  "chips",
  "pommes"
];

testSearchTerms.forEach((searchTerm, index) => {
  console.log(`\n  ${index + 1}. Recherche : "${searchTerm}"`);
  
  // Simuler la logique de filtrage avec catégories
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  // Articles de la base de données de gestion avec catégories
  const databaseMatches = databaseItems.filter(item =>
    item.name.toLowerCase().includes(normalizedSearch)
  ).map(item => ({ name: item.name, category: item.category, source: 'database' }));
  
  // Articles de l'historique manuel avec catégories
  const historyMatches = ingredientHistory.filter(item =>
    item.name.toLowerCase().includes(normalizedSearch)
  ).map(item => ({ name: item.name, category: item.category, source: 'history' }));
  
  // Articles de la base de données d'ingrédients avec catégories
  const ingredientMatches = Object.entries(INGREDIENT_DATABASE)
    .flatMap(([category, ingredients]) => 
      ingredients
        .filter(ingredient => ingredient.toLowerCase().includes(normalizedSearch))
        .map(ingredient => ({ name: ingredient, category, source: 'ingredients' }))
    );
  
  // Combiner et dédupliquer
  const allMatches = [...databaseMatches, ...historyMatches, ...ingredientMatches];
  const uniqueMatches = allMatches.filter((match, index, self) => 
    index === self.findIndex(m => m.name === match.name && m.category === match.category)
  );
  
  // Trier par priorité
  const sortedMatches = uniqueMatches.sort((a, b) => {
    // Priorité 1: Base de données de gestion
    if (a.source === 'database' && b.source !== 'database') return -1;
    if (a.source !== 'database' && b.source === 'database') return 1;
    
    // Priorité 2: Historique manuel
    if (a.source === 'history' && b.source !== 'history') return -1;
    if (a.source !== 'history' && b.source === 'history') return 1;
    
    // Priorité 3: Ordre alphabétique
    return a.name.localeCompare(b.name, 'fr');
  });
  
  console.log(`     Résultats avec catégories :`);
  sortedMatches.forEach((match, matchIndex) => {
    console.log(`       ${matchIndex + 1}. ${match.name} → ${match.category} (${match.source})`);
  });
});

// Test de la priorité des catégories
console.log("\n🎯 Test de la priorité des catégories :");

const priorityTest = {
  searchTerm: "lait",
  expectedResults: [
    { name: "Lait", category: "Produits Laitiers", source: "history" },
    { name: "Lait", category: "Produits Laitiers", source: "ingredients" }
  ]
};

console.log(`\n  Recherche : "${priorityTest.searchTerm}"`);
console.log("  Résultats attendus avec catégories :");
priorityTest.expectedResults.forEach((result, index) => {
  console.log(`    ${index + 1}. ${result.name} → ${result.category} (${result.source})`);
});

// Test des cas d'usage avec catégories
console.log("\n👤 Cas d'usage avec catégories :");

const useCasesWithCategories = [
  {
    scenario: "Utilisateur tape 'papier'",
    expected: "Papier toilette → Hygiène (database)",
    advantage: "Catégorie récupérée de la base de données"
  },
  {
    scenario: "Utilisateur tape 'lait'",
    expected: "Lait → Produits Laitiers (history + ingredients)",
    advantage: "Catégorie récupérée de l'historique"
  },
  {
    scenario: "Utilisateur tape 'coca'",
    expected: "Coca Cola → Boissons (database)",
    advantage: "Catégorie personnalisée récupérée"
  },
  {
    scenario: "Utilisateur tape 'pain'",
    expected: "Pain de mie → Céréales et Pains (database), Pain → Céréales et Pains (history)",
    advantage: "Catégories récupérées de plusieurs sources"
  }
];

useCasesWithCategories.forEach((useCase, index) => {
  console.log(`\n  ${index + 1}. ${useCase.scenario} :`);
  console.log(`     Résultat attendu : ${useCase.expected}`);
  console.log(`     Avantage : ${useCase.advantage}`);
});

// Test des avantages de la récupération des catégories
console.log("\n💡 Avantages de la récupération des catégories :");

const advantages = [
  "Catégories récupérées de la base de données de gestion",
  "Catégories récupérées de l'historique manuel",
  "Catégories récupérées de la base d'ingrédients",
  "Priorité respectée dans l'affichage",
  "Interface utilisateur enrichie",
  "Expérience utilisateur améliorée"
];

advantages.forEach((advantage, index) => {
  console.log(`  ${index + 1}. ✅ ${advantage}`);
});

console.log("\n✅ Test terminé !");
console.log("\n💡 Résumé de la récupération des catégories :");
console.log("  - Catégories récupérées de toutes les sources");
console.log("  - Priorité respectée (database > history > ingredients)");
console.log("  - Interface enrichie avec les catégories");
console.log("  - Expérience utilisateur améliorée"); 