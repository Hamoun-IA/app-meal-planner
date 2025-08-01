"use client";

import { Button } from "@/components/ui/button";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { PWAUpdatePrompt } from "@/components/pwa-update-prompt";
import { OfflineIndicator } from "@/components/offline-indicator";
import {
  Calendar,
  ChefHat,
  ShoppingCart,
  Settings,
  Sparkles,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple";

export default function Dashboard() {
  const [clickedButton, setClickedButton] = useState<number | null>(null);
  const [swSupported, setSWSupported] = useState(false);
  const router = useRouter();
  const { playMenuClickSound } = useAppSoundsSimple();

  useEffect(() => {
    // Vérifier le support des Service Workers
    setSWSupported("serviceWorker" in navigator);
  }, []);

  const handleMenuClick = useCallback(
    (href: string, buttonId: number) => {
      // Immediate visual feedback
      setClickedButton(buttonId);

      // Play sound immediately
      playMenuClickSound();

      // Reset visual feedback after a short delay
      setTimeout(() => setClickedButton(null), 150);

      // Navigate after a minimal delay for visual feedback
      setTimeout(() => {
        router.push(href);
      }, 100);
    },
    [playMenuClickSound, router]
  );

  const menuItems = [
    {
      id: 1,
      title: "Assistante",
      icon: Sparkles,
      href: "/assistante",
      description: "Ton aide magique",
      gradient: "from-pink-500 to-rose-500",
      hoverGradient: "from-pink-600 to-rose-600",
      activeGradient: "from-pink-700 to-rose-700",
    },
    {
      id: 2,
      title: "Calendrier",
      icon: Calendar,
      href: "/calendrier",
      description: "Organise ton temps",
      gradient: "from-rose-500 to-pink-500",
      hoverGradient: "from-rose-600 to-pink-600",
      activeGradient: "from-rose-700 to-pink-700",
    },
    {
      id: 3,
      title: "Recettes",
      icon: ChefHat,
      href: "/recettes",
      description: "Délicieuses idées",
      gradient: "from-pink-400 to-rose-400",
      hoverGradient: "from-pink-500 to-rose-500",
      activeGradient: "from-pink-600 to-rose-600",
    },
    {
      id: 4,
      title: "Liste de courses",
      icon: ShoppingCart,
      href: "/courses",
      description: "N'oublie rien",
      gradient: "from-rose-400 to-pink-400",
      hoverGradient: "from-rose-500 to-pink-500",
      activeGradient: "from-rose-600 to-pink-600",
    },
    {
      id: 5,
      title: "Options",
      icon: Settings,
      href: "/options",
      description: "Personnalise tout",
      gradient: "from-pink-600 to-rose-600",
      hoverGradient: "from-pink-700 to-rose-700",
      activeGradient: "from-pink-800 to-rose-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 p-4 relative overflow-hidden">
      {/* PWA Components - Afficher seulement si SW supporté */}
      <OfflineIndicator />
      {swSupported && (
        <>
          <PWAUpdatePrompt />
          <PWAInstallPrompt />
        </>
      )}

      {/* Background particles */}
      <div className="absolute top-20 left-20 w-16 h-16 bg-pink-200/30 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-40 right-32 w-12 h-12 bg-rose-200/40 rounded-full blur-lg animate-float-medium delay-1000"></div>
      <div className="absolute bottom-32 left-40 w-20 h-20 bg-pink-300/20 rounded-full blur-2xl animate-float-slow delay-500"></div>
      <div className="absolute bottom-20 right-20 w-8 h-8 bg-rose-300/30 rounded-full blur-md animate-float-fast delay-700"></div>

      {/* Floating hearts */}
      <div className="absolute top-32 right-1/4 text-pink-300/40 text-lg animate-float-heart">
        💖
      </div>
      <div className="absolute bottom-40 left-1/4 text-rose-300/30 text-sm animate-float-heart delay-800">
        💕
      </div>
      <div className="absolute top-1/2 right-1/6 text-pink-400/30 text-xs animate-float-heart delay-1600">
        💗
      </div>

      {/* Stars */}
      <div className="absolute top-1/4 left-1/6 text-pink-300/40 text-sm animate-twinkle">
        ✨
      </div>
      <div className="absolute bottom-1/3 right-1/3 text-rose-300/50 text-xs animate-twinkle delay-400">
        ⭐
      </div>
      <div className="absolute top-2/3 left-1/3 text-pink-400/30 text-lg animate-twinkle delay-1200">
        ✨
      </div>

      <div className="max-w-md mx-auto pt-8 pb-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-logo-pulse">
              <span className="text-2xl">💖</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2 font-serif">
            Babounette
          </h1>
          <p className="text-pink-600/70 text-sm">
            Que veux-tu faire aujourd'hui ? ✨
          </p>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-4">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isClicked = clickedButton === item.id;
            const gradientClass = isClicked
              ? item.activeGradient
              : item.gradient;
            const hoverGradientClass = item.hoverGradient;

            return (
              <Button
                key={item.id}
                variant="ghost"
                onMouseDown={() => handleMenuClick(item.href, item.id)}
                className={`
                  w-full h-16 p-0 border-0 rounded-2xl shadow-lg hover:shadow-xl
                  bg-gradient-to-r ${gradientClass} hover:${hoverGradientClass}
                  transform hover:scale-105 transition-all duration-150
                  animate-menu-item-enter group
                  ${isClicked ? "scale-95 shadow-md" : ""}
                  active:scale-95 active:shadow-md
                  select-none cursor-pointer
                `}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  transition: "all 0.1s ease-out",
                }}
              >
                <div className="w-full h-full flex items-center px-6 text-white">
                  <div className="flex items-center space-x-4 w-full">
                    <div className="flex-shrink-0">
                      <div
                        className={`
                        w-10 h-10 bg-white/20 rounded-full flex items-center justify-center 
                        group-hover:bg-white/30 transition-colors duration-150
                        ${isClicked ? "bg-white/40" : ""}
                      `}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-white/80 text-sm">
                        {item.description}
                      </p>
                    </div>
                    <div
                      className={`
                      flex-shrink-0 opacity-60 group-hover:opacity-100 
                      group-hover:translate-x-1 transition-all duration-150
                      ${isClicked ? "opacity-100 translate-x-1" : ""}
                    `}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="text-center mt-12 animate-fade-in-up"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="flex justify-center space-x-2 text-pink-400 mb-4">
            <span className="text-lg animate-bounce-gentle">💖</span>
            <span className="text-sm animate-bounce-gentle delay-100">
              ✨
            </span>
            <span className="text-lg animate-bounce-gentle delay-200">
              💖
            </span>
          </div>
          <p className="text-pink-500/60 text-xs">
            Créé avec amour pour toi 💕
          </p>
        </div>
      </div>
    </div>
  );
}
