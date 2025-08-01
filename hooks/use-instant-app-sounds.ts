"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSettings } from "@/contexts/settings-context";
import { useOptimizedAppSounds } from "./use-optimized-sound";
import { useInstantFallbackSounds } from "./use-instant-fallback-sounds";

export function useInstantAppSounds() {
  const { settings } = useSettings();
  const { clickSound, menuClickSound } = useOptimizedAppSounds();
  const fallbackSounds = useInstantFallbackSounds();
  const isWarmedUpRef = useRef(false);

  // Warm up audio on component mount
  useEffect(() => {
    if (!isWarmedUpRef.current && settings.sounds) {
      const warmUp = () => {
        clickSound.warmUp();
        menuClickSound.warmUp();
        isWarmedUpRef.current = true;
        console.log("Audio system warmed up");
      };

      // Warm up immediately if possible, or on next user interaction
      if (document.visibilityState === "visible") {
        warmUp();
      } else {
        document.addEventListener("visibilitychange", warmUp, { once: true });
      }

      // Also warm up on any user interaction
      const interactionEvents = ["click", "touchstart", "keydown"];
      const handleInteraction = () => {
        warmUp();
        interactionEvents.forEach((event) => {
          document.removeEventListener(event, handleInteraction);
        });
      };

      interactionEvents.forEach((event) => {
        document.addEventListener(event, handleInteraction, {
          once: true,
          passive: true,
        });
      });

      return () => {
        interactionEvents.forEach((event) => {
          document.removeEventListener(event, handleInteraction);
        });
      };
    }
  }, [settings.sounds, clickSound, menuClickSound]);

  const playClickSound = useCallback(() => {
    if (!settings.sounds) return;

    const startTime = performance.now();

    // Try optimized sound first, immediate fallback if not ready
    if (clickSound.isReady && !clickSound.hasError) {
      clickSound.play();
    } else {
      console.log("Using instant fallback for click sound");
      fallbackSounds.playInstantClick();
    }

    // Performance monitoring
    requestAnimationFrame(() => {
      const endTime = performance.now();
      if (endTime - startTime > 10) {
        console.warn(
          `Click sound took ${endTime - startTime}ms - consider optimization`
        );
      }
    });
  }, [settings.sounds, clickSound, fallbackSounds]);

  const playMenuClickSound = useCallback(() => {
    if (!settings.sounds) return;

    const startTime = performance.now();

    // Try optimized sound first, immediate fallback if not ready
    if (menuClickSound.isReady && !menuClickSound.hasError) {
      menuClickSound.play();
    } else {
      console.log("Using instant fallback for menu click sound");
      fallbackSounds.playInstantMenuClick();
    }

    // Performance monitoring
    requestAnimationFrame(() => {
      const endTime = performance.now();
      if (endTime - startTime > 10) {
        console.warn(
          `Menu click sound took ${endTime - startTime}ms - consider optimization`
        );
      }
    });
  }, [settings.sounds, menuClickSound, fallbackSounds]);

  return {
    playClickSound,
    playMenuClickSound,
    soundsEnabled: settings.sounds,
    audioStatus: {
      clickSoundReady: clickSound.isReady,
      menuClickSoundReady: menuClickSound.isReady,
      clickSoundProgress: clickSound.loadingProgress,
      menuClickSoundProgress: menuClickSound.loadingProgress,
      clickSoundError: clickSound.error,
      menuClickSoundError: menuClickSound.error,
    },
  };
}
