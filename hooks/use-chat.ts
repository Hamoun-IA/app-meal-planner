import { useState, useCallback, useRef } from 'react'
import { RecipePopupData } from '@/components/recipe-popup'

export interface ChatMessage {
  id: number
  text: string
  isBot: boolean
  time: string
  isLoading?: boolean
}

export interface UseChatReturn {
  messages: ChatMessage[]
  sendMessage: (message: string) => Promise<void>
  isLoading: boolean
  error: string | null
  recipePopup: {
    isOpen: boolean
    recipe: RecipePopupData | null
    openRecipe: (recipe: RecipePopupData) => void
    closeRecipe: () => void
  }
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Salut ma belle ! 💖 Je suis ton assistante Babounette. Comment puis-je t'aider aujourd'hui ?",
      isBot: true,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const botResponseRef = useRef("")
  
  // État pour le popup de recette
  const [recipePopup, setRecipePopup] = useState<{
    isOpen: boolean
    recipe: RecipePopupData | null
  }>({
    isOpen: false,
    recipe: null,
  })

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return

    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: message,
      isBot: false,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }

    // Ajouter un message de chargement pour l'assistante
    const loadingMessage: ChatMessage = {
      id: messages.length + 2,
      text: "Babounette réfléchit... ✨",
      isBot: true,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      isLoading: true,
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: {
            // Ajouter ici des informations de contexte si nécessaire
            timestamp: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      // Traiter le stream de réponse
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Impossible de lire la réponse')
      }

      botResponseRef.current = ""
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
                             if (data.type === 'chunk') {
                 // Le contenu est déjà décodé par JSON.parse
                 botResponseRef.current += data.content
                 // Mettre à jour le message en temps réel
                 setMessages(prev => 
                   prev.map(msg => 
                     msg.isLoading 
                       ? { ...msg, text: botResponseRef.current, isLoading: false }
                       : msg
                   )
                 )
               } else if (data.type === 'recipe') {
                 // Ouvrir le popup avec la recette générée
                 setRecipePopup({
                   isOpen: true,
                   recipe: data.content,
                 })
               } else if (data.type === 'error') {
                throw new Error(data.content)
              }
            } catch (e) {
              // Ignorer les erreurs de parsing pour les lignes non-JSON
            }
          }
        }
      }

      // Remplacer le message de chargement par la réponse finale
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading 
            ? { 
                ...msg, 
                text: botResponseRef.current || "Désolée, je n'ai pas pu traiter ta demande. Peux-tu reformuler ? 💕",
                isLoading: false 
              }
            : msg
        )
      )

    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      
      // Remplacer le message de chargement par un message d'erreur
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading 
            ? { 
                ...msg, 
                text: "Oups ! Il y a eu un petit problème de connexion. Peux-tu réessayer ? 💕",
                isLoading: false 
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const openRecipe = (recipe: RecipePopupData) => {
    setRecipePopup({
      isOpen: true,
      recipe,
    })
  }

  const closeRecipe = () => {
    setRecipePopup({
      isOpen: false,
      recipe: null,
    })
  }

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    recipePopup: {
      isOpen: recipePopup.isOpen,
      recipe: recipePopup.recipe,
      openRecipe,
      closeRecipe,
    },
  }
} 