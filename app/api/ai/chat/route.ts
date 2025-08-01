// =============================================================================
// API ROUTE CHAT IA - ASSISTANTE BABOUNETTE
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../../lib/services/ai-service';
import { mockAIService } from '../../../../lib/services/ai-service-mock';

// Utiliser le service mock en développement si pas de clé API
const service = process.env.OPENAI_API_KEY ? aiService : mockAIService;
import { z } from 'zod';

// =============================================================================
// SCHÉMAS DE VALIDATION
// =============================================================================

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message requis'),
  userId: z.string().min(1, 'UserId requis'),
  sessionId: z.string().optional(),
  agentType: z.enum(['chef', 'nutritionist', 'planner', 'chat']).optional(),
});

// =============================================================================
// FONCTIONS API
// =============================================================================

/**
 * POST /api/ai/chat - Chat conversationnel avec IA
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = ChatRequestSchema.parse(body);
    
    // Appel au service IA
    const response = await service.chat(
      validatedData.message,
      validatedData.userId,
      validatedData.sessionId
    );

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Erreur POST /api/ai/chat:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors du chat IA' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/chat - Récupère l'historique des conversations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      );
    }

    // Récupération de l'historique depuis la base de données
    const { prisma } = await import('../../../../lib/prisma');
    
    const messages = await prisma.chatMessage.findMany({
      where: {
        userId,
        sessionId: sessionId || null,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(), // Remettre dans l'ordre chronologique
        total: messages.length,
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/ai/chat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    );
  }
} 