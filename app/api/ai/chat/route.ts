import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { chatAgent } from '@/lib/ai/agents'
import { validateRequest, handleError } from '@/lib/utils/validation'

const chatSchema = z.object({
  message: z.string().min(1, 'Le message ne peut pas être vide'),
  context: z.record(z.any()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await validateRequest(req, chatSchema)

    // Créer un stream pour la réponse
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Envoyer le début du stream
          controller.enqueue(
            new TextEncoder().encode('data: {"type":"start","content":""}\n\n')
          )

          // Obtenir la réponse de l'agent
          const response = await chatAgent.chat(message, context)

          // Envoyer la réponse par chunks
          const chunks = response.split(' ')
          for (const chunk of chunks) {
            controller.enqueue(
              new TextEncoder().encode(`data: {"type":"chunk","content":"${chunk} "}\n\n`)
          )
            // Petite pause pour simuler le streaming
            await new Promise(resolve => setTimeout(resolve, 50))
          }

          // Envoyer la fin du stream
          controller.enqueue(
            new TextEncoder().encode('data: {"type":"end","content":""}\n\n')
          )
        } catch (error) {
          controller.enqueue(
            new TextEncoder().encode(`data: {"type":"error","content":"${error}"}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 