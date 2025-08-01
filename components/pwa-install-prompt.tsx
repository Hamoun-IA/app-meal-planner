"use client"

import { Button } from "@/components/ui/button"
import { Download, X, Smartphone, Monitor } from "lucide-react"
import { useState, useEffect } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const { playClickSound } = useAppSoundsSimple()

  useEffect(() => {
    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Détecter si déjà installé
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Vérifier si déjà installé via localStorage
    const hasBeenInstalled = localStorage.getItem("pwa-installed") === "true"
    const hasBeenDismissed = localStorage.getItem("pwa-dismissed") === "true"

    setIsInstalled(hasBeenInstalled || standalone)

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Afficher le prompt seulement si pas déjà installé et pas déjà refusé
      if (!hasBeenInstalled && !hasBeenDismissed && !standalone) {
        // Attendre un peu avant d'afficher le prompt
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    // Écouter l'installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      localStorage.setItem("pwa-installed", "true")
      console.log("PWA installée avec succès!")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    playClickSound()

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === "accepted") {
          console.log("Utilisateur a accepté l'installation")
          localStorage.setItem("pwa-installed", "true")
        } else {
          console.log("Utilisateur a refusé l'installation")
          localStorage.setItem("pwa-dismissed", "true")
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
      } catch (error) {
        console.error("Erreur lors de l'installation:", error)
      }
    }
  }

  const handleDismiss = () => {
    playClickSound()
    setShowPrompt(false)
    localStorage.setItem("pwa-dismissed", "true")
  }

  // Ne pas afficher si déjà installé ou en mode standalone
  if (isInstalled || isStandalone || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-pink-200 p-4 max-w-sm mx-auto">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
              {isIOS ? <Smartphone className="w-6 h-6 text-white" /> : <Monitor className="w-6 h-6 text-white" />}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Installer Babounette</h3>
            <p className="text-xs text-gray-600 mb-3">
              {isIOS
                ? "Ajoute Babounette à ton écran d'accueil pour un accès rapide !"
                : "Installe l'app pour une expérience optimale et un accès hors ligne !"}
            </p>

            {isIOS ? (
              <div className="text-xs text-gray-500 mb-3">
                <p>
                  1. Appuie sur <span className="font-medium">⎙</span> (Partager)
                </p>
                <p>2. Sélectionne "Sur l'écran d'accueil"</p>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-xs h-8"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Installer
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 text-xs h-8 px-2"
                >
                  Plus tard
                </Button>
              </div>
            )}
          </div>

          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
