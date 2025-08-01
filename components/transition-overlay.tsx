"use client";

import { useState, useEffect } from "react";

interface TransitionOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function TransitionOverlay({
  isVisible,
  onComplete,
}: TransitionOverlayProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setFadeOut(false);

      // Démarrer le fade out après 1.5 secondes
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 1500);

      // Terminer la transition après 2 secondes
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 2000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300 flex items-center justify-center transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      {/* Splash screen content */}
      <div className="text-center space-y-8 animate-splash-enter">
        {/* Logo/Icon */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-2xl animate-logo-pulse">
            <span className="text-4xl animate-logo-bounce">💖</span>
          </div>

          {/* Sparkles around logo */}
          <div className="absolute -top-2 -right-2 text-xl animate-sparkle-1">
            ✨
          </div>
          <div className="absolute -bottom-2 -left-2 text-lg animate-sparkle-2">
            💖
          </div>
          <div className="absolute top-1/2 -left-3 text-sm animate-sparkle-3">
            ⭐
          </div>
          <div className="absolute top-1/2 -right-3 text-sm animate-sparkle-4">
            💫
          </div>
        </div>

        {/* Brand name */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent animate-brand-appear">
            Chargement...
          </h1>
          <p className="text-pink-600/80 text-sm animate-tagline-appear">
            ✨ Un instant ma belle ✨
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center space-x-1 animate-loading-appear">
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-loading-dot"></div>
          <div className="w-2 h-2 bg-rose-400 rounded-full animate-loading-dot delay-200"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-loading-dot delay-400"></div>
        </div>
      </div>

      {/* Background particles */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-pink-300/40 rounded-full animate-bg-particle-1"></div>
      <div className="absolute top-40 right-32 w-3 h-3 bg-rose-300/50 rounded-full animate-bg-particle-2"></div>
      <div className="absolute bottom-32 left-40 w-5 h-5 bg-pink-400/30 rounded-full animate-bg-particle-3"></div>
      <div className="absolute bottom-20 right-20 w-2 h-2 bg-rose-400/60 rounded-full animate-bg-particle-4"></div>
    </div>
  );
}
