import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  List,
  Button,
  Divider,
  useTheme,
  RadioButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  useReaderSettings,
  useAppSettings,
  ACCENT_COLORS,
  AccentColor,
} from "../src/context";
import { clearAllData } from "../src/lib/storage";

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { settings, resetSettings } = useReaderSettings();
  const { settings: appSettings, updateSettings: updateAppSettings } =
    useAppSettings();

  const isDark = appSettings.themeMode === "dark";

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all reader settings to default?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetSettings();
              Alert.alert("Success", "Settings have been reset");
            } catch (error) {
              Alert.alert("Error", "Failed to reset settings");
            }
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all books and settings. This action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert("Success", "All data has been cleared", [
                { text: "OK", onPress: () => router.replace("/") },
              ]);
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Settings
          </Text>
        </View>

        <List.Section>
          <List.Subheader>App Settings</List.Subheader>
          <List.Accordion
            title="Theme Mode"
            description={appSettings.themeMode === "light" ? "Light" : "Dark"}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          >
            <RadioButton.Group
              onValueChange={(value) =>
                updateAppSettings({
                  themeMode: value as "light" | "dark",
                })
              }
              value={appSettings.themeMode || "light"}
            >
              <List.Item
                title="Light"
                description="Light theme with bright backgrounds"
                left={() => <RadioButton.Android value="light" />}
              />
              <List.Item
                title="Dark"
                description="Dark theme with dark backgrounds"
                left={() => <RadioButton.Android value="dark" />}
              />
            </RadioButton.Group>
          </List.Accordion>

          <List.Accordion
            title="Library Color Scheme"
            description={
              appSettings.libraryColorScheme === "color"
                ? "Color"
                : "Monochrome"
            }
            left={(props) => <List.Icon {...props} icon="palette-outline" />}
          >
            <RadioButton.Group
              onValueChange={(value) =>
                updateAppSettings({
                  libraryColorScheme: value as "color" | "monochrome",
                })
              }
              value={appSettings.libraryColorScheme}
            >
              <List.Item
                title="Color"
                description="Show book covers in full color"
                left={() => <RadioButton.Android value="color" />}
              />
              <List.Item
                title="Monochrome"
                description="Show book covers in grayscale"
                left={() => <RadioButton.Android value="monochrome" />}
              />
            </RadioButton.Group>
          </List.Accordion>

          <List.Accordion
            title="Accent Color"
            description={
              appSettings.accentColor
                ? appSettings.accentColor.charAt(0).toUpperCase() +
                  appSettings.accentColor.slice(1)
                : "Purple"
            }
            left={(props) => <List.Icon {...props} icon="palette" />}
          >
            <View style={styles.colorPickerContainer}>
              {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((colorKey) => (
                <TouchableOpacity
                  key={colorKey}
                  style={[
                    styles.accentColorButton,
                    { backgroundColor: ACCENT_COLORS[colorKey] },
                    appSettings.accentColor === colorKey &&
                      styles.selectedAccentColor,
                  ]}
                  onPress={() => updateAppSettings({ accentColor: colorKey })}
                >
                  <Text style={styles.accentColorLabel}>
                    {colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </List.Accordion>
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Reader Settings</List.Subheader>
          <List.Item
            title="Font Size"
            description={`${settings.fontSize}px`}
            left={(props) => <List.Icon {...props} icon="format-size" />}
          />
          <List.Item
            title="Line Height"
            description={`${settings.lineHeight.toFixed(1)}`}
            left={(props) => (
              <List.Icon {...props} icon="format-line-spacing" />
            )}
          />
          <List.Item
            title="Reading Mode"
            description={settings.readingMode}
            left={(props) => <List.Icon {...props} icon="book-open-variant" />}
          />
          <List.Item
            title="Theme"
            description={settings.theme.name}
            left={(props) => <List.Icon {...props} icon="palette" />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="Supported Formats"
            description="TXT, FB2, EPUB"
            left={(props) => <List.Icon {...props} icon="file-document" />}
          />
        </List.Section>

        <Divider />

        <View style={styles.dangerZone}>
          <Text variant="titleMedium" style={styles.dangerTitle}>
            Danger Zone
          </Text>
          <Button
            mode="outlined"
            onPress={handleResetSettings}
            style={styles.dangerButton}
            textColor={theme.colors.error}
          >
            Reset Settings
          </Button>
          <Button
            mode="contained"
            onPress={handleClearAllData}
            style={styles.dangerButton}
            buttonColor={theme.colors.error}
          >
            Clear All Data
          </Button>
        </View>

        <View style={styles.backButtonContainer}>
          <Button
            mode="contained"
            onPress={() => router.back()}
            icon="arrow-left"
            style={styles.backButton}
          >
            Back to Library
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: "bold",
  },
  dangerZone: {
    padding: 16,
    marginTop: 16,
  },
  dangerTitle: {
    fontWeight: "bold",
    marginBottom: 16,
    color: "#D32F2F",
  },
  dangerButton: {
    marginBottom: 12,
  },
  backButtonContainer: {
    padding: 16,
    paddingTop: 24,
  },
  backButton: {
    marginBottom: 32,
  },
  colorPickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  accentColorButton: {
    width: "47%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedAccentColor: {
    borderColor: "#000000",
    borderWidth: 3,
  },
  accentColorLabel: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
