import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, FlatList, Alert } from "react-native";
import {
  Text,
  FAB,
  Searchbar,
  useTheme,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Book, BookFormat } from "../src/types";
import { getBooks, saveBook, deleteBook } from "../src/lib/storage";
import { BookCard } from "../src/components";
import { useAppSettings } from "../src/context";

export default function LibraryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { settings: appSettings } = useAppSettings();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const isDark = appSettings.themeMode === "dark";

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, books]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const loadedBooks = await getBooks();
      const sortedBooks = loadedBooks.sort((a, b) => {
        if (a.lastOpened && b.lastOpened) {
          return b.lastOpened - a.lastOpened;
        }
        if (a.lastOpened) return -1;
        if (b.lastOpened) return 1;
        return b.dateAdded - a.dateAdded;
      });
      setBooks(sortedBooks);
    } catch (error) {
      console.error("Error loading books:", error);
      Alert.alert("Error", "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
    setFilteredBooks(filtered);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      const fileName = file.name;
      const fileUri = file.uri;

      const extension = fileName.split(".").pop()?.toLowerCase();
      let format: BookFormat;

      if (extension === "txt") {
        format = "txt";
      } else if (extension === "fb2") {
        format = "fb2";
      } else if (extension === "epub") {
        format = "epub";
      } else {
        Alert.alert(
          "Unsupported Format",
          "Please select a TXT, FB2, or EPUB file"
        );
        return;
      }

      const bookId = Date.now().toString();
      const newFileName = `${bookId}.${extension}`;
      const destinationUri = `${FileSystem.documentDirectory}${newFileName}`;

      await FileSystem.copyAsync({
        from: fileUri,
        to: destinationUri,
      });

      const title = fileName.replace(/\.(txt|fb2|epub)$/i, "");
      const newBook: Book = {
        id: bookId,
        title,
        author: "Unknown",
        format,
        filePath: destinationUri,
        dateAdded: Date.now(),
        progress: 0,
        currentPosition: 0,
        totalLength: 0,
      };

      await saveBook(newBook);
      await loadBooks();

      Alert.alert("Success", `"${title}" has been added to your library`);
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to add book");
    }
  };

  const handleBookPress = (book: Book) => {
    router.push(`/reader/${book.id}`);
  };

  const handleBookLongPress = (book: Book) => {
    Alert.alert(
      "Delete Book",
      `Are you sure you want to delete "${book.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBook(book.id);
              if (book.filePath) {
                await FileSystem.deleteAsync(book.filePath, {
                  idempotent: true,
                });
              }
              await loadBooks();
            } catch (error) {
              console.error("Error deleting book:", error);
              Alert.alert("Error", "Failed to delete book");
            }
          },
        },
      ]
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Books Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Tap the + button to add your first book
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="cog"
            size={28}
            onPress={() => router.push("/settings")}
            style={styles.settingsButton}
          />
          <Text variant="headlineMedium" style={styles.headerTitle}>
            My Library
          </Text>
          <View style={styles.placeholder} />
        </View>
        <Searchbar
          placeholder="Search books..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => handleBookPress(item)}
            onLongPress={() => handleBookLongPress(item)}
            colorScheme={appSettings.libraryColorScheme}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          books.length === 0 ? styles.emptyList : undefined
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={pickDocument}
        label="Add Book"
        variant="primary"
      />
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
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  settingsButton: {
    margin: 0,
  },
  headerTitle: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 48,
  },
  searchBar: {
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
