"use client";

import { useCallback, useRef, useEffect, useState } from "react";

interface AudioPool {
  instances: HTMLAudioElement[];
  currentIndex: number;
  loaded: boolean;
  error: string | null;
}

interface SoundOptions {
  volume?: number;
  poolSize?: number;
  preload?: boolean;
}

export function useOptimizedSound(url: string, options: SoundOptions = {}) {
  const poolRef = useRef<AudioPool>({
    instances: [],
    currentIndex: 0,
    loaded: false,
    error: null,
  });

  const [isReady, setIsReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const poolSize = options.poolSize || 3;
  const volume = options.volume || 0.6;

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = volume;
        console.log("Audio context initialized");
      } catch (error) {
        console.warn("Failed to initialize audio context:", error);
      }
    }

    // Resume audio context if suspended (required for mobile)
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume().then(() => {
        console.log("Audio context resumed");
      });
    }
  }, [volume]);

  // Create audio pool
  useEffect(() => {
    const pool = poolRef.current;
    pool.instances = [];
    pool.loaded = false;
    pool.error = null;
    setIsReady(false);
    setLoadingProgress(0);

    let loadedCount = 0;

    const createAudioInstance = (index: number) => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = volume;
      audio.crossOrigin = "anonymous";

      const onCanPlayThrough = () => {
        loadedCount++;
        setLoadingProgress((loadedCount / poolSize) * 100);

        if (loadedCount === poolSize) {
          pool.loaded = true;
          setIsReady(true);
          console.log(`Audio pool ready for ${url} (${poolSize} instances)`);
        }
      };

      const onError = (e: Event) => {
        console.error(`Audio instance ${index} failed to load:`, e);
        pool.error = `Failed to load audio: ${url}`;

        // Still count as "loaded" to prevent hanging
        loadedCount++;
        setLoadingProgress((loadedCount / poolSize) * 100);

        if (loadedCount === poolSize) {
          setIsReady(true);
        }
      };

      const onLoadStart = () => {
        console.log(`Loading audio instance ${index} for ${url}`);
      };

      audio.addEventListener("canplaythrough", onCanPlayThrough, {
        once: true,
      });
      audio.addEventListener("error", onError, { once: true });
      audio.addEventListener("loadstart", onLoadStart, { once: true });

      // Set source after event listeners
      audio.src = url;

      return audio;
    };

    // Create multiple audio instances for the pool
    for (let i = 0; i < poolSize; i++) {
      pool.instances.push(createAudioInstance(i));
    }

    return () => {
      // Cleanup
      pool.instances.forEach((audio, index) => {
        audio.pause();
        audio.src = "";
        audio.removeEventListener("canplaythrough", () => {});
        audio.removeEventListener("error", () => {});
        audio.removeEventListener("loadstart", () => {});
      });
      pool.instances = [];
    };
  }, [url, volume, poolSize]);

  // Optimized play function with immediate execution
  const play = useCallback(() => {
    const startTime = performance.now();

    // Initialize audio context on first interaction
    initAudioContext();

    const pool = poolRef.current;

    if (!pool.loaded || pool.instances.length === 0) {
      console.warn("Audio pool not ready, skipping playback");
      return;
    }

    try {
      // Get next available audio instance
      const audio = pool.instances[pool.currentIndex];
      pool.currentIndex = (pool.currentIndex + 1) % pool.instances.length;

      // Reset to beginning for immediate playback
      audio.currentTime = 0;
      audio.volume = volume;

      // Play immediately without waiting for promise
      const playPromise = audio.play();

      if (playPromise) {
        playPromise
          .then(() => {
            const endTime = performance.now();
            console.log(
              `Audio played successfully in ${endTime - startTime}ms`
            );
          })
          .catch((error) => {
            console.warn("Audio play promise rejected:", error);
            // Don't throw error, just log it
          });
      }
    } catch (error) {
      console.warn("Immediate audio play failed:", error);
    }
  }, [volume, initAudioContext]);

  // Warm up audio (call this on first user interaction)
  const warmUp = useCallback(() => {
    initAudioContext();

    // Pre-warm the first audio instance
    const pool = poolRef.current;
    if (pool.instances.length > 0) {
      const audio = pool.instances[0];
      audio.volume = 0.01; // Very quiet
      const playPromise = audio.play();

      if (playPromise) {
        playPromise
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = volume;
            console.log("Audio warmed up successfully");
          })
          .catch(() => {
            // Ignore warm-up errors
          });
      }
    }
  }, [volume, initAudioContext]);

  return {
    play,
    warmUp,
    isReady,
    loadingProgress,
    hasError: !!poolRef.current.error,
    error: poolRef.current.error,
  };
}

// Optimized app sounds hook
export function useOptimizedAppSounds() {
  const clickSound = useOptimizedSound(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11L-Clic_de_bouton_girly-1754003907888-JLmi4woLnORJ8q2N7JzYlWZDfsP6Tv.mp3",
    {
      volume: 0.4,
      poolSize: 2,
    }
  );

  const menuClickSound = useOptimizedSound(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/girlyclick-m35wgd6n66cyCgXLprXDMXMNnmyAQY.mp3",
    {
      volume: 0.6,
      poolSize: 3, // More instances for menu sounds
    }
  );

  return {
    clickSound,
    menuClickSound,
  };
}
