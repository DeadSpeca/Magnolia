import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ReaderSettings, ReaderTheme, DEFAULT_READER_SETTINGS } from "../types";
import { getReaderSettings, saveReaderSettings } from "../lib/storage";

interface ReaderSettingsContextType {
  settings: ReaderSettings;
  updateSettings: (updates: Partial<ReaderSettings>) => Promise<void>;
  applyTheme: (theme: ReaderTheme) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const ReaderSettingsContext = createContext<ReaderSettingsContextType | undefined>(
  undefined
);

export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getReaderSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const updateSettings = async (updates: Partial<ReaderSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await saveReaderSettings(newSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };

  const applyTheme = async (theme: ReaderTheme) => {
    await updateSettings({ theme });
  };

  const resetSettings = async () => {
    try {
      setSettings(DEFAULT_READER_SETTINGS);
      await saveReaderSettings(DEFAULT_READER_SETTINGS);
    } catch (error) {
      console.error("Error resetting settings:", error);
      throw error;
    }
  };

  return (
    <ReaderSettingsContext.Provider
      value={{ settings, updateSettings, applyTheme, resetSettings }}
    >
      {children}
    </ReaderSettingsContext.Provider>
  );
}

export function useReaderSettings() {
  const context = useContext(ReaderSettingsContext);
  if (!context) {
    throw new Error("useReaderSettings must be used within ReaderSettingsProvider");
  }
  return context;
}

