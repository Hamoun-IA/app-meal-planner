// =============================================================================
// SERVICE IA - ASSISTANTE BABOUNETTE
// =============================================================================

import OpenAI from 'openai';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authService } from '../auth';

// =============================================================================
// TYPES ET INTERFACES
// =============================================================================

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  agentType?: 'chef' | 'nutritionist' | 'planner' | 'chat';
  tokens?: number;
  model?: string;
  sessionId?: string;
  context?: any;
  createdAt: Date;
}

export interface AIResponse {
  content: string;
  agentType: string;
  tokens: number;
  model: string;
  suggestions?: string[];
  metadata?: any;
}

export interface RecipeGenerationRequest {
  ingredients: string[];
  cuisine?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  dietaryRestrictions?: string[];
  allergies?: string[];
  maxPrepTime?: number;
  servings?: number;
}

export interface NutritionAnalysisRequest {
  recipe: {
    title: string;
    ingredients: Array<{
      name: string;
      quantity: number;
      unit: string;
    }>;
    instructions: string[];
  };
}

export interface MealPlanRequest {
  userId: string;
  startDate: Date;
  endDate: Date;
  dietaryRestrictions?: string[];
  allergies?: string[];
  calorieTarget?: number;
  budgetPerMeal?: number;
  cuisinePreferences?: string[];
}

// =============================================================================
// SCHÉMAS DE VALIDATION
// =============================================================================

const ChatMessageSchema = z.object({
  content: z.string().min(1, 'Message requis'),
  role: z.enum(['user', 'assistant', 'system']),
  agentType: z.enum(['chef', 'nutritionist', 'planner', 'chat']).optional(),
  sessionId: z.string().optional(),
  context: z.any().optional(),
});

const RecipeGenerationSchema = z.object({
  ingredients: z.array(z.string()).min(1, 'Au moins un ingrédient'),
  cuisine: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  maxPrepTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
});

// =============================================================================
// SERVICE IA PRINCIPAL
// =============================================================================

/**
 * Service IA principal avec agents spécialisés
 */
