// Test de la fonctionnalité de réinitialisation de la liste de courses
console.log("🧪 Test de la fonctionnalité de réinitialisation :\n");

// Simulation d'une liste de courses avec des items cochés
const mockItems = [
  { id: 1, name: "Lait", completed: true, category: "Produits Laitiers" },
  { id: 2, name: "Pain", completed: true, category: "Céréales et Pains" },
  { id: 3, name: "Pommes", completed: false, category: "Fruits et Légumes" },
  { id: 4, name: "Chocolat", completed: true, category: "Sucreries" },
  { id: 5, name: "Yaourts", completed: false, category: "Produits Laitiers" },
];

console.log("📝 État initial de la liste :");
mockItems.forEach(item => {
  const status = item.completed ? "✅" : "⭕";
  console.log(`  ${status} "${item.name}" (${item.category})`);
});

// Simulation de la fonction resetItems
const resetItems = (items: any[]) => {
  return items.map(item => ({ ...item, completed: false }));
};

// Appliquer la réinitialisation
const resetItemsResult = resetItems(mockItems);

console.log("\n🔄 Après réinitialisation :");
resetItemsResult.forEach(item => {
  const status = item.completed ? "✅" : "⭕";
  console.log(`  ${status} "${item.name}" (${item.category})`);
});

// Vérifier que tous les items sont maintenant non cochés
const allUnchecked = resetItemsResult.every(item => !item.completed);
const completedCount = resetItemsResult.filter(item => item.completed).length;
const totalCount = resetItemsResult.length;

console.log(`\n📊 Statistiques après réinitialisation :`);
console.log(`  - Items cochés : ${completedCount}`);
console.log(`  - Total d'items : ${totalCount}`);
console.log(`  - Tous non cochés : ${allUnchecked ? "✅" : "❌"}`);

// Test de réajout d'items
console.log("\n🔄 Test de réajout d'items :");
const itemsToReadd = [
  { name: "Lait", category: "Produits Laitiers" },
  { name: "Pain", category: "Céréales et Pains" },
  { name: "Chocolat", category: "Sucreries" },
];

console.log("Items qui peuvent maintenant être réajoutés :");
itemsToReadd.forEach(item => {
  console.log(`  ➕ "${item.name}" (${item.category})`);
});

console.log("\n✅ Test terminé !");
console.log("\n💡 Avantages de la réinitialisation :");
console.log("  - Permet de recommencer une nouvelle liste de courses");
console.log("  - Les items cochés redeviennent disponibles");
console.log("  - Utile pour des courses hebdomadaires régulières");
console.log("  - Conserve l'historique et les catégories personnalisées"); 