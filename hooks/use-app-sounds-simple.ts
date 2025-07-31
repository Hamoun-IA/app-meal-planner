"use client"

import { useCallback, useEffect, useRef } from "react"
import { useSettings } from "@/contexts/settings-context"
import { useReliableSounds } from "./use-reliable-sounds"

export function useAppSoundsSimple() {
  const { settings } = useSettings()
  const { playClickSound, playMenuClickSound, playBackSound, warmUp, audioFilesStatus } = useReliableSounds()
  const isWarmedUpRef = useRef(false)

  // Warm up audio on first interaction
  useEffect(() => {
    if (!isWarmedUpRef.current && settings.sounds) {
      const handleFirstInteraction = () => {
        warmUp()
        isWarmedUpRef.current = true
        console.log("Audio warmed up on first interaction")
      }

      // Listen for any user interaction
      const events = ["click", "touchstart", "keydown", "mousedown"]
      events.forEach((event) => {
        document.addEventListener(event, handleFirstInteraction, {
          once: true,
          passive: true,
        })
      })

      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, handleFirstInteraction)
        })
      }
    }
  }, [settings.sounds, warmUp])

  const playClick = useCallback(() => {
    if (!settings.sounds) return

    try {
      playClickSound()
    } catch (error) {
      console.warn("Click sound failed:", error)
    }
  }, [settings.sounds, playClickSound])

  const playMenuClick = useCallback(() => {
    if (!settings.sounds) return

    try {
      playMenuClickSound()
    } catch (error) {
      console.warn("Menu click sound failed:", error)
    }
  }, [settings.sounds, playMenuClickSound])

  const playBack = useCallback(() => {
    if (!settings.sounds) return

    try {
      playBackSound()
    } catch (error) {
      console.warn("Back sound failed:", error)
    }
  }, [settings.sounds, playBackSound])

  return {
    playClickSound: playClick,
    playMenuClickSound: playMenuClick,
    playBackSound: playBack, // New back sound function
    soundsEnabled: settings.sounds,
    audioStatus: {
      ready: true,
      audioFilesLoaded: audioFilesStatus.clickSound.loaded && audioFilesStatus.menuSound.loaded,
      backSoundLoaded: audioFilesStatus.backSound.loaded,
      usingWebAudio: true,
    },
  }
}
