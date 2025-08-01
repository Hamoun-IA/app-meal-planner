import { categorizeIngredient } from "../lib/ingredient-database";

// Test du système de persistance des ingrédients manuels
console.log("🧪 Test du système de persistance des ingrédients manuels :\n");

// Simuler des ingrédients ajoutés manuellement
const manualIngredients = [
  { name: "Dentifrice", category: "Hygiène", usageCount: 3, lastUsed: Date.now() },
  { name: "Shampoing", category: "Hygiène", usageCount: 2, lastUsed: Date.now() - 86400000 },
  { name: "Savon", category: "Hygiène", usageCount: 5, lastUsed: Date.now() - 172800000 },
  { name: "Papier toilette", category: "Hygiène", usageCount: 8, lastUsed: Date.now() - 259200000 },
  { name: "Lessive", category: "Entretien", usageCount: 4, lastUsed: Date.now() - 345600000 },
  { name: "Produit vaisselle", category: "Entretien", usageCount: 6, lastUsed: Date.now() - 432000000 },
];

const existingCategories = [
  "Fruits et Légumes",
  "Viandes et Poissons", 
  "Produits Laitiers",
  "Céréales et Pains",
  "Épices et Condiments",
  "Boissons",
  "Sucreries",
  "Hygiène", // Catégorie personnalisée
  "Entretien", // Catégorie personnalisée
  "Divers"
];

console.log("📝 Ingrédients ajoutés manuellement :");
manualIngredients.forEach(ingredient => {
  console.log(`  - "${ingredient.name}" (${ingredient.category}) - utilisé ${ingredient.usageCount}x`);
});

console.log("\n🔍 Test de catégorisation automatique pour de nouveaux ingrédients :");
const newIngredients = [
  "Gel douche",
  "Déodorant", 
  "Brosse à dents",
  "Serviettes",
  "Nettoyant sol",
  "Spray nettoyant"
];

newIngredients.forEach(ingredient => {
  const category = categorizeIngredient(ingredient, existingCategories);
  console.log(`  - "${ingredient}" → "${category}"`);
});

console.log("\n📊 Simulation d'autosuggestion avec historique :");
const allIngredients = [
  // Ingrédients de la base de données
  "pomme", "poulet", "lait", "pain", "sel", "eau", "chocolat",
  // Ingrédients manuels (priorité élevée)
  ...manualIngredients.map(item => item.name)
];

// Trier par priorité (historique manuel en premier)
const sortedIngredients = allIngredients.sort((a, b) => {
  const aInHistory = manualIngredients.some(item => item.name === a);
  const bInHistory = manualIngredients.some(item => item.name === b);
  
  if (aInHistory && !bInHistory) return -1;
  if (!aInHistory && bInHistory) return 1;
  
  return a.localeCompare(b, 'fr');
});

console.log("Suggestions triées par priorité :");
sortedIngredients.slice(0, 10).forEach((ingredient, index) => {
  const isManual = manualIngredients.some(item => item.name === ingredient);
  const marker = isManual ? "⭐" : "📦";
  console.log(`  ${index + 1}. ${marker} "${ingredient}"`);
});

console.log("\n✅ Test terminé !"); 