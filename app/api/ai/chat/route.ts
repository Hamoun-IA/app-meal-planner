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

    console.log('🤖 Chat request:', { message, context })

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
          
          console.log('🤖 Chat response:', response)

          // Vérifier que la réponse n'est pas vide ou trop courte
          if (!response || response.trim().length < 10) {
            throw new Error('Réponse trop courte ou vide de l\'agent IA')
          }

          // Vérifier si l'agent Chat demande à générer une recette
          if (response.includes('GÉNÉRER_RECETTE:')) {
            const recipePrompt = response.split('GÉNÉRER_RECETTE:')[1].trim()
            console.log('👨‍🍳 Génération de recette demandée:', recipePrompt)
            
            try {
              // Générer la recette avec l'agent Chef
              const recipeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/generate-recipe`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  prompt: recipePrompt,
                }),
              })

              if (recipeResponse.ok) {
                const recipeData = await recipeResponse.json()
                                 if (recipeData.data) {
                   // Envoyer la réponse du chat sans le mot-clé
                   const chatResponse = response.replace(/GÉNÉRER_RECETTE:.*?(?=\n|$)/, '').trim()
                   if (chatResponse) {
                     const jsonContent = JSON.stringify(chatResponse)
                     controller.enqueue(
                       new TextEncoder().encode(`data: {"type":"chunk","content":${jsonContent}}\n\n`)
                     )
                   }
                  
                  // Envoyer la recette générée
                  controller.enqueue(
                    new TextEncoder().encode(`data: {"type":"recipe","content":${JSON.stringify(recipeData.data)}}\n\n`)
                  )
                                 } else {
                   // Envoyer la réponse normale si la génération échoue
                   const cleanResponse = response.replace(/GÉNÉRER_RECETTE:.*?(?=\n|$)/, '').trim()
                   const jsonContent = JSON.stringify(cleanResponse)
                   controller.enqueue(
                     new TextEncoder().encode(`data: {"type":"chunk","content":${jsonContent}}\n\n`)
                   )
                 }
               } else {
                 // Envoyer la réponse normale si la génération échoue
                 const cleanResponse = response.replace(/GÉNÉRER_RECETTE:.*?(?=\n|$)/, '').trim()
                 const jsonContent = JSON.stringify(cleanResponse)
                 controller.enqueue(
                   new TextEncoder().encode(`data: {"type":"chunk","content":${jsonContent}}\n\n`)
                 )
               }
             } catch (error) {
               console.error('❌ Erreur lors de la génération de recette:', error)
               // Envoyer la réponse normale en cas d'erreur
               const cleanResponse = response.replace(/GÉNÉRER_RECETTE:.*?(?=\n|$)/, '').trim()
               const jsonContent = JSON.stringify(cleanResponse)
               controller.enqueue(
                 new TextEncoder().encode(`data: {"type":"chunk","content":${jsonContent}}\n\n`)
               )
             }
           } else {
             // Envoyer la réponse normale
             const cleanResponse = response.replace(/GÉNÉRER_RECETTE:.*?(?=\n|$)/, '').trim()
             const jsonContent = JSON.stringify(cleanResponse)
             controller.enqueue(
               new TextEncoder().encode(`data: {"type":"chunk","content":${jsonContent}}\n\n`)
             )
           }

          // Envoyer la fin du stream
          controller.enqueue(
            new TextEncoder().encode('data: {"type":"end","content":""}\n\n')
          )
        } catch (error) {
          console.error('❌ Erreur dans le stream:', error)
          controller.enqueue(
            new TextEncoder().encode(`data: {"type":"error","content":"Erreur lors de la génération de la réponse. Peux-tu reformuler ta question ? 💕"}\n\n`)
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