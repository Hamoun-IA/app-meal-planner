"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Send, Sparkles, Mic } from "lucide-react"
import { useState } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"
import { useChat } from "@/hooks/use-chat"
import { ChatMessageComponent } from "@/components/chat-message"
import { RecipePopup } from "@/components/recipe-popup"
import { useRecettes } from "@/contexts/recettes-context"

export default function AssistantePage() {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  
  const { messages, sendMessage, isLoading, error, recipePopup } = useChat()
  const { playBackSound } = useAppSoundsSimple()
  const { refreshRecettes } = useRecettes()

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    const currentMessage = message
    setMessage("")
    await sendMessage(currentMessage)
  }

  const handleVoiceMessage = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      console.log("Démarrage de l'enregistrement vocal...")
      // Ici on pourrait implémenter la logique d'enregistrement
    } else {
      console.log("Arrêt de l'enregistrement vocal...")
      // Ici on pourrait traiter l'audio enregistré
    }
  }

  const handleRecipeSaved = async () => {
    try {
      console.log('🔄 Rafraîchissement de la liste des recettes...')
      await refreshRecettes()
      console.log('✅ Liste des recettes rafraîchie avec succès')
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute top-20 left-20 w-12 h-12 bg-pink-200/30 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-40 right-32 w-8 h-8 bg-rose-200/40 rounded-full blur-lg animate-float-medium delay-1000"></div>
      <div className="absolute bottom-32 left-40 w-16 h-16 bg-pink-300/20 rounded-full blur-2xl animate-float-slow delay-500"></div>

      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-white hover:bg-white/20 active:scale-95 transition-transform duration-100"
            onMouseDown={handleBackClick}
          >
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Assistante Babounette</h1>
              <p className="text-white/80 text-sm">En ligne ✨</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessageComponent key={msg.id} message={msg} />
          ))}
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-pink-200 p-4">
        <div className="max-w-4xl mx-auto flex space-x-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écris ton message... 💖"
            className="flex-1 rounded-full border-pink-200 focus:border-pink-400"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
          />
          <Button
            onClick={handleVoiceMessage}
            disabled={isLoading}
            className={`rounded-full transition-all duration-200 ${
              isRecording
                ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 animate-pulse"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            }`}
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Popup de recette */}
                   <RecipePopup
               isOpen={recipePopup.isOpen}
               onClose={recipePopup.closeRecipe}
               recipe={recipePopup.recipe}
               onRecipeSaved={handleRecipeSaved}
             />
    </div>
  )
}
