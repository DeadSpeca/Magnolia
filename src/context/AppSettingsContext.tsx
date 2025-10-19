import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type LibraryColorScheme = "color" | "monochrome";
export type AccentColor = "purple" | "red" | "blue" | "green" | "orange";
export type ThemeMode = "light" | "dark";

export const ACCENT_COLORS = {
  purple: "#6750A4",
  red: "#C62828",
  blue: "#1976D2",
  green: "#388E3C",
  orange: "#F57C00",
};

export const ACCENT_COLORS_DARK = {
  purple: "#D0BCFF",
  red: "#F2B8B5",
  blue: "#A8C7FA",
  green: "#A6D4A8",
  orange: "#FFB77C",
};

interface AppSettings {
  libraryColorScheme: LibraryColorScheme;
  accentColor: AccentColor;
  themeMode: ThemeMode;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
}

const DEFAULT_APP_SETTINGS: AppSettings = {
  libraryColorScheme: "color",
  accentColor: "purple",
  themeMode: "light",
};

const APP_SETTINGS_KEY = "@reader_app_settings";

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(
  undefined
);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(APP_SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Merge with defaults to handle new settings
        setSettings({ ...DEFAULT_APP_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error("Error loading app settings:", error);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("Error updating app settings:", error);
      throw error;
    }
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return context;
}
