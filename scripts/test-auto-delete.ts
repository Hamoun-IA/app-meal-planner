// Test de la suppression automatique des items cochés
console.log("🧪 Test de la suppression automatique des items cochés :\n");

// Simulation d'une liste de courses
let mockItems = [
  { id: 1, name: "Lait", completed: false, category: "Produits Laitiers" },
  { id: 2, name: "Pain", completed: false, category: "Céréales et Pains" },
  { id: 3, name: "Pommes", completed: false, category: "Fruits et Légumes" },
  { id: 4, name: "Chocolat", completed: false, category: "Sucreries" },
  { id: 5, name: "Yaourts", completed: false, category: "Produits Laitiers" },
];

console.log("📝 État initial de la liste :");
mockItems.forEach(item => {
  console.log(`  ⭕ "${item.name}" (${item.category})`);
});

// Simulation de la fonction toggleItem avec suppression automatique
const toggleItem = (items: any[], id: number) => {
  const item = items.find(item => item.id === id);
  if (item && item.completed) {
    // Si l'item est déjà coché, le décocher
    return items.map((item) =>
      item.id === id ? { ...item, completed: false } : item
    );
  } else {
    // Si l'item n'est pas coché, le supprimer complètement
    return items.filter((item) => item.id !== id);
  }
};

// Simuler le cochage de plusieurs items
console.log("\n🔄 Simulation du cochage d'items :");

// Cocher "Lait"
console.log("  ✅ Cochement de 'Lait'...");
mockItems = toggleItem(mockItems, 1);
console.log("  Résultat :");
mockItems.forEach(item => {
  console.log(`    ⭕ "${item.name}" (${item.category})`);
});

// Cocher "Pain"
console.log("\n  ✅ Cochement de 'Pain'...");
mockItems = toggleItem(mockItems, 2);
console.log("  Résultat :");
mockItems.forEach(item => {
  console.log(`    ⭕ "${item.name}" (${item.category})`);
});

// Cocher "Pommes"
console.log("\n  ✅ Cochement de 'Pommes'...");
mockItems = toggleItem(mockItems, 3);
console.log("  Résultat :");
mockItems.forEach(item => {
  console.log(`    ⭕ "${item.name}" (${item.category})`);
});

console.log(`\n📊 Statistiques finales :`);
console.log(`  - Items restants : ${mockItems.length}`);
console.log(`  - Items supprimés : ${5 - mockItems.length}`);

// Test de réajout d'items
console.log("\n🔄 Test de réajout d'items :");
const itemsToReadd = [
  { name: "Lait", category: "Produits Laitiers" },
  { name: "Pain", category: "Céréales et Pains" },
  { name: "Pommes", category: "Fruits et Légumes" },
];

console.log("Items qui peuvent être réajoutés :");
itemsToReadd.forEach(item => {
  console.log(`  ➕ "${item.name}" (${item.category})`);
});

console.log("\n✅ Test terminé !");
console.log("\n💡 Avantages de la suppression automatique :");
console.log("  - Interface plus simple et intuitive");
console.log("  - Pas besoin de bouton de réinitialisation");
console.log("  - Les items peuvent être réajoutés facilement");
console.log("  - Liste toujours propre et à jour"); 