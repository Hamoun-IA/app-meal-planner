"use client";

import { useCallback, useRef, useEffect, useState } from "react";

interface AudioInstance {
  audio: HTMLAudioElement | null;
  loaded: boolean;
  error: boolean;
}

export function useReliableSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const backSoundPoolRef = useRef<HTMLAudioElement[]>([]);
  const backSoundIndexRef = useRef(0);
  const [audioFilesStatus, setAudioFilesStatus] = useState({
    clickSound: { loaded: false, error: false },
    menuSound: { loaded: false, error: false },
    backSound: { loaded: false, error: false },
  });

  // Initialize Web Audio Context (always works)
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        console.log("Web Audio Context initialized successfully");
      } catch (error) {
        console.warn("Web Audio Context failed to initialize:", error);
      }
    }

    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume().catch(() => {
        console.warn("Failed to resume audio context");
      });
    }
  }, []);

  // Create audio pool for back sound for better reliability
  useEffect(() => {
    const createBackSoundPool = () => {
      const poolSize = 3;
      const pool: HTMLAudioElement[] = [];
      let loadedCount = 0;

      const checkAllLoaded = () => {
        if (loadedCount === poolSize) {
          console.log("Back sound pool fully loaded");
          setAudioFilesStatus((prev) => ({
            ...prev,
            backSound: { loaded: true, error: false },
          }));
        }
      };

      for (let i = 0; i < poolSize; i++) {
        const audio = new Audio();

        const onLoad = () => {
          loadedCount++;
          console.log(`Back sound instance ${i + 1}/${poolSize} loaded`);
          checkAllLoaded();
        };

        const onError = (e: Event) => {
          console.warn(`Back sound instance ${i + 1} failed to load:`, e);
          loadedCount++;
          if (loadedCount === poolSize) {
            setAudioFilesStatus((prev) => ({
              ...prev,
              backSound: { loaded: false, error: true },
            }));
          }
        };

        // Configure audio for optimal performance
        audio.preload = "auto";
        audio.volume = 0.8;
        audio.crossOrigin = "anonymous";

        audio.addEventListener("canplaythrough", onLoad, { once: true });
        audio.addEventListener("error", onError, { once: true });

        // Set source after event listeners
        audio.src =
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fairyclick-hndPdZFszE6Klei4r4ySyWDfckMVR2.mp3";

        pool.push(audio);
      }

      backSoundPoolRef.current = pool;
      return pool;
    };

    // Try to load other audio files but don't depend on them
    const loadAudioFile = (url: string, key: "clickSound" | "menuSound") => {
      const audio = new Audio();

      const onLoad = () => {
        console.log(`Audio file loaded successfully: ${url}`);
        setAudioFilesStatus((prev) => ({
          ...prev,
          [key]: { loaded: true, error: false },
        }));
      };

      const onError = () => {
        console.log(`Audio file failed to load (will use fallback): ${url}`);
        setAudioFilesStatus((prev) => ({
          ...prev,
          [key]: { loaded: false, error: true },
        }));
      };

      audio.addEventListener("canplaythrough", onLoad, { once: true });
      audio.addEventListener("error", onError, { once: true });

      audio.src = url;
      audio.volume = 0.6;
      audio.preload = "auto";

      return audio;
    };

    // Load all audio files
    const backSoundPool = createBackSoundPool();
    const clickAudio = loadAudioFile(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11L-Clic_de_bouton_girly-1754003907888-JLmi4woLnORJ8q2N7JzYlWZDfsP6Tv.mp3",
      "clickSound"
    );
    const menuAudio = loadAudioFile(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/girlyclick-m35wgd6n66cyCgXLprXDMXMNnmyAQY.mp3",
      "menuSound"
    );

    return () => {
      // Cleanup
      backSoundPool.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      backSoundPoolRef.current = [];
      clickAudio?.pause();
      menuAudio?.pause();
    };
  }, []);

  // Reliable Web Audio API sounds (always work)
  const playWebAudioClick = useCallback(() => {
    initAudioContext();

    if (!audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Create a pleasant click sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Sweet click sound
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.type = "sine";
      osc.start(now);
      osc.stop(now + 0.08);

      console.log("Web Audio click played");
    } catch (error) {
      console.warn("Web Audio click failed:", error);
    }
  }, [initAudioContext]);

  const playWebAudioMenuClick = useCallback(() => {
    initAudioContext();

    if (!audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Create a more musical menu sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      // Pleasant chord progression
      osc1.frequency.setValueAtTime(800, now);
      osc2.frequency.setValueAtTime(1200, now);

      osc1.frequency.exponentialRampToValueAtTime(500, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(750, now + 0.12);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.type = "sine";
      osc2.type = "sine";

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.12);

      console.log("Web Audio menu click played");
    } catch (error) {
      console.warn("Web Audio menu click failed:", error);
    }
  }, [initAudioContext]);

  // Web Audio fallback for back sound
  const playWebAudioBackClick = useCallback(() => {
    initAudioContext();

    if (!audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Create a magical fairy-like sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      osc3.connect(gain);
      gain.connect(ctx.destination);

      // Fairy-like frequencies
      osc1.frequency.setValueAtTime(1200, now);
      osc2.frequency.setValueAtTime(1800, now);
      osc3.frequency.setValueAtTime(2400, now);

      osc1.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      osc3.frequency.exponentialRampToValueAtTime(1600, now + 0.15);

      // Magical envelope
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.type = "sine";
      osc2.type = "sine";
      osc3.type = "triangle";

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.15);
      osc3.stop(now + 0.15);

      console.log("Web Audio fairy back click played");
    } catch (error) {
      console.warn("Web Audio fairy back click failed:", error);
    }
  }, [initAudioContext]);

  // Main play functions
  const playClickSound = useCallback(() => {
    playWebAudioClick();
  }, [playWebAudioClick]);

  const playMenuClickSound = useCallback(() => {
    playWebAudioMenuClick();
  }, [playWebAudioMenuClick]);

  // Improved back sound function with pool management
  const playBackSound = useCallback(() => {
    const startTime = performance.now();

    console.log("playBackSound called, status:", audioFilesStatus.backSound);

    // Always try Web Audio first for immediate feedback
    playWebAudioBackClick();

    // Then try to play the actual audio file if available (as enhancement)
    if (
      backSoundPoolRef.current.length > 0 &&
      audioFilesStatus.backSound.loaded
    ) {
      try {
        const audio = backSoundPoolRef.current[backSoundIndexRef.current];
        backSoundIndexRef.current =
          (backSoundIndexRef.current + 1) % backSoundPoolRef.current.length;

        if (audio && audio.readyState >= 2) {
          // HAVE_CURRENT_DATA
          audio.currentTime = 0;
          audio.volume = 0.4; // Lower volume since we also play Web Audio

          const playPromise = audio.play();
          if (playPromise) {
            playPromise
              .then(() => {
                const endTime = performance.now();
                console.log(
                  `Fairy click file played successfully in ${endTime - startTime}ms`
                );
              })
              .catch((error) => {
                console.warn("Fairy click file play failed:", error);
              });
          }
        }
      } catch (error) {
        console.warn("Fairy click file immediate play failed:", error);
      }
    }
  }, [audioFilesStatus.backSound, playWebAudioBackClick]);

  // Warm up function
  const warmUp = useCallback(() => {
    initAudioContext();

    // Pre-warm the back sound pool if loaded
    if (
      backSoundPoolRef.current.length > 0 &&
      audioFilesStatus.backSound.loaded
    ) {
      try {
        const audio = backSoundPoolRef.current[0];
        if (audio && audio.readyState >= 2) {
          audio.volume = 0.01;
          const playPromise = audio.play();

          if (playPromise) {
            playPromise
              .then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 0.8;
                console.log("Back sound pool warmed up successfully");
              })
              .catch(() => {
                // Ignore warm-up errors
              });
          }
        }
      } catch (error) {
        // Ignore warm-up errors
      }
    }

    console.log("Audio system warmed up");
  }, [initAudioContext, audioFilesStatus.backSound.loaded]);

  return {
    playClickSound,
    playMenuClickSound,
    playBackSound,
    warmUp,
    audioFilesStatus,
    isReady: true,
  };
}
