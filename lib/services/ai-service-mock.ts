// =============================================================================
// SERVICE IA MOCK - ASSISTANTE BABOUNETTE (POUR TESTS)
// =============================================================================

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
// SERVICE IA MOCK
// =============================================================================

/**
 * Service IA Mock pour tests sans clé API
 */
export class MockAIService {
  private modelName: string;

  constructor() {
    this.modelName = 'gpt-4o-mini-mock';
  }

  /**
   * Agent Chef - Génération de recettes créatives
   */
  async generateRecipe(request: RecipeGenerationRequest): Promise<AIResponse> {
    try {
      const validatedRequest = RecipeGenerationSchema.parse(request);
      
      const response = this.generateMockRecipe(validatedRequest);

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
        tokens: response.length / 4,
        model: this.modelName,
        suggestions: ['Voir les variantes', 'Analyse nutritionnelle'],
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
      const response = this.generateMockNutritionAnalysis(request);

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
        tokens: response.length / 4,
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
      const response = this.generateMockMealPlan(request);

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
        tokens: response.length / 4,
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

      const response = this.generateMockChatResponse(message);

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
        tokens: response.length / 4,
        model: this.modelName,
        suggestions: ['Générer une recette', 'Planifier les repas'],
      };
    } catch (error) {
      console.error('Erreur chat:', error);
      throw new Error('Erreur lors du chat');
    }
  }

  // =============================================================================
  // MÉTHODES PRIVÉES MOCK
  // =============================================================================

  private generateMockRecipe(request: RecipeGenerationRequest): string {
    const cuisine = request.cuisine || 'internationale';
    const difficulty = request.difficulty || 'intermédiaire';
    
    return `# Recette ${cuisine} - Niveau ${difficulty}

## Ingrédients (${request.servings || 4} portions)
- ${request.ingredients.join(', ')}
- Sel et poivre
- Huile d'olive

## Instructions
1. Préparer tous les ingrédients
2. Faire chauffer l'huile dans une poêle
3. Ajouter les ingrédients selon l'ordre de cuisson
4. Assaisonner à votre goût
5. Servir chaud

## Conseils
- Cette recette est parfaite pour débutants
- Vous pouvez varier les ingrédients selon vos préférences
- Temps de préparation: ${request.maxPrepTime || 30} minutes

## Variantes
- Version végétarienne: remplacer la viande par des légumes
- Version épicée: ajouter des épices de votre choix`;
  }

  private generateMockNutritionAnalysis(request: NutritionAnalysisRequest): string {
    return `# Analyse Nutritionnelle - ${request.recipe.title}

## Résumé Nutritionnel
- Calories par portion: ~350 kcal
- Protéines: 12g
- Glucides: 45g
- Lipides: 15g
- Fibres: 8g

## Points Positifs
✅ Riche en fibres
✅ Bonne source de protéines
✅ Équilibré en macronutriments
✅ Faible en sodium

## Recommandations
- Parfait pour un repas équilibré
- Idéal pour les sportifs
- Compatible avec un régime végétarien

## Allergènes
⚠️ Vérifiez la présence de gluten si applicable`;
  }

  private generateMockMealPlan(request: MealPlanRequest): string {
    const days = Math.ceil((request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return `# Plan de Repas - ${days} jours

## Lundi
- Petit-déjeuner: Omelette aux légumes
- Déjeuner: Salade composée
- Dîner: Soupe de légumes

## Mardi
- Petit-déjeuner: Yaourt avec fruits
- Déjeuner: Quinoa aux légumes
- Dîner: Poisson grillé

## Mercredi
- Petit-déjeuner: Smoothie bowl
- Déjeuner: Wrap végétarien
- Dîner: Pasta aux légumes

## Budget estimé: ${request.budgetPerMeal || 15}€/repas
## Calories quotidiennes: ${request.calorieTarget || 2000} kcal

## Liste de courses
- Légumes frais
- Protéines (poisson, œufs, tofu)
- Céréales complètes
- Fruits de saison`;
  }

  private generateMockChatResponse(message: string): string {
    const responses = [
      "Bonjour ! Je suis ravie de vous aider avec vos questions culinaires. Que puis-je faire pour vous aujourd'hui ?",
      "Excellente question ! Voici mes conseils pour cuisiner des légumes : commencez toujours par les faire revenir à feu moyen, assaisonnez généreusement, et n'oubliez pas de garder un peu de croquant !",
      "Je peux vous aider à créer des recettes personnalisées, analyser la valeur nutritionnelle de vos plats, ou planifier vos repas de la semaine. Que préférez-vous ?",
      "Pour des légumes parfaits, voici mes astuces : blanchissez-les d'abord, puis faites-les sauter rapidement. Ajoutez des herbes fraîches et un filet de citron pour plus de saveur !",
      "N'hésitez pas à me demander des recettes spécifiques, des conseils techniques, ou même un plan de repas complet pour la semaine !"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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
}

// =============================================================================
// INSTANCE GLOBALE
// =============================================================================

export const mockAIService = new MockAIService(); 