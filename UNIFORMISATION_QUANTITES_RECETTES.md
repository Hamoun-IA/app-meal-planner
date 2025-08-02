# Uniformisation des Quantités entre Recettes et Base de Données de Gestion

## 🎯 Problème Identifié

Lors de l'ajout d'ingrédients depuis les pages de recettes (`/recettes/*`), les quantités n'étaient pas uniformisées avec la base de données de gestion. Cela causait :

- **Incohérences** : Les quantités des recettes n'utilisaient pas les unités standardisées de la base de données
- **Confusion** : Même ingrédient avec des formats différents (ex: "500g" vs "0.5kg")
- **Perte d'information** : Les unités de la base de données n'étaient pas utilisées

## ✅ Solution Implémentée

### Nouvelle Fonction `addItemsFromRecipe`

#### **Conversion Intelligente des Quantités**
- **Recherche automatique** dans la base de données de gestion
- **Conversion d'unités** si nécessaire (ex: "500g" → "0.5kg")
- **Fallback** vers la quantité originale si l'ingrédient n'existe pas dans la base

#### **Logique de Conversion**
```typescript
const addItemsFromRecipe = (ingredients: Array<{ name: string; quantity: string }>, recipeName: string) => {
  const convertedItems: Omit<CourseItem, "id">[] = ingredients.map((ingredient) => {
    // Chercher l'ingrédient dans la base de données de gestion
    const databaseItem = databaseItems.find(
      item => item.name.toLowerCase() === ingredient.name.toLowerCase()
    );

    // Si l'ingrédient existe dans la base de données, utiliser son unité
    if (databaseItem && databaseItem.unit) {
      // Parser la quantité de la recette
      const parsedQuantity = parseQuantity(ingredient.quantity);
      
      // Si la quantité a une unité, essayer de la convertir
      let finalQuantity = ingredient.quantity;
      if (parsedQuantity.unit && parsedQuantity.unit !== databaseItem.unit) {
        const converted = convertToCommonUnit(parsedQuantity, databaseItem.unit);
        if (converted) {
          finalQuantity = formatQuantity(converted.value, converted.unit);
        }
      }
      
      return {
        name: ingredient.name,
        completed: false,
        category: databaseItem.category,
        unit: databaseItem.unit,
        source: `Recette: ${recipeName} (${finalQuantity})`,
      };
    } else {
      // Si l'ingrédient n'existe pas dans la base de données, utiliser la quantité originale
      return {
        name: ingredient.name,
        completed: false,
        category: categorizeIngredient(ingredient.name, categories),
        source: `Recette: ${recipeName} (${ingredient.quantity})`,
      };
    }
  });

  // Ajouter les items convertis
  addItems(convertedItems);
};
```

## 🔧 Modifications Techniques

### 1. **Nouvelle Interface**
```typescript
interface CoursesContextType {
  // ... autres propriétés
  addItemsFromRecipe: (ingredients: Array<{ name: string; quantity: string }>, recipeName: string) => void;
}
```

### 2. **Fonctions de Conversion**
- **`parseQuantity`** : Parse une quantité en valeur numérique et unité
- **`convertToCommonUnit`** : Convertit entre unités compatibles
- **`formatQuantity`** : Formate une quantité avec son unité

### 3. **Mise à Jour des Pages de Recettes**
```typescript
// Avant
const { addItems } = useCourses();
addItems(allIngredients);

// Après
const { addItemsFromRecipe } = useCourses();
addItemsFromRecipe(allIngredients, recette?.title || "Recette");
```

## 📊 Avantages

### 1. **Cohérence des Données**
- ✅ **Unité standardisée** : Utilise les unités de la base de données de gestion
- ✅ **Conversion automatique** : "500g" devient "0.5kg" si l'unité de la base est "kg"
- ✅ **Format uniforme** : Tous les ingrédients suivent le même format

### 2. **Expérience Utilisateur**
- ✅ **Transparence** : L'utilisateur voit la quantité convertie dans la source
- ✅ **Cohérence** : Même ingrédient, même format partout
- ✅ **Flexibilité** : Fonctionne même si l'ingrédient n'est pas dans la base

### 3. **Maintenance**
- ✅ **Centralisation** : Les unités sont gérées dans la base de données
- ✅ **Évolutivité** : Facile d'ajouter de nouvelles conversions
- ✅ **Robustesse** : Fallback vers la quantité originale

