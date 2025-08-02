"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { ArrowLeft, Bell, Moon, Palette, Settings, User, Volume2, CheckCircle, Music } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"
// import { useAudioStatus } from "@/hooks/use-audio-status" // Removed import

export default function OptionsPage() {
  const { settings, updateSetting } = useSettings()
  const { playBackSound, audioStatus } = useAppSoundsSimple() // Updated line
  // const { audioStatus } = useAudioStatus() // Removed line

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const handleSwitchChange = (key: string, value: boolean) => {
    // Jouer un son de confirmation si les sons sont activés
    if (key !== "sounds" && settings.sounds) {
      // playClickSound() // Removed playClickSound
    }
    updateSetting(key, value)
  }

  const settingsGroups = [
    {
      title: "Préférences",
      icon: User,
      items: [
        {
          key: "notifications" as keyof typeof settings,
          label: "Notifications",
          description: "Recevoir des rappels et alertes",
          icon: Bell,
        },
        {
          key: "sounds" as keyof typeof settings,
          label: "Sons",
          description: "Sons d'interface et notifications",
          icon: Volume2,
        },
      ],
    },
    {
      title: "Apparence",
      icon: Palette,
      items: [
        {
          key: "darkMode" as keyof typeof settings,
          label: "Mode sombre",
          description: "Interface sombre pour tes yeux",
          icon: Moon,
        },
      ],
    },
    {
      title: "Synchronisation",
      icon: Settings,
      items: [
        {
          key: "autoSync" as keyof typeof settings,
          label: "Synchronisation auto",
          description: "Sauvegarder automatiquement",
          icon: Settings,
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute top-20 left-20 w-12 h-12 bg-pink-200/30 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-40 right-32 w-8 h-8 bg-rose-200/40 rounded-full blur-lg animate-float-medium delay-1000"></div>

      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-4 shadow-lg">
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
            <Settings className="w-6 h-6 text-white" />
            <h1 className="text-white font-semibold text-xl">Options</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">💖</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Super Babounette</h2>
              <p className="text-gray-600">Ton assistante préférée ✨</p>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group, groupIndex) => {
            const GroupIcon = group.icon

            return (
              <div
                key={group.title}
                className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up"
                style={{ animationDelay: `${(groupIndex + 1) * 0.1}s` }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-lg flex items-center justify-center">
                    <GroupIcon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{group.title}</h3>
                </div>

                <div className="space-y-4">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon

                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-3 hover:bg-pink-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <ItemIcon className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-800">{item.label}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings[item.key]}
                          onCheckedChange={(value) => handleSwitchChange(item.key, value)}
                          className="data-[state=checked]:bg-pink-500"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Sound Status Indicator */}
        {settings.sounds && (
          <div
            className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl shadow-lg p-4 mt-6 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-pink-600">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm font-medium">Sons activés ✨</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                <div className="flex items-center justify-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Clic: Web Audio</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Menu: Web Audio</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  {audioStatus.backSoundLoaded ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <Music className="w-3 h-3 text-blue-500" />
                  )}
                  <span>Retour: {audioStatus.backSoundLoaded ? "Fairy Click" : "Web Audio"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-pink-200 hover:bg-pink-50 bg-transparent">
              <User className="w-4 h-4 mr-3" />
              Modifier le profil
            </Button>
            <Button variant="outline" className="w-full justify-start border-pink-200 hover:bg-pink-50 bg-transparent">
              <Settings className="w-4 h-4 mr-3" />
              Paramètres avancés
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
          <div className="flex justify-center space-x-2 text-pink-400 mb-2">
            <span className="text-lg animate-bounce-gentle">💖</span>
            <span className="text-sm animate-bounce-gentle delay-100">✨</span>
            <span className="text-lg animate-bounce-gentle delay-200">💖</span>
          </div>
          <p className="text-pink-500/60 text-xs">Version 1.0.0 • Fait avec amour 💕</p>
        </div>
      </div>
    </div>
  )
}
