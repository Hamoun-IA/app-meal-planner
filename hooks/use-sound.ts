"use client"

import { useCallback, useRef, useEffect, useState } from "react"

interface SoundOptions {
  volume?: number
  playbackRate?: number
  interrupt?: boolean
}

export function useSound(url: string, options: SoundOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Reset states
    setIsLoaded(false)
    setError(null)

    try {
      const audio = new Audio()
      audio.volume = options.volume ?? 0.5
      audio.playbackRate = options.playbackRate ?? 1
      audio.preload = "auto"
      audio.crossOrigin = "anonymous"

      const handleCanPlayThrough = () => {
        console.log("Audio loaded successfully:", url)
        setIsLoaded(true)
        setError(null)
      }

      const handleError = (e: Event) => {
        console.error("Audio loading error:", e, "URL:", url)
        setError(`Failed to load audio: ${url}`)
        setIsLoaded(false)
      }

      const handleLoadedData = () => {
        console.log("Audio data loaded:", url)
      }

      const handleLoadStart = () => {
        console.log("Audio load started:", url)
      }

      audio.addEventListener("canplaythrough", handleCanPlayThrough)
      audio.addEventListener("error", handleError)
      audio.addEventListener("loadeddata", handleLoadedData)
      audio.addEventListener("loadstart", handleLoadStart)

      // Set the source after adding event listeners
      audio.src = url

      audioRef.current = audio

      return () => {
        audio.removeEventListener("canplaythrough", handleCanPlayThrough)
        audio.removeEventListener("error", handleError)
        audio.removeEventListener("loadeddata", handleLoadedData)
        audio.removeEventListener("loadstart", handleLoadStart)
        audio.pause()
        audio.src = ""
      }
    } catch (err) {
      console.error("Error creating audio element:", err)
      setError("Failed to create audio element")
    }
  }, [url, options.volume, options.playbackRate])

  const play = useCallback(() => {
    if (error) {
      console.warn("Cannot play sound due to error:", error)
      return
    }

    if (audioRef.current) {
      try {
        if (options.interrupt) {
          audioRef.current.currentTime = 0
        }

        // Ensure volume is set
        audioRef.current.volume = options.volume ?? 0.5

        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio played successfully")
            })
            .catch((playError) => {
              console.warn("Audio play error:", playError)
              // Don't treat play errors as fatal - they're often due to browser policies
            })
        }
      } catch (playError) {
        console.warn("Audio play error:", playError)
      }
    } else {
      console.warn("Audio ref is null")
    }
  }, [url, options.interrupt, options.volume, error])

  const stop = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      } catch (stopError) {
        console.warn("Audio stop error:", stopError)
      }
    }
  }, [])

  return { play, stop, isLoaded, error }
}

export function useAppSounds() {
  const clickSound = useSound("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11L-Clic_de_bouton_girly-1754003907888-JLmi4woLnORJ8q2N7JzYlWZDfsP6Tv.mp3", {
    volume: 0.4,
    interrupt: true,
  })

  const menuClickSound = useSound("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/girlyclick-m35wgd6n66cyCgXLprXDMXMNnmyAQY.mp3", {
    volume: 0.6,
    interrupt: true,
  })

  return {
    clickSound,
    menuClickSound,
  }
}
