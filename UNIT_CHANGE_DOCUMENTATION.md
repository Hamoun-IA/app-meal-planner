# Changement de "Quantité" vers "Unité de Mesure"

## 🎯 Problème Identifié

Dans la base de données de gestion des courses, le champ "quantité" était ambigu et mélangeait :
- Les unités de mesure (grammes, litres, etc.)
- Les quantités simples (nombre d'œufs, tomates, etc.)

## ✅ Solution Implémentée

### Changement de Structure

**Avant :**
```typescript
export interface CourseItem {
  id: number;
  name: string;
  completed: boolean;
  category: string;
  quantity?: string; // Ambigu : "500g", "6", "1L", etc.
  source?: string;
}
```

**Après :**
```typescript
export interface CourseItem {
  id: number;
  name: string;
  completed: boolean;
  category: string;
  unit?: string; // Unité de mesure claire : "g", "kg", "l", "ml", etc. ou vide pour unités simples
  source?: string;
}
```

### Articles par Défaut Mis à Jour

**Avant :**
```typescript
{ id: 1, name: "Lait", quantity: "1L" },
{ id: 2, name: "Pain", quantity: "1 baguette" },
{ id: 3, name: "Pommes", quantity: "6" },
```

**Après :**
```typescript
{ id: 1, name: "Lait", unit: "l" },
{ id: 2, name: "Pain", unit: "" }, // Unité simple
{ id: 3, name: "Pommes", unit: "" }, // Unité simple
```

## 🔧 Modifications Techniques

### 1. Interface Mise à Jour
- Remplacement de `quantity?: string` par `unit?: string`
- Commentaire explicatif pour clarifier l'usage

### 2. Articles par Défaut
- **Avec unité de mesure** : `"g"`, `"kg"`, `"l"`, `"ml"`, etc.
- **Sans unité** : `""` pour les articles simples (œufs, tomates, pain, etc.)

### 3. Interface Utilisateur
- **Colonne "Quantité"** → **Colonne "Unité"**
- **Placeholder** : "Unité (g, kg, l, ml, etc.)"
- **Affichage** : Unité ou "-" si vide

### 4. Logique de Fusion
- **Avant** : Fusion des quantités avec `addQuantities()`
- **Après** : Conservation de la première unité rencontrée

## 📊 Avantages

1. **Clarté** : Distinction claire entre unités de mesure et quantités simples
2. **Cohérence** : Format uniforme pour les unités de mesure
3. **Flexibilité** : Possibilité d'avoir des articles sans unité spécifique
4. **Simplicité** : Plus besoin de parser des chaînes complexes

## 🎨 Interface Utilisateur

### Nouvelle Colonne "Unité"
- **En mode édition** : Champ de saisie avec placeholder explicatif
- **En mode affichage** : Unité ou "-" si vide
- **Exemples** :
  - `"g"` pour 500g de poulet
  - `"l"` pour 1L de lait
  - `""` pour 6 pommes

### Placeholder Informatif
```
"Unité (g, kg, l, ml, etc.)"
```

## 🔄 Migration

### Données Existantes
- Les anciennes données avec `quantity` seront automatiquement converties
- Les articles sans unité auront `unit: ""`
- Les articles avec unité auront `unit: "g"`, `"l"`, etc.

### Compatibilité
- Le système reste compatible avec les anciennes données
- Les nouvelles fonctionnalités utilisent le nouveau champ `unit`

## 🧪 Tests

Pour tester le changement :

1. **Ajouter un article** avec unité de mesure (ex: "Farine" avec unité "kg")
2. **Ajouter un article** sans unité (ex: "Œufs" avec unité vide)
3. **Vérifier l'affichage** dans la table de gestion
4. **Éditer un article** pour changer l'unité

## 🚀 Utilisation

### Unités de Mesure Recommandées
- **Poids** : `"g"`, `"kg"`
- **Volumes** : `"ml"`, `"l"`, `"cl"`
- **Autres** : `"tasse"`, `"cuillère"`, `"pincée"`

### Articles sans Unité
- **Fruits/Légumes** : Pommes, tomates, bananes
- **Produits unitaires** : Pain, yaourts, œufs
- **Épices** : Sel, poivre (utiliser "pincée" si nécessaire)

## 📝 Exemples

### Articles avec Unité
```typescript
{ name: "Poulet", unit: "g", category: "Viandes et Poissons" }
{ name: "Lait", unit: "l", category: "Produits Laitiers" }
{ name: "Farine", unit: "kg", category: "Céréales et Pains" }
```

### Articles sans Unité
```typescript
{ name: "Pommes", unit: "", category: "Fruits et Légumes" }
{ name: "Pain", unit: "", category: "Céréales et Pains" }
{ name: "Œufs", unit: "", category: "Produits Laitiers" }
```

Le changement de "quantité" vers "unité de mesure" améliore la clarté et la cohérence de la base de données de gestion ! 🎉 