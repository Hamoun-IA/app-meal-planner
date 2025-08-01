"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"
import { useEffect } from "react"

export default function HomePage() {
  const { playClickSound } = useAppSoundsSimple()

  // Enregistrer le Service Worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker enregistré avec succès:", registration.scope)

          // Vérifier les mises à jour
          registration.addEventListener("updatefound", () => {
            console.log("Nouvelle version du Service Worker trouvée")
          })
        })
        .catch((error) => {
          console.error("Échec de l'enregistrement du Service Worker:", error)
        })
    }
  }, [])

  const handleButtonClick = () => {
    console.log("Button clicked!")
    playClickSound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 flex flex-col items-center justify-center p-4 relative overflow-hidden animate-page-enter">
      {/* Floating particles - Large bubbles */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-pink-300/30 rounded-full blur-xl animate-float-slow animate-particles-enter"></div>
      <div className="absolute top-32 right-16 w-16 h-16 bg-rose-300/40 rounded-full blur-lg animate-float-medium delay-1000 animate-particles-enter"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl animate-float-slow delay-500 animate-particles-enter"></div>
      <div className="absolute bottom-32 right-10 w-12 h-12 bg-rose-400/30 rounded-full blur-md animate-float-fast delay-700 animate-particles-enter"></div>

      {/* Small floating particles */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-pink-400/60 rounded-full animate-float-tiny animate-particles-enter"></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-rose-400/70 rounded-full animate-float-tiny delay-300 animate-particles-enter"></div>
      <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-pink-300/50 rounded-full animate-float-tiny delay-600 animate-particles-enter"></div>
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-rose-300/60 rounded-full animate-float-tiny delay-900 animate-particles-enter"></div>
      <div className="absolute top-1/2 left-1/6 w-3 h-3 bg-pink-500/40 rounded-full animate-float-tiny delay-1200 animate-particles-enter"></div>
      <div className="absolute top-3/4 right-1/6 w-2 h-2 bg-rose-500/50 rounded-full animate-float-tiny delay-1500 animate-particles-enter"></div>

      {/* Heart particles */}
      <div className="absolute top-20 right-1/4 text-pink-300/60 text-lg animate-float-heart animate-particles-enter">
        💖
      </div>
      <div className="absolute bottom-40 left-1/4 text-rose-300/50 text-sm animate-float-heart delay-800 animate-particles-enter">
        💕
      </div>
      <div className="absolute top-1/2 right-1/6 text-pink-400/40 text-xs animate-float-heart delay-1600 animate-particles-enter">
        💗
      </div>

      {/* Star particles */}
      <div className="absolute top-1/3 left-1/6 text-pink-300/50 text-sm animate-twinkle animate-particles-enter">
        ✨
      </div>
      <div className="absolute bottom-1/3 right-1/3 text-rose-300/60 text-xs animate-twinkle delay-400 animate-particles-enter">
        ⭐
      </div>
      <div className="absolute top-2/3 left-1/3 text-pink-400/40 text-lg animate-twinkle delay-1200 animate-particles-enter">
        ✨
      </div>
      <div className="absolute bottom-1/4 right-1/5 text-rose-400/50 text-xs animate-twinkle delay-2000 animate-particles-enter">
        ⭐
      </div>

      {/* Spiral particles */}
      <div className="absolute top-1/4 right-1/2 w-6 h-6 bg-gradient-to-r from-pink-400/30 to-rose-400/30 rounded-full animate-spiral animate-particles-enter"></div>
      <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-gradient-to-r from-rose-300/40 to-pink-300/40 rounded-full animate-spiral delay-1000 animate-particles-enter"></div>

      {/* Main content */}
      <div className="text-center space-y-8 z-10 max-w-md mx-auto animate-content-enter">
        {/* Title */}
        <div className="space-y-4">
          {/* Decorative hearts - Above title */}
          <div className="flex space-x-2 text-pink-400 justify-around animate-hearts-enter">
            <span className="text-2xl animate-bounce-gentle">💖</span>
            <span className="text-xl animate-bounce-gentle delay-100">✨</span>
            <span className="text-2xl animate-bounce-gentle delay-200">💖</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent leading-tight animate-title-special font-serif">
            Assistante Babounette
          </h1>

          {/* Decorative hearts - Below title (existing) */}
          <div className="flex space-x-2 text-pink-400 justify-between animate-hearts-enter-delayed">
            <span className="text-2xl animate-bounce-gentle">💖</span>
            <span className="text-xl animate-bounce-gentle delay-100">✨</span>
            <span className="text-2xl animate-bounce-gentle delay-200">💖</span>
          </div>
        </div>

        {/* Enter button */}
        <div className="pt-4 animate-button-enter">
          <Button
            variant="ghost"
            asChild
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 border-0 animate-button-glow font-mono active:scale-95 select-none cursor-pointer"
            onMouseDown={handleButtonClick}
          >
            <Link href="/dashboard">Entrer</Link>
          </Button>
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-pink-200/50 to-transparent animate-wave"></div>
    </div>
  )
}
