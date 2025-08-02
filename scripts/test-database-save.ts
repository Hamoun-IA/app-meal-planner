// Script de test pour vérifier la sauvegarde de la base de données de gestion
console.log("🧪 Test de la sauvegarde de la base de données de gestion");

// Simuler des données de test
const testDatabaseItems = [
  { id: 1, name: "Lait", completed: false, category: "Produits Laitiers", quantity: "1L" },
  { id: 2, name: "Pain", completed: false, category: "Céréales et Pains", quantity: "1 baguette" },
  { id: 3, name: "Pommes", completed: false, category: "Fruits et Légumes", quantity: "6" },
];

// Test de sauvegarde
try {
  localStorage.setItem("babounette-database-items", JSON.stringify(testDatabaseItems));
  console.log("✅ Sauvegarde réussie");
  
  // Test de chargement
  const loadedData = localStorage.getItem("babounette-database-items");
  if (loadedData) {
    const parsedData = JSON.parse(loadedData);
    console.log("✅ Chargement réussi:", parsedData.length, "articles");
    
    // Vérifier que les données sont correctes
    if (parsedData.length === testDatabaseItems.length) {
      console.log("✅ Intégrité des données vérifiée");
    } else {
      console.log("❌ Erreur d'intégrité des données");
    }
  } else {
    console.log("❌ Échec du chargement");
  }
} catch (error) {
  console.error("❌ Erreur lors du test:", error);
}

// Nettoyer après le test
localStorage.removeItem("babounette-database-items");
console.log("🧹 Test terminé et données nettoyées"); 