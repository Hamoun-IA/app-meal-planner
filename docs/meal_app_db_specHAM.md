Spécification de la Base de Données - Meal App Planner
Base de données
1. Recettes (liée à la base de données "Ingredients")
Le CRUD doit être géré par l'interface utilisateur et l'IA (ajout automatique lors de la validation d'un repas).
Colonnes :

ID : Identifiant unique de la recette (UUID généré par défaut)
Nom de la recette : Titre clair et explicite de la recette (ex : "Poulet basquaise")
Temps de préparation : Durée estimée de préparation active (en minutes, optionnel)
Temps de cuisson : Durée estimée de cuisson (en minutes, optionnel)
Difficulté : Niveau de difficulté perçu (enum : FACILE, MOYEN, DIFFICILE, optionnel)
Type de plat : Catégorie principale (enum : DESSERT, PLAT_PRINCIPAL, ACCOMPAGNEMENT, ENTREE, optionnel)
Ingrédients : Liste d'ingrédients nécessaires via table de jonction (RecipeIngredient), avec :

ID de l'ingrédient (référence à la table "Ingredients")
Unité de mesure (enum UnitType : G, KG, ML, CL, L, C_A_C, C_A_S, PINCEE, POIGNEE, BOUQUET, GOUTTE, PIECE)
Quantité numérique (ex : 300 pour 300 g)


Instructions : Description structurée et ordonnée des étapes de préparation (tableau de strings), pouvant inclure :

Étapes numérotées
Temps spécifiques pour chaque étape
Astuces pratiques (ex : "laisser reposer 10 min")


Conseils : Remarques complémentaires (string optionnel, ex : variantes, idées de présentation, options végétariennes, suggestions de conservation)
Embedding : Vecteur d'embeddings pour recherche RAG (Vector(768), optionnel, généré via OpenAI)

Notes supplémentaires :

Relation many-to-many avec Ingredients via RecipeIngredient.
Index HNSW sur embedding pour recherches vectorielles (cosine similarity).

2. Ingrédients (liée à la base de données "Recettes")
Le CRUD doit être géré par l'interface Prisma et l'IA (ajout automatique lors de la validation d'un repas).
Colonnes :

ID : Identifiant unique de l'ingrédient (UUID généré par défaut)
Nom de l'ingrédient : Nom standardisé et explicite (ex : "Tomate", "Farine de blé")
Catégorie : Regroupement pour filtrage (ex : "Viandes", "Légumes", "Épices", optionnel)
Unités de mesure : Tableau d'unités applicables (enum UnitType : G, KG, ML, CL, L, C_A_C, C_A_S, PINCEE, POIGNEE, BOUQUET, GOUTTE, PIECE)
Embedding : Vecteur d'embeddings pour recherche RAG (Vector(768), optionnel)
Recettes : Références aux recettes utilisant cet ingrédient (via RecipeIngredient)

Notes supplémentaires :

Index HNSW sur embedding pour recherches vectorielles.
Normalisation des noms : Minuscule, singularisé, sans adjectifs inutiles.

3. Liste de gestion des courses (liée à la base "Categories")
Le CRUD doit être géré par l'interface utilisateur et l'IA (ajout automatique lors de la validation dans le chat).
Colonnes :

ID : Identifiant unique de l'article (UUID généré par défaut)
Nom de l'article : Nom libre (ex : "Lait entier", "Papier alu")
Catégorie : Référence à l'ID de la catégorie (optionnel)

4. Catégories (liée à "Liste de gestion courses")
Le CRUD doit être géré par l'interface utilisateur.
Colonnes :

ID : Identifiant unique (UUID généré par défaut)
Nom de la catégorie : Nom générique (ex : "Fruits", "Épicerie", "Hygiène")
Liaison : ID d'un élément lié (optionnel, UUID pour Ingredient ou ShoppingItem) et type de liaison (string optionnel, ex : 'ingredient' ou 'shopping_item')


Note : Les catégories de la DB "Ingredients" doivent être non modifiables via l'interface utilisateur. Le CRUD complet ne s'applique qu'aux catégories ajoutées manuellement. Puisque l'application est single-user, pas de restrictions ownership.

5. MealHistory (liée aux tables "Recettes")
Le CRUD doit être géré par l'interface utilisateur et l'IA (ajout automatique lors de la validation d'un repas).
Puisque l'application est single-user sans authentification, pas de champ User ID – toutes les entrées sont globales.
Colonnes :

ID : Identifiant unique (UUID généré par défaut)
Recipe ID : Référence vers la recette consommée
Date : Date à laquelle le repas a été pris
Notes : Commentaires libres (optionnel)

6. FamilyPreference (liée à "Ingredients", "Recettes")
Le CRUD doit être géré par l'interface utilisateur et l'IA (extraction automatique via chat).
Puisque l'application est single-user sans authentification, pas de champ User ID – toutes les préférences sont globales.
Colonnes :

ID : Identifiant unique (UUID généré par défaut)
Family Member : Nom ou rôle de la personne concernée (ex : "fils", "maman")
Type : Nature de la préférence (enum : LIKE, DISLIKE)
Target Type : Cible de la préférence (enum : INGREDIENT, RECIPE)
Target ID : ID de l'ingrédient ou recette concernée (UUID)
Notes : Information additionnelle (ex : "allergie", "goût détesté")

Notes supplémentaires :

Relations conditionnelles : Pour targetType = INGREDIENT, référence à Ingredient ; pour RECIPE, référence à Recipe (géré manuellement en code, car Prisma ne supporte pas le polymorphic natif).