import { Stack } from "expo-router";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import {
  ReaderSettingsProvider,
  AppSettingsProvider,
  useAppSettings,
  ACCENT_COLORS,
  ACCENT_COLORS_DARK,
} from "../src/context";

function AppContent() {
  const { settings } = useAppSettings();

  const isDark = settings.themeMode === "dark";
  const isMonochrome = settings.libraryColorScheme === "monochrome";
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  // Get the appropriate accent color
  const accentColor = isMonochrome
    ? isDark
      ? "#E0E0E0"
      : "#424242"
    : isDark
    ? ACCENT_COLORS_DARK[settings.accentColor]
    : ACCENT_COLORS[settings.accentColor];

  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: accentColor,
      primaryContainer: isMonochrome
        ? isDark
          ? "#424242"
          : "#E0E0E0"
        : baseTheme.colors.primaryContainer,
      secondary: isMonochrome
        ? isDark
          ? "#9E9E9E"
          : "#616161"
        : baseTheme.colors.secondary,
      secondaryContainer: isMonochrome
        ? isDark
          ? "#424242"
          : "#F5F5F5"
        : baseTheme.colors.secondaryContainer,
      tertiary: isMonochrome
        ? isDark
          ? "#BDBDBD"
          : "#757575"
        : baseTheme.colors.tertiary,
      background: isDark ? "#121212" : "#FFFFFF",
      surface: isDark ? "#1E1E1E" : "#FFFFFF",
      surfaceVariant: isDark ? "#2C2C2C" : "#F5F5F5",
    },
  };

  return (
    <PaperProvider theme={theme}>
      <ReaderSettingsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="library" options={{ headerShown: false }} />
          <Stack.Screen
            name="reader/[id]"
            options={{
              headerShown: false,
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </ReaderSettingsProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AppSettingsProvider>
          <AppContent />
        </AppSettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
