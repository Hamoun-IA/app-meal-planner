import { categorizeIngredient } from "../lib/ingredient-database";

// Test de la catégorisation automatique
const testIngredients = [
  "pomme",
  "banane", 
  "poulet",
  "saumon",
  "lait",
  "fromage",
  "pain",
  "farine",
  "sel",
  "curry",
  "eau",
  "thé",
  "chocolat",
  "bonbon",
  "ingrédient_inconnu"
];

const existingCategories = [
  "Fruits et Légumes",
  "Viandes et Poissons", 
  "Produits Laitiers",
  "Céréales et Pains",
  "Épices et Condiments",
  "Boissons",
  "Sucreries",
  "Divers"
];

console.log("🧪 Test de catégorisation automatique :\n");

testIngredients.forEach(ingredient => {
  const category = categorizeIngredient(ingredient, existingCategories);
  console.log(`"${ingredient}" → "${category}"`);
});

console.log("\n✅ Test terminé !");

// Test avec des ingrédients sans catégorie spécifiée (comme dans l'app)
console.log("\n🧪 Test avec ingrédients sans catégorie :\n");

const ingredientsWithoutCategory = [
  { name: "pomme", quantity: "2", completed: false, source: "Recette: Test" },
  { name: "poulet", quantity: "500g", completed: false, source: "Recette: Test" },
  { name: "lait", quantity: "1l", completed: false, source: "Recette: Test" },
  { name: "pain", quantity: "1", completed: false, source: "Recette: Test" },
  { name: "sel", quantity: "1 pincée", completed: false, source: "Recette: Test" },
  { name: "chocolat", quantity: "100g", completed: false, source: "Recette: Test" },
];

ingredientsWithoutCategory.forEach(ingredient => {
  const category = categorizeIngredient(ingredient.name, existingCategories);
  console.log(`"${ingredient.name}" (${ingredient.quantity}) → "${category}"`);
});

console.log("\n✅ Test terminé !"); 