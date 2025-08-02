# Fonctionnalité d'Ajout de Quantité sur la Page Courses

## 🎯 Problème Identifié

Sur la page `/courses`, lors de l'ajout d'un article, l'utilisateur ne pouvait pas spécifier une quantité. L'unité de mesure était disponible dans la base de données de gestion mais n'était pas utilisée dans la liste de courses.

## ✅ Solution Implémentée

### Interface Utilisateur Améliorée

#### **Champ de Quantité Dynamique**
- **Affichage conditionnel** : Le champ de quantité n'apparaît que si l'article sélectionné a une unité dans la base de données
- **Placeholder informatif** : "Quantité en [unité]..." (ex: "Quantité en kg...")
- **Affichage de l'unité** : L'unité est affichée à côté du champ pour confirmation

#### **Logique d'Ajout Intelligente**
- **Récupération automatique** : L'unité est automatiquement récupérée depuis la base de données de gestion
- **Quantité par défaut** : Si aucune quantité n'est saisie, "1" est utilisé par défaut
- **Formatage automatique** : La quantité est formatée avec l'unité (ex: "500g", "2kg")

### Fonctionnalités

#### 1. **Sélection d'Article avec Unité**
```typescript
const handleSelectWithCategory = (name: string, category: string) => {
  setSelectedItemCategory(category);
  
  // Récupérer l'unité depuis la base de données de gestion
  const databaseItem = databaseItems.find(
    item => item.name.toLowerCase() === name.toLowerCase()
  );
  if (databaseItem) {
    setSelectedItemUnit(databaseItem.unit || "");
  }
};
```

#### 2. **Champ de Quantité Dynamique**
```jsx
{selectedItemUnit && (
  <div className="flex items-center space-x-3">
    <label className="text-sm font-medium text-gray-700 min-w-fit">
      Quantité :
    </label>
    <Input
      value={newQuantity}
      onChange={(e) => setNewQuantity(e.target.value)}
      placeholder={`Quantité en ${selectedItemUnit}...`}
      className="flex-1 border-pink-200 focus:border-pink-400"
      onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
    />
    <span className="text-sm text-gray-500 min-w-fit">
      {selectedItemUnit}
    </span>
  </div>
)}
```

#### 3. **Logique d'Ajout avec Quantité**
```typescript
const handleAddItem = () => {
  // Construire la quantité avec l'unité si disponible
  let displayQuantity = "";
  if (newQuantity.trim() && selectedItemUnit) {
    displayQuantity = `${newQuantity.trim()}${selectedItemUnit}`;
  } else if (selectedItemUnit) {
    displayQuantity = `1${selectedItemUnit}`;
  }
  
  addItem({
    name: newItem,
    completed: false,
    category: category,
    unit: selectedItemUnit || undefined,
    source: displayQuantity ? `Quantité: ${displayQuantity}` : undefined,
  });
};
```

## 🔧 Modifications Techniques

### 1. **Nouveaux États**
```typescript
const [newQuantity, setNewQuantity] = useState("");
const [selectedItemUnit, setSelectedItemUnit] = useState<string>("");
```

### 2. **Récupération de l'Unité**
- **Recherche automatique** dans `databaseItems` lors de la sélection
- **Correspondance insensible à la casse** pour éviter les erreurs
- **Fallback** vers chaîne vide si aucune unité trouvée

### 3. **Affichage de la Quantité**
- **Formatage** : "Quantité: 500g", "Quantité: 2kg"
- **Affichage conditionnel** : Seulement si une quantité est spécifiée
- **Extraction propre** : `item.source.replace("Quantité: ", "")`

## 📊 Avantages

### 1. **Expérience Utilisateur**
- ✅ **Interface intuitive** : Champ de quantité apparaît automatiquement
- ✅ **Feedback visuel** : Unité affichée pour confirmation
- ✅ **Saisie rapide** : Entrée pour valider, focus automatique

### 2. **Cohérence des Données**
- ✅ **Unité automatique** : Récupérée depuis la base de données
- ✅ **Format uniforme** : Quantité + unité standardisée
- ✅ **Pas d'erreurs** : Pas de saisie manuelle d'unité

