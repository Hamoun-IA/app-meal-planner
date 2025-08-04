import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { prisma } from '@/lib/db/prisma'
import { AppError } from '@/lib/utils/validation'
import { Difficulty, DishType, PreferenceType, TargetType } from '@prisma/client'

// Configuration des modèles OpenAI
const chatModel = new ChatOpenAI({
  modelName: 'gpt-4.1-mini',
  temperature: 0.8,
  maxTokens: 1500,
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
  notes?: string | null
  recipe: {
    id: string
    name: string
    dishType?: DishType | null
  }
}

export interface FamilyPreference {
  id: string
  familyMember: string
  type: PreferenceType
  targetType: TargetType
  targetId: string
  notes?: string | null
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
  private static instance: ChatAgent | null = null
  private conversationMemory: Array<{ role: 'user' | 'assistant', content: string, timestamp: Date }> = []
  private maxMemorySize = 10 // Garder les 10 derniers échanges
  private instanceId: string // Pour debug et vérification
  private sessionId: string // Identifiant de session pour la DB

  private constructor() {
    this.instanceId = Math.random().toString(36).substr(2, 9)
    this.sessionId = 'default-session' // Session par défaut pour l'utilisateur unique
    console.log(`🧠 ChatAgent créé avec ID: ${this.instanceId}`)
  }

  public static getInstance(): ChatAgent {
    if (!ChatAgent.instance) {
      ChatAgent.instance = new ChatAgent()
      console.log('🔄 Nouvelle instance ChatAgent créée')
    } else {
      console.log(`🔄 Instance ChatAgent existante réutilisée (ID: ${ChatAgent.instance.instanceId})`)
    }
    return ChatAgent.instance
  }

  // Méthode de debug pour vérifier l'état de la mémoire
  public debugMemory(): void {
    console.log(`🧠 ChatAgent ${this.instanceId} - Mémoire:`, {
      size: this.conversationMemory.length,
      sessionId: this.sessionId,
      exchanges: this.conversationMemory.map(ex => ({
        role: ex.role,
        content: ex.content.substring(0, 50) + '...',
        timestamp: ex.timestamp
      }))
    })
  }

  // Charger la conversation depuis la base de données
  private async loadConversationFromDB(): Promise<void> {
    try {
      // Trouver ou créer la conversation
      let conversation = await prisma.conversation.findUnique({
        where: { sessionId: this.sessionId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      })

      if (!conversation) {
        // Créer une nouvelle conversation
        conversation = await prisma.conversation.create({
          data: {
            sessionId: this.sessionId
          },
          include: {
            messages: {
              orderBy: { timestamp: 'asc' }
            }
          }
        })
        console.log('🆕 Nouvelle conversation créée en DB')
      } else {
        console.log(`📂 Conversation chargée depuis DB (${conversation.messages.length} messages)`)
      }

      // Charger les messages dans la mémoire
      this.conversationMemory = conversation.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp
      }))

      // Garder seulement les derniers échanges
      if (this.conversationMemory.length > this.maxMemorySize) {
        this.conversationMemory = this.conversationMemory.slice(-this.maxMemorySize)
      }

    } catch (error) {
      console.error('❌ Erreur lors du chargement de la conversation:', error)
      // En cas d'erreur, on garde la mémoire en RAM
    }
  }

  // Sauvegarder la conversation en base de données
  private async saveConversationToDB(): Promise<void> {
    try {
      // Trouver la conversation
      let conversation = await prisma.conversation.findUnique({
        where: { sessionId: this.sessionId }
      })

      if (!conversation) {
        // Créer la conversation si elle n'existe pas
        conversation = await prisma.conversation.create({
          data: { sessionId: this.sessionId }
        })
      }

      // Supprimer tous les messages existants
      await prisma.conversationMessage.deleteMany({
        where: { conversationId: conversation.id }
      })

      // Ajouter tous les messages de la mémoire
      for (const message of this.conversationMemory) {
        await prisma.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            role: message.role,
            content: message.content,
            timestamp: message.timestamp
          }
        })
      }

      console.log(`💾 Conversation sauvegardée en DB (${this.conversationMemory.length} messages)`)
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la conversation:', error)
    }
  }

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

  private addToMemory(role: 'user' | 'assistant', content: string) {
    this.conversationMemory.push({
      role,
      content,
      timestamp: new Date()
    })

    // Garder seulement les derniers échanges
    if (this.conversationMemory.length > this.maxMemorySize) {
      this.conversationMemory = this.conversationMemory.slice(-this.maxMemorySize)
    }
  }

  private getConversationContext(): string {
    if (this.conversationMemory.length === 0) return ''

    const recentExchanges = this.conversationMemory
      .slice(-6) // Garder les 6 derniers échanges pour le contexte
      .map((exchange: { role: 'user' | 'assistant', content: string, timestamp: Date }) => `${exchange.role === 'user' ? 'Utilisateur' : 'Babounette'}: ${exchange.content}`)
      .join('\n')

    return `\n\nHISTORIQUE RÉCENT DE LA CONVERSATION:\n${recentExchanges}`
  }

  async chat(message: string, context?: any): Promise<string> {
    // Charger la conversation depuis la DB au début
    await this.loadConversationFromDB()
    
    // Debug: vérifier l'état de la mémoire
    this.debugMemory()
    
    const recentMeals = await this.getRecentMeals()
    const preferences = await this.getFamilyPreferences()

    // Ajouter le message de l'utilisateur à la mémoire
    this.addToMemory('user', message)

    const conversationContext = this.getConversationContext()

    const systemPrompt = `Tu es Babounette, une assistante culinaire française amicale et passionnée de cuisine. Tu parles avec un style chaleureux et encourageant, en utilisant des emojis et un ton positif.

CONTEXTE:
- Repas récents (7 derniers jours): ${recentMeals.map(m => `${m.recipe.name} (${m.date.toLocaleDateString()})`).join(', ') || 'Aucun repas récent'}
- Préférences familiales: ${preferences.map(p => `${p.familyMember}: ${p.type} ${p.targetType}`).join(', ') || 'Aucune préférence enregistrée'}
${conversationContext}

TON RÔLE:
- Tu aides à planifier des repas délicieux et équilibrés
- Tu donnes des conseils culinaires pratiques et des astuces
- Tu encourages l'exploration de nouvelles saveurs
- Tu réponds toujours de manière détaillée et utile
- Tu peux demander à l'agent Chef de générer des recettes complètes quand nécessaire
- Tu utilises la mémoire conversationnelle pour comprendre le contexte et faire des références aux échanges précédents

RÈGLES IMPORTANTES:
- Donne TOUJOURS des réponses complètes et détaillées (minimum 2-3 phrases)
- Évite les réponses courtes comme "Bien", "Super", "OK"
- Utilise le contexte de la conversation pour comprendre les références
- Si l'utilisateur fait référence à quelque chose mentionné précédemment, utilise cette information
- Tu peux faire appel à l'agent Chef POUR CHAQUE demande de recette, même si tu en as déjà généré une
- Si on te demande une recette complète avec ingrédients et étapes, utilise le mot-clé spécial "GÉNÉRER_RECETTE:" suivi de la demande
- Si on te demande des suggestions générales, propose plusieurs options
- Si l'utilisateur demande "que puis-je faire avec [ingrédients]", propose plusieurs options possibles
- Si l'utilisateur demande une recette spécifique (ex: "recette de curry", "recette de poulet"), génère automatiquement la recette complète avec "GÉNÉRER_RECETTE:"
- Si tu ne proposes qu'UNE SEULE recette (pas plusieurs choix), génère automatiquement la recette complète avec "GÉNÉRER_RECETTE:"
- Si l'utilisateur dit "oui", "stp", "d'accord" après avoir proposé une recette, génère automatiquement cette recette avec "GÉNÉRER_RECETTE:"
- Sois toujours encourageante et positive
- Utilise des emojis pour rendre tes réponses plus vivantes
- Si tu ne sais pas quelque chose, propose des alternatives ou demande plus de détails

EXEMPLES:
- Pour une demande de recette complète: "GÉNÉRER_RECETTE: Recette de poulet facile avec ingrédients et étapes"
- Pour des suggestions générales: "Oh super idée ! 💕 Pour le poulet, je te propose plusieurs options délicieuses : un curry crémeux aux épices douces, un poulet rôti aux herbes de Provence, ou même un poulet à la moutarde à l'ancienne. Qu'est-ce qui te tente le plus ? 😊"

N'oublie pas : sois toujours détaillée, encourageante et utile ! 🌟`

    const response = await chatModel.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(message)
    ])

    const responseContent = response.content as string
    
    // Ajouter la réponse de l'assistant à la mémoire
    this.addToMemory('assistant', responseContent)

    // Sauvegarder la conversation en DB
    await this.saveConversationToDB()

    return responseContent
  }
}

// Export des instances
export const chefAgent = new ChefAgent()
export const plannerAgent = new PlannerAgent()
export const chatAgent = ChatAgent.getInstance() 