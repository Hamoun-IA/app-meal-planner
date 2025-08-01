"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface SettingsContextType {
  settings: {
    notifications: boolean;
    darkMode: boolean;
    sounds: boolean;
    autoSync: boolean;
  };
  updateSetting: (key: string, value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    sounds: true,
    autoSync: true,
  });

  // Charger les paramètres depuis localStorage au démarrage
  useEffect(() => {
    const savedSettings = localStorage.getItem("babounette-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, []);

  // Sauvegarder les paramètres dans localStorage quand ils changent
  useEffect(() => {
    localStorage.setItem("babounette-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
