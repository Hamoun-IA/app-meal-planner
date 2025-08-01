# Guide de Test - Fusion des Quantités

## 🎯 Fonctionnalité Implémentée

La fonctionnalité de fusion automatique des ingrédients identiques a été implémentée avec les améliorations suivantes :

### ✅ **Fonctionnalités Principales**

1. **Fusion Intelligente** - Les ingrédients identiques sont automatiquement fusionnés
2. **Addition des Quantités** - Les quantités sont additionnées (ex: 200g + 150g = 350g)
3. **Conversion d'Unités** - Conversion automatique entre unités compatibles (kg ↔ g, l ↔ ml)
4. **Sources Multiples** - Les sources des recettes sont fusionnées et affichées
5. **Parsing Avancé** - Support de nombreux formats de quantités

### 🧪 **Comment Tester**

#### **Test 1 : Fusion Simple**
1. Aller sur une recette (ex: `/recettes/1`)
2. Ajouter les ingrédients à la liste de courses
3. Aller sur une autre recette avec des ingrédients similaires
4. Ajouter à nouveau les ingrédients
5. Vérifier dans `/courses` que les quantités sont fusionnées

#### **Test 2 : Conversion d'Unités**
1. Ajouter "farine 200g" depuis une recette
2. Ajouter "farine 1kg" depuis une autre recette
3. Vérifier que le résultat est "farine 1200g" (ou "farine 1.2kg")

#### **Test 3 : Unités Différentes**
1. Ajouter "lait 500ml" depuis une recette
2. Ajouter "lait 1l" depuis une autre recette
3. Vérifier que le résultat est "lait 1500ml" (ou "lait 1.5l")

### 📊 **Formats Supportés**

#### **Unités de Poids**
- `g`, `gramme`, `grammes`
- `kg`, `kilos`, `kilogramme`

#### **Unités de Volume**
- `ml`, `millilitre`, `millilitres`
- `l`, `litre`, `litres`
- `cl`, `centilitre`, `centilitres`

#### **Unités Culinaires**
- `tasse`, `tasses`
- `cuillère`, `cuillères`
- `pincée`, `pincées`
- `sachet`, `sachets`

#### **Unités Discretes**
- `unité`, `unités`
- `botte`, `bottes`
- `tranche`, `tranches`

### 🔄 **Conversions Automatiques**

| De | Vers | Multiplicateur |
|----|------|----------------|
| kg | g | × 1000 |
| g | kg | × 0.001 |
| l | ml | × 1000 |
| l | cl | × 100 |
| ml | l | × 0.001 |
| cl | l | × 0.01 |
| cl | ml | × 10 |

### 🎨 **Améliorations UI**

1. **Affichage des Sources** - Les sources multiples sont affichées comme des badges
2. **Quantités Mises en Évidence** - Les quantités sont affichées en rose et en gras
3. **Notifications Améliorées** - Les toasts indiquent la fusion automatique
4. **Layout Responsive** - L'affichage s'adapte aux différentes tailles d'écran

### 🚀 **Exemples de Test**

```bash
# Test 1: Fusion simple
farine 200g + farine 150g = farine 350g

# Test 2: Conversion d'unités
farine 200g + farine 1kg = farine 1200g

# Test 3: Unités culinaires
lait 1 tasse + lait 1 tasse = lait 2 tasses

# Test 4: Sources multiples
farine 200g (Recette: Gâteau au chocolat) + farine 150g (Recette: Cookies) = farine 350g (Recette: Gâteau au chocolat, Recette: Cookies)
```

### 🎯 **Points de Test Clés**

1. ✅ **Fusion des quantités** - Vérifier que 200g + 150g = 350g
2. ✅ **Conversion d'unités** - Vérifier que 1kg + 500g = 1500g
3. ✅ **Sources multiples** - Vérifier l'affichage des badges de sources
4. ✅ **Notifications** - Vérifier les toasts de confirmation
5. ✅ **Interface responsive** - Tester sur mobile et desktop
6. ✅ **Gestion des erreurs** - Tester avec des formats invalides

### 🔧 **Détails Techniques**

- **Parsing Regex** - Support de multiples patterns de quantités
- **Normalisation** - Conversion automatique des unités vers des formats standard
- **Fusion Intelligente** - Comparaison insensible à la casse des noms d'ingrédients
- **Conversion d'Unités** - Système de conversion extensible
- **Formatage Intelligent** - Affichage optimisé selon l'unité (ex: 1.2kg au lieu de 1200g)

La fonctionnalité est maintenant **entièrement opérationnelle** et prête pour les tests utilisateur ! 🎉 