export class AIService {
  private openai: OpenAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY non définie');
    }

    this.openai = new OpenAI({ apiKey });
    this.modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  /**
   * Agent Chef - Génération de recettes créatives
   */
  async generateRecipe(request: RecipeGenerationRequest): Promise<AIResponse> {
    try {
      const validatedRequest = RecipeGenerationSchema.parse(request);
      
      const prompt = this.buildChefPrompt(validatedRequest);
      
      const completion = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Génère une recette avec ces ingrédients: ${validatedRequest.ingredients.join(', ')}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || 'Erreur: Aucune réponse générée';

      // Sauvegarder le message dans l'historique
      await this.saveChatMessage({
        content: `Génération recette: ${validatedRequest.ingredients.join(', ')}`,
        role: 'user',
        agentType: 'chef',
      });

      await this.saveChatMessage({
        content: response,
        role: 'assistant',
        agentType: 'chef',
      });

      return {
        content: response,
        agentType: 'chef',
        tokens: completion.usage?.total_tokens || response.length / 4,
        model: this.modelName,
        suggestions: this.extractSuggestions(response),
      };
    } catch (error) {
      console.error('Erreur génération recette:', error);
      throw new Error('Erreur lors de la génération de recette');
    }
  }

  /**
   * Agent Nutritionniste - Analyse nutritionnelle
   */
  async analyzeNutrition(request: NutritionAnalysisRequest): Promise<AIResponse> {
    try {
      const prompt = this.buildNutritionistPrompt(request);
      
      const completion = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Analyse nutritionnelle de: ${request.recipe.title}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || 'Erreur: Aucune réponse générée';

      await this.saveChatMessage({
        content: `Analyse nutritionnelle: ${request.recipe.title}`,
        role: 'user',
        agentType: 'nutritionist',
      });

      await this.saveChatMessage({
        content: response,
        role: 'assistant',
        agentType: 'nutritionist',
      });

      return {
        content: response,
        agentType: 'nutritionist',
        tokens: completion.usage?.total_tokens || response.length / 4,
        model: this.modelName,
        metadata: { recipeTitle: request.recipe.title },
      };
    } catch (error) {
      console.error('Erreur analyse nutritionnelle:', error);
      throw new Error('Erreur lors de l\'analyse nutritionnelle');
    }
  }

  /**
   * Agent Planificateur - Plans de repas hebdomadaires
   */
  async generateMealPlan(request: MealPlanRequest): Promise<AIResponse> {
    try {
      const prompt = this.buildPlannerPrompt(request);
      
      const completion = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Génère un plan de repas du ${request.startDate.toLocaleDateString()} au ${request.endDate.toLocaleDateString()}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || 'Erreur: Aucune réponse générée';

      await this.saveChatMessage({
        content: `Génération plan repas: ${request.startDate.toLocaleDateString()} - ${request.endDate.toLocaleDateString()}`,
        role: 'user',
        agentType: 'planner',
      });

      await this.saveChatMessage({
        content: response,
        role: 'assistant',
        agentType: 'planner',
      });

      return {
        content: response,
        agentType: 'planner',
        tokens: completion.usage?.total_tokens || response.length / 4,
        model: this.modelName,
        metadata: {
          startDate: request.startDate,
          endDate: request.endDate,
          userId: request.userId,
        },
      };
    } catch (error) {
      console.error('Erreur génération plan repas:', error);
      throw new Error('Erreur lors de la génération du plan de repas');
    }
  }

  /**
   * Chat conversationnel général
   */
  async chat(message: string, userId: string, sessionId?: string): Promise<AIResponse> {
    try {
      const validatedMessage = ChatMessageSchema.parse({
        content: message,
        role: 'user',
        sessionId,
      });

      // Récupérer l'historique de conversation
      const history = await this.getChatHistory(userId, sessionId);
      
      const prompt = this.buildChatPrompt(history);
      
      // Construire les messages pour OpenAI
      const messages = [
        { role: 'system' as const, content: prompt },
        ...history.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user' as const, content: message }
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.modelName,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || 'Erreur: Aucune réponse générée';

      await this.saveChatMessage({
        content: message,
        role: 'user',
        agentType: 'chat',
        sessionId,
      });

      await this.saveChatMessage({
        content: response,
        role: 'assistant',
        agentType: 'chat',
        sessionId,
      });

      return {
        content: response,
        agentType: 'chat',
        tokens: completion.usage?.total_tokens || response.length / 4,
        model: this.modelName,
        suggestions: this.extractSuggestions(response),
      };
    } catch (error) {
      console.error('Erreur chat:', error);
      throw new Error('Erreur lors du chat');
    }
  }

  // =============================================================================
  // MÉTHODES PRIVÉES
  // =============================================================================

  private buildChefPrompt(request: RecipeGenerationRequest): string {
    return `Tu es un chef cuisinier expert et créatif. Ta mission est de créer des recettes délicieuses et originales.

CONTEXT:
- Ingrédients disponibles: ${request.ingredients.join(', ')}
- Cuisine: ${request.cuisine || 'internationale'}
- Difficulté: ${request.difficulty || 'intermédiaire'}
- Restrictions: ${request.dietaryRestrictions?.join(', ') || 'aucune'}
- Allergies: ${request.allergies?.join(', ') || 'aucune'}
- Temps max: ${request.maxPrepTime || 60} minutes
- Portions: ${request.servings || 4}

INSTRUCTIONS:
1. Crée une recette complète avec titre, description, ingrédients et instructions
2. Utilise principalement les ingrédients fournis
3. Ajoute des ingrédients de base si nécessaire (sel, poivre, huile)
4. Donne des instructions claires et détaillées
5. Inclus des conseils de chef et des variantes
6. Respecte les restrictions alimentaires et allergies

FORMAT:
- Titre accrocheur
- Description courte
- Liste d'ingrédients avec quantités
- Instructions numérotées
- Conseils et variantes
- Temps de préparation et cuisson`;
  }

  private buildNutritionistPrompt(request: NutritionAnalysisRequest): string {
    return `Tu es un nutritionniste expert. Analyse cette recette et fournis des informations nutritionnelles détaillées.

RECETTE:
Titre: ${request.recipe.title}
Ingrédients: ${request.recipe.ingredients.map(i => `${i.quantity}${i.unit} ${i.name}`).join(', ')}
Instructions: ${request.recipe.instructions.join('; ')}

ANALYSE REQUISE:
1. Calories par portion
2. Macronutriments (protéines, glucides, lipides)
3. Micronutriments importants
4. Fibres et sucre
5. Sodium
6. Points positifs nutritionnels
7. Suggestions d'amélioration
8. Allergènes potentiels
9. Compatibilité avec régimes spéciaux

FORMAT:
- Résumé nutritionnel
- Détails macronutriments
- Avantages santé
- Recommandations`;
  }

  private buildPlannerPrompt(request: MealPlanRequest): string {
    return `Tu es un planificateur de repas expert. Crée un plan de repas hebdomadaire personnalisé.

CONTEXT:
- Période: ${request.startDate.toLocaleDateString()} - ${request.endDate.toLocaleDateString()}
- Restrictions: ${request.dietaryRestrictions?.join(', ') || 'aucune'}
- Allergies: ${request.allergies?.join(', ') || 'aucune'}
- Calories cibles: ${request.calorieTarget || 2000} kcal/jour
- Budget: ${request.budgetPerMeal || 15}€/repas
- Cuisines préférées: ${request.cuisinePreferences?.join(', ') || 'toutes'}

PLAN REQUIS:
1. Plan hebdomadaire détaillé
2. Recettes variées et équilibrées
3. Respect des contraintes alimentaires
4. Optimisation budget et temps
5. Suggestions de courses
6. Conseils de préparation

FORMAT:
- Plan jour par jour
- Recettes avec temps de préparation
- Liste de courses optimisée
- Conseils pratiques`;
  }

  private buildChatPrompt(history: ChatMessage[]): string {
    return `Tu es Babounette, une assistante culinaire intelligente et bienveillante. Tu aides les utilisateurs avec:

- Conseils culinaires et techniques de cuisine
- Suggestions de recettes et d'ingrédients
- Informations nutritionnelles
- Planification de repas
- Résolution de problèmes culinaires

TON STYLE:
- Amical et encourageant
- Expert mais accessible
- Toujours positif et motivant
- Réponses concises mais complètes
- Suggestions pratiques et réalisables

CONTEXTE: Tu as accès à une base de données de recettes et d'ingrédients. Tu peux faire des recherches et des recommandations personnalisées.`;
  }

  private async saveChatMessage(message: Partial<ChatMessage>): Promise<void> {
    try {
      // Récupérer l'utilisateur de test via le service d'authentification
      const testUser = await authService.getTestUser();

      await prisma.chatMessage.create({
        data: {
          content: message.content!,
          role: message.role!,
          agentType: message.agentType,
          sessionId: message.sessionId,
          context: message.context,
          userId: testUser.id,
        },
      });
    } catch (error) {
      console.error('Erreur sauvegarde message:', error);
    }
  }

  private async getChatHistory(userId: string, sessionId?: string): Promise<ChatMessage[]> {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: {
          userId,
          sessionId: sessionId || null,
        },
        orderBy: { createdAt: 'asc' },
        take: 10, // Limiter l'historique
      });

      return messages as ChatMessage[];
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  }

  private extractSuggestions(response: string): string[] {
    // Extraction simple de suggestions basées sur des mots-clés
    const suggestions: string[] = [];
    
    if (response.includes('variante') || response.includes('alternative')) {
      suggestions.push('Voir les variantes');
    }
    if (response.includes('nutrition') || response.includes('calories')) {
      suggestions.push('Analyse nutritionnelle');
    }
    if (response.includes('plan') || response.includes('semaine')) {
      suggestions.push('Planifier les repas');
    }
    
    return suggestions;
  }
}

// =============================================================================
// INSTANCE GLOBALE
// =============================================================================

export const aiService = new AIService(); 