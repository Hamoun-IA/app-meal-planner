import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { prisma } from '@/lib/db/prisma'
import { AppError } from '@/lib/utils/validation'
import { Difficulty, DishType, PreferenceType, TargetType } from '@prisma/client'

// Configuration des modèles OpenAI
const chatModel = new ChatOpenAI({
  modelName: 'gpt-4.1-mini',
  temperature: 0.7,
  maxTokens: 2000,
})

const creativeModel = new ChatOpenAI({
  modelName: 'gpt-4.1-mini',
  temperature: 0.9,
  maxTokens: 3000,
})

// Types pour les agents
export interface MealHistoryEntry {
  id: string
  recipeId: string
  date: Date
  notes?: string
  recipe: {
    id: string
    name: string
    dishType?: DishType
  }
}

export interface FamilyPreference {
  id: string
  familyMember: string
  type: PreferenceType
  targetType: TargetType
  targetId: string
  notes?: string
}

export interface RecipeSuggestion {
  name: string
  prepTime: number
  cookTime: number
  difficulty: Difficulty
  dishType: DishType
  instructions: string[]
  tips?: string
  ingredients: {
    name: string
    quantity: number
    unit: string
  }[]
}

// Agent Chef - Spécialisé dans la création de recettes
export class ChefAgent {
  private async getRecentMeals(days: number = 7): Promise<MealHistoryEntry[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return await prisma.mealHistory.findMany({
      where: {
        date: {
          gte: cutoffDate,
        },
      },
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            dishType: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })
  }

  private async getFamilyPreferences(): Promise<FamilyPreference[]> {
    return await prisma.familyPreference.findMany({
      orderBy: {
        familyMember: 'asc',
      },
    })
  }

  async generateRecipe(prompt: string, preferences?: FamilyPreference[]): Promise<RecipeSuggestion> {
    const recentMeals = await this.getRecentMeals()
    const familyPrefs = preferences || await this.getFamilyPreferences()

    const systemPrompt = `Tu es un chef cuisinier expert spécialisé dans la création de recettes personnalisées.

CONTEXTE IMPORTANT:
- Évite les recettes consommées récemment (derniers 7 jours): ${recentMeals.map(m => m.recipe.name).join(', ')}
- Respecte les préférences familiales: ${familyPrefs.map(p => `${p.familyMember}: ${p.type} ${p.targetType}`).join(', ')}
- Crée des recettes équilibrées et variées
- Inclus des instructions détaillées avec des verbes d'action
- Spécifie des quantités précises pour chaque ingrédient

FORMAT DE RÉPONSE (JSON strict):
{
  "name": "Nom de la recette",
  "prepTime": 15,
  "cookTime": 30,
  "difficulty": "FACILE|MOYEN|DIFFICILE",
  "dishType": "ENTREE|PLAT_PRINCIPAL|ACCOMPAGNEMENT|DESSERT",
  "instructions": [
    "Étape 1 avec verbe d'action",
    "Étape 2 avec verbe d'action"
  ],
  "tips": "Conseils optionnels",
  "ingredients": [
    {
      "name": "Nom ingrédient",
      "quantity": 300,
      "unit": "G|KG|ML|CL|L|C_A_C|C_A_S|PINCEE|POIGNEE|BOUQUET|GOUTTE|PIECE"
    }
  ]
}`

    const response = await creativeModel.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Crée une recette basée sur cette demande: ${prompt}`)
    ])

    try {
      const recipeData = JSON.parse(response.content as string)
      return recipeData as RecipeSuggestion
    } catch (error) {
      throw new AppError('Erreur lors de la génération de la recette', 500)
    }
  }
}

// Agent Planificateur - Spécialisé dans la planification de repas
export class PlannerAgent {
  private async getAvailableRecipes(): Promise<any[]> {
    return await prisma.recipe.findMany({
      select: {
        id: true,
        name: true,
        prepTime: true,
        cookTime: true,
        difficulty: true,
        dishType: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  private async getFamilyPreferences(): Promise<FamilyPreference[]> {
    return await prisma.familyPreference.findMany()
  }

  async generateMealPlan(
    weekStart: Date,
    budget?: number,
    timeConstraints?: { maxPrepTime?: number; maxCookTime?: number }
  ): Promise<{ day: Date; meals: any[] }[]> {
    const recipes = await this.getAvailableRecipes()
    const preferences = await this.getFamilyPreferences()

    const systemPrompt = `Tu es un planificateur de repas expert.

CONTEXTE:
- Recettes disponibles: ${recipes.map(r => `${r.name} (${r.dishType}, ${r.prepTime + r.cookTime}min)`).join(', ')}
- Préférences familiales: ${preferences.map(p => `${p.familyMember}: ${p.type} ${p.targetType}`).join(', ')}
- Budget: ${budget ? `${budget}€` : 'Non spécifié'}
- Contraintes temps: ${timeConstraints ? `Préparation max ${timeConstraints.maxPrepTime}min, Cuisson max ${timeConstraints.maxCookTime}min` : 'Aucune'}

OBJECTIFS:
- Équilibrer les types de plats (entrée, plat principal, dessert)
- Varier les recettes sur la semaine
- Respecter les préférences et contraintes
- Optimiser le budget et le temps

FORMAT DE RÉPONSE (JSON strict):
{
  "plan": [
    {
      "day": "2024-01-15",
      "meals": [
        {
          "recipeId": "uuid",
          "name": "Nom recette",
          "dishType": "ENTREE|PLAT_PRINCIPAL|ACCOMPAGNEMENT|DESSERT"
        }
      ]
    }
  ]
}`

    const response = await chatModel.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Génère un plan de repas pour la semaine commençant le ${weekStart.toISOString().split('T')[0]}`)
    ])

    try {
      const planData = JSON.parse(response.content as string)
      return planData.plan
    } catch (error) {
      throw new AppError('Erreur lors de la génération du plan de repas', 500)
    }
  }
}

// Agent Chat - Spécialisé dans la conversation générale
export class ChatAgent {
  private async getRecentMeals(days: number = 7): Promise<MealHistoryEntry[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return await prisma.mealHistory.findMany({
      where: {
        date: {
          gte: cutoffDate,
        },
      },
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            dishType: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })
  }

  private async getFamilyPreferences(): Promise<FamilyPreference[]> {
    return await prisma.familyPreference.findMany()
  }

  async chat(message: string, context?: any): Promise<string> {
    const recentMeals = await this.getRecentMeals()
    const preferences = await this.getFamilyPreferences()

    const systemPrompt = `Tu es un assistant culinaire conversationnel amical et utile.

CONTEXTE:
- Repas récents (7 derniers jours): ${recentMeals.map(m => `${m.recipe.name} (${m.date.toLocaleDateString()})`).join(', ')}
- Préférences familiales: ${preferences.map(p => `${p.familyMember}: ${p.type} ${p.targetType}`).join(', ')}

RÔLES:
- Aide à la planification de repas
- Suggestions de recettes basées sur les préférences
- Conseils culinaires pratiques
- Enregistrement des préférences familiales
- Réponses naturelles et engageantes

RÈGLES:
- Évite de suggérer des recettes récemment consommées
- Respecte les préférences familiales
- Sois encourageant et positif
- Propose des alternatives si nécessaire`

    const response = await chatModel.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(message)
    ])

    return response.content as string
  }
}

// Export des instances
export const chefAgent = new ChefAgent()
export const plannerAgent = new PlannerAgent()
export const chatAgent = new ChatAgent() 