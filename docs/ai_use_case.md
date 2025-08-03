## Cas d'utilisation IA (chat)

1. **Suggestion de repas du soir** :
   - L'utilisateur demande une idée de repas.
   - L'IA consulte "Recettes" et propose une recette.

2. **Suggestion avec ingrédient ciblé** :
   - L'utilisateur demande une recette avec un ingrédient (ex: tomates).
   - L'IA consulte "Recettes" et retourne 2-3 options pertinentes.

3. **Recherche directe de recette** :
   - L'utilisateur demande une recette spécifique (ex: cookies).
   - L'IA cherche dans "Recettes" et affiche les résultats existants.

4. **Fallback internet** :
   - Si aucune correspondance n'est trouvée, l'IA effectue une recherche web.
   - Elle convertit le résultat dans le format de l'app.
   - Si accepté, la recette est enregistrée dans "Recettes".

5. **Vérification historique** :
   - Avant de proposer un plat, l'IA vérifie "MealHistory".
   - Si le plat a été mangé récemment (<7 jours), demander validation :
     - "Vous l'avez mangé il y a 4 jours, êtes-vous sûr ?"

6. **Préférences familiales** :
   - L'utilisateur dit "Mon fils n'aime pas les carottes".
   - L'IA enregistre cela dans "FamilyPreference".
   - Lors de futures suggestions :
     - "Ce plat contient des carottes, cela plaira-t-il à votre fils ?"