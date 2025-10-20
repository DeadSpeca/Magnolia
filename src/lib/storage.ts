import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Book,
  ReadingProgress,
  ReaderSettings,
  DEFAULT_READER_SETTINGS,
  BookContent,
} from "../types";

const BOOKS_KEY = "@reader_books";
const SETTINGS_KEY = "@reader_settings";
const PROGRESS_KEY_PREFIX = "@reader_progress_";

// In-memory cache for book content ONLY (no AsyncStorage cache - too big!)
const contentCache = new Map<string, BookContent>();

// Track pending save operations to debounce
let progressSaveTimeout: NodeJS.Timeout | null = null;

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
    // Clear cached content when book is deleted
    await clearContentCache(id);
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
}

// Debounced progress update - saves after 2 seconds of inactivity
export async function updateBookProgress(
  bookId: string,
  currentPosition: number,
  totalLength: number,
  immediate: boolean = false
): Promise<void> {
  const saveProgress = async () => {
    try {
      const progress =
        totalLength > 0 ? (currentPosition / totalLength) * 100 : 0;
      const readingProgress: ReadingProgress = {
        bookId,
        currentPosition,
        progress,
        lastUpdated: Date.now(),
      };

      // Save progress data
      await AsyncStorage.setItem(
        `${PROGRESS_KEY_PREFIX}${bookId}`,
        JSON.stringify(readingProgress)
      );

      // Update book metadata
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
      // Don't throw - silent failure for auto-saves
    }
  };

  // If immediate save (e.g., on close), save right away
  if (immediate) {
    if (progressSaveTimeout) {
      clearTimeout(progressSaveTimeout);
      progressSaveTimeout = null;
    }
    await saveProgress();
    return;
  }

  // Otherwise, debounce the save (wait for user to stop scrolling)
  if (progressSaveTimeout) {
    clearTimeout(progressSaveTimeout);
  }

  progressSaveTimeout = setTimeout(async () => {
    await saveProgress();
    progressSaveTimeout = null;
  }, 2000); // Save 2 seconds after user stops scrolling
}

// Settings operations
export async function saveReaderSettings(
  settings: ReaderSettings
): Promise<void> {
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

// Book content caching - IN MEMORY ONLY (no disk storage - books are too large!)
export function getCachedBookContent(bookId: string): BookContent | null {
  // Only check in-memory cache (instant and unlimited size)
  return contentCache.get(bookId) || null;
}

export function setCachedBookContent(
  bookId: string,
  content: BookContent
): void {
  // Only store in memory cache (fast and no disk space issues)
  contentCache.set(bookId, content);
}

export function clearContentCache(bookId?: string): void {
  if (bookId) {
    // Clear specific book cache
    contentCache.delete(bookId);
  } else {
    // Clear all content caches
    contentCache.clear();
  }
}

// Clear all data
export async function clearAllData(): Promise<void> {
  try {
    contentCache.clear();
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing all data:", error);
    throw error;
  }
}
