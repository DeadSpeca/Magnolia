import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  TextInput,
  Dimensions,
  GestureResponderEvent,
  AppState,
  AppStateStatus,
} from "react-native";
import { Text, IconButton, useTheme, Button } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import Slider from "@react-native-community/slider";
import { Book, BookContent, ReadingMode, READER_THEMES } from "../../src/types";
import {
  getBookById,
  updateBookProgress,
  getCachedBookContent,
  setCachedBookContent,
} from "../../src/lib/storage";
import { parseBookFile } from "../../src/lib/parsers";
import { ReaderView } from "../../src/components";
import { useReaderSettings } from "../../src/context";

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { settings, updateSettings } = useReaderSettings();

  const [book, setBook] = useState<Book | null>(null);
  const [content, setContent] = useState<BookContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [bgColorInput, setBgColorInput] = useState(settings.backgroundColor);
  const [textColorInput, setTextColorInput] = useState(settings.textColor);

  // Common colors for quick selection
  const commonColors = [
    "#FFFFFF",
    "#F4ECD8",
    "#1E1E1E",
    "#000000",
    "#FFE5E5",
    "#E5F5FF",
    "#E5FFE5",
    "#FFF5E5",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
  ];

  useEffect(() => {
    loadBook();
  }, [id]);

  // Continuous debounced progress saving - triggers on position change
  useEffect(() => {
    if (book && content && currentPosition > 0) {
      // Debounced save - only saves after user stops scrolling for 2 seconds
      updateBookProgress(book.id, currentPosition, content.text.length, false);
    }
    // Only depend on currentPosition to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPosition]);

  // Save position when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // When app goes to background or inactive, save immediately
      if (nextAppState === "background" || nextAppState === "inactive") {
        if (book && content && currentPosition >= 0) {
          updateBookProgress(
            book.id,
            currentPosition,
            content.text.length,
            true
          );
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, [book, content, currentPosition]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const loadedBook = await getBookById(id);
      if (!loadedBook) {
        Alert.alert("Error", "Book not found");
        router.back();
        return;
      }

      setBook(loadedBook);
      // Load saved position immediately
      setCurrentPosition(loadedBook.currentPosition || 0);

      // Try to get cached content first (instant - in memory only!)
      let parsedContent = getCachedBookContent(loadedBook.id);

      if (!parsedContent) {
        // Parse content if not cached
        parsedContent = await parseBookFile(
          loadedBook.filePath,
          loadedBook.format
        );
        // Cache it in memory for next time (instant!)
        setCachedBookContent(loadedBook.id, parsedContent);
      }

      setContent(parsedContent);

      // Update metadata if available
      if (parsedContent.metadata.title !== "Unknown") {
        loadedBook.title = parsedContent.metadata.title;
      }
      if (parsedContent.metadata.author !== "Unknown") {
        loadedBook.author = parsedContent.metadata.author;
      }

      // Update total length and save
      const totalLength = parsedContent.text.length;
      loadedBook.totalLength = totalLength;

      // Mark as opened (immediate save on open)
      loadedBook.lastOpened = Date.now();
      await updateBookProgress(
        loadedBook.id,
        loadedBook.currentPosition || 0,
        totalLength,
        true // immediate save
      );
    } catch (error) {
      console.error("Error loading book:", error);
      Alert.alert("Error", "Failed to load book content");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handlePositionChange = (position: number) => {
    setCurrentPosition(position);
  };

  const handleClose = async () => {
    // Immediate save on close (no debounce)
    if (book && content) {
      await updateBookProgress(
        book.id,
        currentPosition,
        content.text.length,
        true
      );
    }
    router.back();
  };

  const handleReaderPress = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = Dimensions.get("window");

    // Define bottom-left corner area (20% of width, 20% of height from bottom)
    const cornerWidth = width * 0.2;
    const cornerHeight = height * 0.2;
    const isBottomLeft =
      locationX < cornerWidth && locationY > height - cornerHeight;

    if (isBottomLeft) {
      setShowControls(!showControls);
    }
  };

  if (loading || !book || !content) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: settings.backgroundColor },
        ]}
      >
        <StatusBar hidden />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: settings.textColor }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  const progress =
    content.text.length > 0
      ? Math.round((currentPosition / content.text.length) * 100)
      : 0;

  return (
    <View
      style={[styles.container, { backgroundColor: settings.backgroundColor }]}
    >
      <StatusBar hidden />

      <TouchableOpacity
        style={styles.readerContainer}
        activeOpacity={1}
        onPress={handleReaderPress}
      >
        <ReaderView
          content={content.text}
          settings={settings}
          initialPosition={currentPosition}
          onPositionChange={handlePositionChange}
          bookMetadata={content.metadata}
        />
      </TouchableOpacity>

      {showControls && (
        <>
          <View style={[styles.topBar, { backgroundColor: "rgba(0,0,0,0.8)" }]}>
            <View style={styles.topBarLeft}>
              <IconButton
                icon="arrow-left"
                iconColor="#FFFFFF"
                size={24}
                onPress={handleClose}
                style={styles.backButton}
              />
              <Text style={styles.topBarTitle} numberOfLines={1}>
                {book.title}
              </Text>
            </View>
            <IconButton
              icon="cog"
              iconColor="#FFFFFF"
              size={24}
              onPress={() => setShowSettings(true)}
            />
          </View>

          <View
            style={[styles.bottomBar, { backgroundColor: "rgba(0,0,0,0.8)" }]}
          >
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </>
      )}

      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                Reader Settings
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowSettings(false)}
              />
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.settingSection}>
                <Text variant="titleMedium" style={styles.settingLabel}>
                  Font Size: {settings.fontSize}px
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={12}
                  maximumValue={32}
                  step={1}
                  value={settings.fontSize}
                  onValueChange={(value) => updateSettings({ fontSize: value })}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor="#CCCCCC"
                />
              </View>

              <View style={styles.settingSection}>
                <Text variant="titleMedium" style={styles.settingLabel}>
                  Line Height: {settings.lineHeight.toFixed(1)}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1.0}
                  maximumValue={2.5}
                  step={0.1}
                  value={settings.lineHeight}
                  onValueChange={(value) =>
                    updateSettings({ lineHeight: value })
                  }
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor="#CCCCCC"
                />
              </View>

              <View style={styles.settingSection}>
                <Text variant="titleMedium" style={styles.settingLabel}>
                  Reading Mode
                </Text>
                <View style={styles.buttonGroup}>
                  <Button
                    mode={
                      settings.readingMode === ReadingMode.VERTICAL_SCROLL
                        ? "contained"
                        : "outlined"
                    }
                    onPress={() =>
                      updateSettings({
                        readingMode: ReadingMode.VERTICAL_SCROLL,
                      })
                    }
                    style={styles.modeButton}
                  >
                    Vertical
                  </Button>
                  <Button
                    mode={
                      settings.readingMode === ReadingMode.PAGINATED
                        ? "contained"
                        : "outlined"
                    }
                    onPress={() =>
                      updateSettings({ readingMode: ReadingMode.PAGINATED })
                    }
                    style={styles.modeButton}
                  >
                    Pages
                  </Button>
                </View>
              </View>

              <View style={styles.settingSection}>
                <Text variant="titleMedium" style={styles.settingLabel}>
                  Quick Themes
                </Text>
                <View style={styles.themeGrid}>
                  {READER_THEMES.map((themeOption) => (
                    <TouchableOpacity
                      key={themeOption.id}
                      style={[
                        styles.themeCard,
                        {
                          backgroundColor: themeOption.backgroundColor,
                          borderColor:
                            settings.backgroundColor ===
                              themeOption.backgroundColor &&
                            settings.textColor === themeOption.textColor
                              ? theme.colors.primary
                              : "#CCCCCC",
                          borderWidth:
                            settings.backgroundColor ===
                              themeOption.backgroundColor &&
                            settings.textColor === themeOption.textColor
                              ? 3
                              : 1,
                        },
                      ]}
                      onPress={() =>
                        updateSettings({
                          theme: themeOption,
                          backgroundColor: themeOption.backgroundColor,
                          textColor: themeOption.textColor,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.themeText,
                          { color: themeOption.textColor },
                        ]}
                      >
                        Aa
                      </Text>
                      <Text
                        style={[
                          styles.themeName,
                          { color: themeOption.textColor },
                        ]}
                      >
                        {themeOption.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.settingSection}>
                <Text variant="titleMedium" style={styles.settingLabel}>
                  Background Color
                </Text>
                <View style={styles.colorPickerContainer}>
                  <View style={styles.colorGrid}>
                    {commonColors.map((color) => (
                      <TouchableOpacity
                        key={`bg-${color}`}
                        style={[
                          styles.colorButton,
                          { backgroundColor: color },
                          settings.backgroundColor === color &&
                            styles.selectedColor,
                        ]}
                        onPress={() => {
                          setBgColorInput(color);
                          updateSettings({ backgroundColor: color });
                        }}
                      />
                    ))}
                  </View>
                  <View style={styles.colorInputRow}>
                    <TextInput
                      style={styles.colorInput}
                      value={bgColorInput}
                      onChangeText={setBgColorInput}
                      placeholder="#FFFFFF"
                      placeholderTextColor="#999"
                      autoCapitalize="none"
                    />
                    <Button
                      mode="contained"
                      onPress={() => {
                        if (/^#[0-9A-F]{6}$/i.test(bgColorInput)) {
                          updateSettings({ backgroundColor: bgColorInput });
                        } else {
                          Alert.alert(
                            "Invalid Color",
                            "Please enter a valid hex color (e.g., #FFFFFF)"
                          );
                        }
                      }}
                      style={styles.applyButton}
                    >
                      Apply
                    </Button>
                  </View>
                  <View
                    style={[
                      styles.colorPreview,
                      { backgroundColor: settings.backgroundColor },
                    ]}
                  >
                    <Text
                      style={[styles.colorHex, { color: settings.textColor }]}
                    >
                      {settings.backgroundColor}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.settingSection}>
                <Text variant="titleMedium" style={styles.settingLabel}>
                  Text Color
                </Text>
                <View style={styles.colorPickerContainer}>
                  <View style={styles.colorGrid}>
                    {commonColors.map((color) => (
                      <TouchableOpacity
                        key={`text-${color}`}
                        style={[
                          styles.colorButton,
                          { backgroundColor: color },
                          settings.textColor === color && styles.selectedColor,
                        ]}
                        onPress={() => {
                          setTextColorInput(color);
                          updateSettings({ textColor: color });
                        }}
                      />
                    ))}
                  </View>
                  <View style={styles.colorInputRow}>
                    <TextInput
                      style={styles.colorInput}
                      value={textColorInput}
                      onChangeText={setTextColorInput}
                      placeholder="#000000"
                      placeholderTextColor="#999"
                      autoCapitalize="none"
                    />
                    <Button
                      mode="contained"
                      onPress={() => {
                        if (/^#[0-9A-F]{6}$/i.test(textColorInput)) {
                          updateSettings({ textColor: textColorInput });
                        } else {
                          Alert.alert(
                            "Invalid Color",
                            "Please enter a valid hex color (e.g., #000000)"
                          );
                        }
                      }}
                      style={styles.applyButton}
                    >
                      Apply
                    </Button>
                  </View>
                  <View
                    style={[
                      styles.colorPreview,
                      { backgroundColor: settings.textColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.colorHex,
                        { color: settings.backgroundColor },
                      ]}
                    >
                      {settings.textColor}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  readerContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 24,
    fontSize: 16,
    opacity: 0.8,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    margin: 0,
  },
  topBarTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: "center",
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 8,
  },
  modalTitle: {
    fontWeight: "bold",
  },
  modalScroll: {
    padding: 16,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    marginBottom: 12,
    fontWeight: "600",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    flex: 1,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  themeCard: {
    width: "47%",
    aspectRatio: 1.5,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  themeText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: "600",
  },
  colorPickerContainer: {
    gap: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#CCCCCC",
  },
  selectedColor: {
    borderColor: "#2196F3",
    borderWidth: 3,
  },
  colorInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  colorInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  applyButton: {
    height: 48,
    justifyContent: "center",
  },
  colorPreview: {
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  colorHex: {
    fontSize: 16,
    fontWeight: "600",
  },
});
