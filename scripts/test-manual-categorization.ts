import { categorizeIngredient } from "../lib/ingredient-database";

// Test du système de catégorisation manuelle vs automatique
console.log("🧪 Test du système de catégorisation manuelle vs automatique :\n");

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

// Test 1: Ingrédients avec catégorie manuelle spécifiée
console.log("📝 Test 1: Ingrédients avec catégorie manuelle spécifiée");
const manualItems = [
  { name: "Dentifrice", category: "Hygiène" },
  { name: "Shampoing", category: "Hygiène" },
  { name: "Lessive", category: "Entretien" },
  { name: "Produit vaisselle", category: "Entretien" },
  { name: "Papier toilette", category: "Hygiène" },
  { name: "Savon", category: "Hygiène" }
];

manualItems.forEach(item => {
  console.log(`  - "${item.name}" → "${item.category}" (choix manuel)`);
});

// Test 2: Ingrédients sans catégorie (catégorisation automatique)
console.log("\n📝 Test 2: Ingrédients sans catégorie (catégorisation automatique)");
const autoItems = [
  { name: "pomme" },
  { name: "poulet" },
  { name: "lait" },
  { name: "pain" },
  { name: "sel" },
  { name: "chocolat" },
  { name: "ingrédient_inconnu" }
];

autoItems.forEach(item => {
  const autoCategory = categorizeIngredient(item.name, existingCategories);
  console.log(`  - "${item.name}" → "${autoCategory}" (automatique)`);
});

// Test 3: Simulation d'ajout manuel vs depuis recette
console.log("\n📝 Test 3: Simulation d'ajout manuel vs depuis recette");

// Ajout manuel (avec catégorie choisie)
const manualAdd = {
  name: "Dentifrice",
  category: "Hygiène", // Catégorie choisie par l'utilisateur
  completed: false
};
console.log(`  Ajout manuel: "${manualAdd.name}" → "${manualAdd.category}" (choix utilisateur)`);

// Ajout depuis recette (sans catégorie)
const recipeAdd = {
  name: "pomme",
  completed: false,
  source: "Recette: Tarte aux pommes"
  // Pas de catégorie → catégorisation automatique
};
const autoCategory = categorizeIngredient(recipeAdd.name, existingCategories);
console.log(`  Ajout depuis recette: "${recipeAdd.name}" → "${autoCategory}" (automatique)`);

console.log("\n✅ Test terminé !");
console.log("\n💡 Résumé :");
console.log("  - Ajouts manuels : L'utilisateur choisit la catégorie");
console.log("  - Ajouts depuis recettes : Catégorisation automatique");
console.log("  - Les deux types sont sauvegardés dans l'historique pour l'autosuggestion"); 