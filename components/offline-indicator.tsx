"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wifi, WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Vérifier l'état initial
    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
              <WifiOff className="h-5 w-5" />
              Hors ligne
            </CardTitle>
          </div>
          <CardDescription className="text-orange-700">
            Tu es actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <Wifi className="h-4 w-4" />
            Vérifie ta connexion internet
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