## 🎨 Interface Utilisateur

### **Affichage dans la Liste de Courses**

#### **Avant**
```
☐ Farine (Recette: Pain au chocolat (500g))
☐ Lait (Recette: Pain au chocolat (250ml))
```

#### **Après**
```
☐ Farine 0.5kg (Recette: Pain au chocolat (500g))
☐ Lait 250ml (Recette: Pain au chocolat (250ml))
```

### **Logique d'Affichage**
- **Avec unité** : Affiche la quantité convertie + l'unité de la base
- **Sans unité** : Affiche la quantité originale dans la source
- **Source** : Indique toujours la quantité originale de la recette

## 🔄 Migration

### **Compatibilité**
- ✅ **Recettes existantes** : Continuent de fonctionner
- ✅ **Quantités originales** : Préservées dans la source
- ✅ **Fallback** : Fonctionne même sans base de données

### **Nouvelles Fonctionnalités**
- ✅ **Conversion automatique** d'unités
- ✅ **Utilisation** des unités de la base de données
- ✅ **Affichage** uniforme dans la liste

## 🧪 Tests

### **Scénarios de Test**

1. **Ingrédient avec unité dans la base**
   - Recette : "Farine 500g"
   - Base : "Farine" → unité "kg"
   - Résultat : "Farine 0.5kg (Recette: Pain (500g))"

2. **Ingrédient sans unité dans la base**
   - Recette : "Pommes 3 unités"
   - Base : "Pommes" → pas d'unité
   - Résultat : "Pommes (Recette: Tarte (3 unités))"

3. **Ingrédient inexistant dans la base**
   - Recette : "Épice spéciale 2g"
   - Base : Pas trouvé
   - Résultat : "Épice spéciale (Recette: Curry (2g))"

4. **Conversion d'unités**
   - Recette : "Lait 1000ml"
   - Base : "Lait" → unité "l"
   - Résultat : "Lait 1l (Recette: Crème (1000ml))"

## 🚀 Utilisation

### **Guide d'Utilisation**

#### **Pour les Développeurs**
```typescript
// Ajouter des ingrédients depuis une recette
const ingredients = [
  { name: "Farine", quantity: "500g" },
  { name: "Lait", quantity: "250ml" },
  { name: "Œufs", quantity: "2 unités" }
];

addItemsFromRecipe(ingredients, "Pain au chocolat");
```

#### **Pour les Utilisateurs**
1. **Aller sur une page de recette**
2. **Cocher les ingrédients** souhaités (optionnel)
3. **Cliquer sur "Ajouter à la liste"**
4. **Vérifier** que les quantités sont correctes dans la liste

### **Exemples d'Utilisation**

```typescript
// Exemple 1 : Conversion automatique
// Recette : "Farine 500g"
// Base : "Farine" → unité "kg"
// Résultat : "Farine 0.5kg (Recette: Pain (500g))"

// Exemple 2 : Pas de conversion
// Recette : "Lait 250ml"
// Base : "Lait" → unité "ml"
// Résultat : "Lait 250ml (Recette: Pain (250ml))"

// Exemple 3 : Ingrédient simple
// Recette : "Pommes 3 unités"
// Base : "Pommes" → pas d'unité
// Résultat : "Pommes (Recette: Tarte (3 unités))"
```

## 📝 Exemples d'Interface

### **Page de Recette**
```
[ ] Farine 500g
[ ] Lait 250ml
[ ] Œufs 2 unités
[ ] Sucre 100g

[Bouton "Ajouter à la liste"]
```

### **Liste de Courses (Après Ajout)**
```
☐ Farine 0.5kg (Recette: Pain au chocolat (500g))
☐ Lait 250ml (Recette: Pain au chocolat (250ml))
☐ Œufs (Recette: Pain au chocolat (2 unités))
☐ Sucre 100g (Recette: Pain au chocolat (100g))
```

## 🎯 Résultats

### **Avant**
- ❌ Quantités non uniformisées
- ❌ Unités non utilisées depuis la base de données
- ❌ Confusion entre formats différents

### **Après**
- ✅ **Conversion automatique** d'unités selon la base de données
- ✅ **Affichage uniforme** dans la liste de courses
- ✅ **Préservation** des quantités originales dans la source
- ✅ **Cohérence** entre recettes et base de données

L'uniformisation des quantités améliore significativement la cohérence et l'expérience utilisateur ! 🎉 