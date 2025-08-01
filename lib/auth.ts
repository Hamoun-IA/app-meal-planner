// =============================================================================
// SYSTÈME D'AUTHENTIFICATION - ASSISTANTE BABOUNETTE
// =============================================================================

import { prisma } from './prisma';

// =============================================================================
// TYPES ET INTERFACES
// =============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthContext {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isTestUser: boolean;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const TEST_USER_EMAIL = 'test@babounette.com';
const TEST_USER_ID = 'test-user-id'; // ID temporaire pour les tests

// =============================================================================
// SERVICE D'AUTHENTIFICATION
// =============================================================================

/**
 * Service d'authentification centralisé
 */
export class AuthService {
  private static instance: AuthService;
  private testUser: AuthUser | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Récupère ou crée l'utilisateur de test
   */
  async getTestUser(): Promise<AuthUser> {
    if (this.testUser) {
      return this.testUser;
    }

    try {
      let user = await prisma.user.findUnique({
        where: { email: TEST_USER_EMAIL },
      });

      if (!user) {
        // Créer l'utilisateur de test s'il n'existe pas
        user = await prisma.user.create({
          data: {
            email: TEST_USER_EMAIL,
            name: 'Utilisateur Test',
            preferences: {
              create: {
                dietaryRestrictions: ['vegetarian'],
                allergies: ['nuts'],
                cuisinePreferences: ['french', 'italian'],
                calorieTarget: 2000,
                proteinTarget: 150,
                carbTarget: 200,
                fatTarget: 65,
                cookingTime: 45,
                difficultyLevel: 'intermediate',
                servingsPerMeal: 4,
                budgetPerMeal: 15,
              },
            },
          },
        });
        console.log('✅ Utilisateur de test créé:', user.email);
      }

      this.testUser = {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        avatar: user.avatar || undefined,
      };

      return this.testUser;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur de test:', error);
      throw new Error('Impossible de récupérer l\'utilisateur de test');
    }
  }

  /**
   * Valide un userId et retourne l'utilisateur correspondant
   */
  async validateUserId(userId: string): Promise<AuthUser> {
    // Si c'est l'ID de test hardcodé, retourner l'utilisateur de test
    if (userId === TEST_USER_ID) {
      return this.getTestUser();
    }

    // Si c'est l'email de test, retourner l'utilisateur de test
    if (userId === TEST_USER_EMAIL) {
      return this.getTestUser();
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        avatar: user.avatar || undefined,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la validation du userId:', error);
      throw new Error('UserId invalide');
    }
  }

  /**
   * Récupère l'utilisateur depuis un email
   */
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        avatar: user.avatar || undefined,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération par email:', error);
      return null;
    }
  }

  /**
   * Vérifie si un userId correspond à l'utilisateur de test
   */
  isTestUserId(userId: string): boolean {
    return userId === TEST_USER_ID || userId === TEST_USER_EMAIL;
  }

  /**
   * Récupère l'ID de test standardisé
   */
  getTestUserId(): string {
    return TEST_USER_ID;
  }

  /**
   * Récupère l'email de test
   */
  getTestUserEmail(): string {
    return TEST_USER_EMAIL;
  }
}

// =============================================================================
// INSTANCE GLOBALE
// =============================================================================

export const authService = AuthService.getInstance();

// =============================================================================
// UTILITAIRES
// =============================================================================

/**
 * Récupère l'utilisateur de test de manière sûre
 */
export async function getTestUser(): Promise<AuthUser> {
  return authService.getTestUser();
}

/**
 * Valide un userId et retourne l'utilisateur
 */
export async function validateUserId(userId: string): Promise<AuthUser> {
  return authService.validateUserId(userId);
}

/**
 * Vérifie si un userId est valide
 */
export async function isValidUserId(userId: string): Promise<boolean> {
  try {
    await authService.validateUserId(userId);
    return true;
  } catch {
    return false;
  }
} 