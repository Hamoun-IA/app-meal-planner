"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Send, Sparkles } from "lucide-react"
import { useState } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"

export default function AssistantePage() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Salut ma belle ! 💖 Je suis ton assistante Babounette. Comment puis-je t'aider aujourd'hui ?",
      isBot: true,
      time: "10:30",
    },
  ])

  const { playBackSound } = useAppSoundsSimple()

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text: message,
      isBot: false,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Simulation de réponse de l'assistante
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "C'est une excellente question ! ✨ Laisse-moi réfléchir à la meilleure façon de t'aider avec ça 💕",
        isBot: true,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
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
            <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"} animate-fade-in-up`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                  msg.isBot
                    ? "bg-white text-gray-800 rounded-bl-sm"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-sm"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.isBot ? "text-gray-500" : "text-white/70"}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>
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
          />
          <Button
            onClick={handleSendMessage}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
