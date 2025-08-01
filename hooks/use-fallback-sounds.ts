"use client";

import { useCallback } from "react";

export function useFallbackSounds() {
  const playClickSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create a simple click sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        400,
        audioContext.currentTime + 0.1
      );

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);

      console.log("Fallback click sound played");
    } catch (error) {
      console.warn("Fallback sound failed:", error);
    }
  }, []);

  const playMenuClickSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create a more pleasant menu click sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator1.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(900, audioContext.currentTime);

      oscillator1.frequency.exponentialRampToValueAtTime(
        300,
        audioContext.currentTime + 0.15
      );
      oscillator2.frequency.exponentialRampToValueAtTime(
        450,
        audioContext.currentTime + 0.15
      );

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15
      );

      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.15);
      oscillator2.stop(audioContext.currentTime + 0.15);

      console.log("Fallback menu click sound played");
    } catch (error) {
      console.warn("Fallback menu sound failed:", error);
    }
  }, []);

  return {
    playClickSound,
    playMenuClickSound,
  };
}
