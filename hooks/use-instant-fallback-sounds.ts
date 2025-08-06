"use client"

import { useCallback, useRef } from "react"

export function useInstantFallbackSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const initContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
        gainNodeRef.current = audioContextRef.current.createGain()
        gainNodeRef.current.connect(audioContextRef.current.destination)
      } catch (error) {
        console.warn("Failed to init fallback audio context:", error)
      }
    }

    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume()
    }
  }, [])

  const playInstantClick = useCallback(() => {
    initContext()

    if (!audioContextRef.current || !gainNodeRef.current) return

    try {
      const ctx = audioContextRef.current
      const now = ctx.currentTime

      // Create a quick, pleasant click sound
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(gainNodeRef.current)

      // Frequency sweep for a "pop" sound
      osc.frequency.setValueAtTime(1200, now)
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05)

      // Quick envelope
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

      osc.start(now)
      osc.stop(now + 0.05)
    } catch (error) {
      console.warn("Instant fallback click failed:", error)
    }
  }, [initContext])

  const playInstantMenuClick = useCallback(() => {
    initContext()

    if (!audioContextRef.current || !gainNodeRef.current) return

    try {
      const ctx = audioContextRef.current
      const now = ctx.currentTime

      // Create a more musical menu sound
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(gainNodeRef.current)

      // Pleasant chord
      osc1.frequency.setValueAtTime(800, now)
      osc2.frequency.setValueAtTime(1200, now)

      osc1.frequency.exponentialRampToValueAtTime(600, now + 0.1)
      osc2.frequency.exponentialRampToValueAtTime(900, now + 0.1)

      // Smooth envelope
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.1)
      osc2.stop(now + 0.1)
    } catch (error) {
      console.warn("Instant fallback menu click failed:", error)
    }
  }, [initContext])

  return {
    playInstantClick,
    playInstantMenuClick,
  }
}
