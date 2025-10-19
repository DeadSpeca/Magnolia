import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book, ReadingProgress, ReaderSettings, DEFAULT_READER_SETTINGS } from "../types";

const BOOKS_KEY = "@reader_books";
const SETTINGS_KEY = "@reader_settings";
const PROGRESS_KEY_PREFIX = "@reader_progress_";

// Book operations
export async function saveBook(book: Book): Promise<void> {
  try {
    const books = await getBooks();
    const existingIndex = books.findIndex((b) => b.id === book.id);
    
    if (existingIndex >= 0) {
      books[existingIndex] = book;
    } else {
      books.push(book);
    }
    
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  } catch (error) {
    console.error("Error saving book:", error);
    throw error;
  }
}

export async function getBooks(): Promise<Book[]> {
  try {
    const booksJson = await AsyncStorage.getItem(BOOKS_KEY);
    return booksJson ? JSON.parse(booksJson) : [];
  } catch (error) {
    console.error("Error getting books:", error);
    return [];
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const books = await getBooks();
    return books.find((book) => book.id === id) || null;
  } catch (error) {
    console.error("Error getting book by id:", error);
    return null;
  }
}

export async function deleteBook(id: string): Promise<void> {
  try {
    const books = await getBooks();
    const filteredBooks = books.filter((book) => book.id !== id);
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(filteredBooks));
    await AsyncStorage.removeItem(`${PROGRESS_KEY_PREFIX}${id}`);
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
}

export async function updateBookProgress(
  bookId: string,
  currentPosition: number,
  totalLength: number
): Promise<void> {
  try {
    const progress = totalLength > 0 ? (currentPosition / totalLength) * 100 : 0;
    const readingProgress: ReadingProgress = {
      bookId,
      currentPosition,
      progress,
      lastUpdated: Date.now(),
    };
    
    await AsyncStorage.setItem(
      `${PROGRESS_KEY_PREFIX}${bookId}`,
      JSON.stringify(readingProgress)
    );
    
    const books = await getBooks();
    const bookIndex = books.findIndex((b) => b.id === bookId);
    if (bookIndex >= 0) {
      books[bookIndex].progress = progress;
      books[bookIndex].currentPosition = currentPosition;
      books[bookIndex].lastOpened = Date.now();
      await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    }
  } catch (error) {
    console.error("Error updating book progress:", error);
    throw error;
  }
}

// Settings operations
export async function saveReaderSettings(settings: ReaderSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving reader settings:", error);
    throw error;
  }
}

export async function getReaderSettings(): Promise<ReaderSettings> {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
    return settingsJson ? JSON.parse(settingsJson) : DEFAULT_READER_SETTINGS;
  } catch (error) {
    console.error("Error getting reader settings:", error);
    return DEFAULT_READER_SETTINGS;
  }
}

// Clear all data
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing all data:", error);
    throw error;
  }
}