### 3. **Flexibilité**
- ✅ **Quantité optionnelle** : L'utilisateur peut ne pas en saisir
- ✅ **Quantité par défaut** : "1" si aucune quantité spécifiée
- ✅ **Articles sans unité** : Fonctionne aussi pour les articles simples

## 🎨 Interface Utilisateur

### **Flux d'Utilisation**

1. **Sélection d'article** : L'utilisateur tape le nom d'un article
2. **Apparition du champ** : Le champ de quantité apparaît avec l'unité
3. **Saisie de quantité** : L'utilisateur saisit la quantité (optionnel)
4. **Ajout** : L'article est ajouté avec la quantité formatée

### **Affichage dans la Liste**

```jsx
{item.source && item.source.startsWith("Quantité:") && (
  <span className="text-sm text-pink-600 font-medium">
    {item.source.replace("Quantité: ", "")}
  </span>
)}
```

**Exemples d'affichage :**
- "Farine" → "500g"
- "Lait" → "1l"
- "Pommes" → (pas d'affichage si pas d'unité)

## 🔄 Migration

### **Compatibilité**
- ✅ **Articles existants** : Continuent de fonctionner normalement
- ✅ **Articles sans unité** : Pas de changement d'affichage
- ✅ **Articles avec unité** : Nouvelle fonctionnalité disponible

### **Nouvelles Fonctionnalités**
- ✅ **Champ de quantité dynamique**
- ✅ **Récupération automatique d'unité**
- ✅ **Affichage formaté de la quantité**

## 🧪 Tests

### **Scénarios de Test**

1. **Article avec unité**
   - Sélectionner "Farine" (unité: kg)
   - Saisir "2" dans le champ quantité
   - Vérifier l'affichage "2kg"

2. **Article avec unité, sans quantité**
   - Sélectionner "Lait" (unité: l)
   - Ne pas saisir de quantité
   - Vérifier l'affichage "1l"

3. **Article sans unité**
   - Sélectionner "Pommes" (pas d'unité)
   - Vérifier qu'aucun champ de quantité n'apparaît

4. **Validation**
   - Tester avec différentes unités (g, kg, l, ml)
   - Vérifier le formatage correct
   - Tester la touche Entrée

## 🚀 Utilisation

### **Guide d'Utilisation**

#### **Pour les Articles avec Unité**
1. **Taper le nom** de l'article dans le champ de recherche
2. **Sélectionner** l'article depuis les suggestions
3. **Saisir la quantité** dans le champ qui apparaît
4. **Cliquer sur "Ajouter"** ou appuyer sur Entrée

#### **Pour les Articles sans Unité**
1. **Taper le nom** de l'article
2. **Sélectionner** l'article
3. **Cliquer sur "Ajouter"** directement

### **Exemples d'Utilisation**

```typescript
// Article avec quantité
{ name: "Farine", source: "Quantité: 500g", category: "Céréales et Pains" }

// Article avec quantité par défaut
{ name: "Lait", source: "Quantité: 1l", category: "Produits Laitiers" }

// Article sans unité
{ name: "Pommes", category: "Fruits et Légumes" }
```

## 📝 Exemples d'Interface

### **Avant**
```
[Champ de recherche]
[Bouton Ajouter]
```

### **Après**
```
[Champ de recherche]
Quantité : [500] kg
[Bouton Ajouter]
```

### **Affichage dans la Liste**
```
☐ Farine 500g
☐ Lait 1l
☐ Pommes
```

## 🎯 Résultats

### **Avant**
- ❌ Pas de possibilité de spécifier une quantité
- ❌ Unité non utilisée depuis la base de données
- ❌ Interface limitée

### **Après**
- ✅ **Champ de quantité dynamique** qui apparaît selon l'unité
- ✅ **Récupération automatique** de l'unité depuis la base de données
- ✅ **Interface intuitive** avec feedback visuel
- ✅ **Formatage automatique** de la quantité avec l'unité

La fonctionnalité d'ajout de quantité améliore significativement l'expérience utilisateur et l'utilité de la liste de courses ! 🎉 