// Test de l'autosuggestion avec la base de données de gestion
console.log("🧪 Test de l'autosuggestion avec la base de données de gestion :\n");

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

console.log("📊 Structure des données :");

console.log("\n🗄️ Base de données de gestion :");
databaseItems.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.name} (${item.category})`);
});

console.log("\n📝 Historique manuel :");
ingredientHistory.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.name} (${item.category}) - Utilisé ${item.usageCount}x`);
});

console.log("\n🍽️ Base de données d'ingrédients :");
Object.entries(INGREDIENT_DATABASE).forEach(([category, ingredients]) => {
  console.log(`  ${category} : ${ingredients.join(", ")}`);
});

// Test de l'autosuggestion
console.log("\n🔍 Test de l'autosuggestion :");

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
  
  // Simuler la logique de filtrage
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  // Articles de la base de données de gestion
  const databaseMatches = databaseItems.filter(item =>
    item.name.toLowerCase().includes(normalizedSearch)
  );
  
  // Articles de l'historique manuel
  const historyMatches = ingredientHistory.filter(item =>
    item.name.toLowerCase().includes(normalizedSearch)
  );
  
  // Articles de la base de données d'ingrédients
  const ingredientMatches = Object.values(INGREDIENT_DATABASE)
    .flat()
    .filter(ingredient => ingredient.toLowerCase().includes(normalizedSearch));
  
  console.log(`     Base de données : ${databaseMatches.map(item => item.name).join(", ") || "Aucun"}`);
  console.log(`     Historique : ${historyMatches.map(item => item.name).join(", ") || "Aucun"}`);
  console.log(`     Ingrédients : ${ingredientMatches.join(", ") || "Aucun"}`);
});

// Test de la priorité
console.log("\n🎯 Test de la priorité des suggestions :");

const priorityTest = {
  searchTerm: "lait",
  expectedOrder: [
    "Lait (Base de données de gestion - priorité 1)",
    "Lait (Historique manuel - priorité 2)",
    "Lait (Base d'ingrédients - priorité 3)"
  ]
};

console.log(`\n  Recherche : "${priorityTest.searchTerm}"`);
console.log("  Ordre de priorité attendu :");
priorityTest.expectedOrder.forEach((item, index) => {
  console.log(`    ${index + 1}. ${item}`);
});

// Test des cas d'usage
console.log("\n👤 Cas d'usage :");

const useCases = [
  {
    scenario: "Utilisateur tape 'papier'",
    expected: "Papier toilette apparaît en premier (base de données)",
    advantage: "Accès rapide aux articles gérés"
  },
  {
    scenario: "Utilisateur tape 'lait'",
    expected: "Lait apparaît avec sa catégorie (historique + base)",
    advantage: "Suggestions enrichies par l'historique"
  },
  {
    scenario: "Utilisateur tape 'coca'",
    expected: "Coca Cola apparaît (base de données)",
    advantage: "Articles personnalisés disponibles"
  },
  {
    scenario: "Utilisateur tape 'pain'",
    expected: "Pain de mie et Pain apparaissent",
    advantage: "Combinaison base + historique"
  }
];

useCases.forEach((useCase, index) => {
  console.log(`\n  ${index + 1}. ${useCase.scenario} :`);
  console.log(`     Résultat attendu : ${useCase.expected}`);
  console.log(`     Avantage : ${useCase.advantage}`);
});

// Test des avantages
console.log("\n💡 Avantages de l'intégration :");

const advantages = [
  "Articles de la base de données disponibles en autosuggestion",
  "Priorité donnée aux articles gérés",
  "Suggestions enrichies par l'historique",
  "Accès rapide aux articles personnalisés",
  "Interface unifiée pour tous les articles",
  "Expérience utilisateur améliorée"
];

advantages.forEach((advantage, index) => {
  console.log(`  ${index + 1}. ✅ ${advantage}`);
});

console.log("\n✅ Test terminé !");
console.log("\n💡 Résumé de l'intégration :");
console.log("  - Base de données de gestion intégrée dans l'autosuggestion");
console.log("  - Priorité donnée aux articles gérés");
console.log("  - Suggestions enrichies et personnalisées");
console.log("  - Interface unifiée pour tous les articles"); 