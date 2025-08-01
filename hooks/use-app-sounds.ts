"use client";

import { useSettings } from "@/contexts/settings-context";
import { useAppSounds } from "./use-sound";
import { useFallbackSounds } from "./use-fallback-sounds";

export function useAppSoundsWithSettings() {
  const { settings } = useSettings();
  const { clickSound, menuClickSound } = useAppSounds();
  const fallbackSounds = useFallbackSounds();

  const playClickSound = () => {
    if (!settings.sounds) return;

    // Try to play the audio file first, fallback to generated sound
    if (clickSound.error || !clickSound.isLoaded) {
      console.log("Using fallback click sound");
      fallbackSounds.playClickSound();
    } else {
      clickSound.play();
    }
  };

  const playMenuClickSound = () => {
    if (!settings.sounds) return;

    // Try to play the audio file first, fallback to generated sound
    if (menuClickSound.error || !menuClickSound.isLoaded) {
      console.log("Using fallback menu click sound");
      fallbackSounds.playMenuClickSound();
    } else {
      menuClickSound.play();
    }
  };

  return {
    playClickSound,
    playMenuClickSound,
    soundsEnabled: settings.sounds,
    audioStatus: {
      clickSoundLoaded: clickSound.isLoaded,
      menuClickSoundLoaded: menuClickSound.isLoaded,
      clickSoundError: clickSound.error,
      menuClickSoundError: menuClickSound.error,
    },
  };
}
