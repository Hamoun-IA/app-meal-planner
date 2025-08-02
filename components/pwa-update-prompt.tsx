"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw, X } from "lucide-react"
import { useState, useEffect } from "react"
import { usePWAUpdate } from "@/hooks/use-pwa-update"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"

export function PWAUpdatePrompt() {
  const { updateAvailable, updateApp } = usePWAUpdate()
  const [dismissed, setDismissed] = useState(false)
  const [swSupported, setSWSupported] = useState(false)
  const { playClickSound } = useAppSoundsSimple()

  useEffect(() => {
    // Vérifier le support des Service Workers
    setSWSupported("serviceWorker" in navigator)
  }, [])

  const handleUpdate = () => {
    playClickSound()
    updateApp()
  }

  const handleDismiss = () => {
    playClickSound()
    setDismissed(true)
  }

  // Ne pas afficher si pas de mise à jour, déjà fermé, ou SW non supporté
  if (!updateAvailable || dismissed || !swSupported) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 p-4 max-w-sm mx-auto">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Mise à jour disponible</h3>
            <p className="text-xs text-gray-600 mb-3">Une nouvelle version de Babounette est prête ! ✨</p>

            <div className="flex space-x-2">
              <Button
                onClick={handleUpdate}
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-xs h-8"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Mettre à jour
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
