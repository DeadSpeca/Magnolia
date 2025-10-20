import * as FileSystem from "expo-file-system/legacy";
import { BookFormat, BookContent, BookMetadata } from "../../types";

// Size of chunk to load initially (characters)
const INITIAL_CHUNK_SIZE = 50000; // ~50KB of text, enough for several pages
const CHUNK_PADDING = 5000; // Extra padding before/after to ensure smooth scrolling

export interface ChunkedBookContent extends BookContent {
  isPartial: boolean;
  loadedStart: number;
  loadedEnd: number;
}

/**
 * Load a chunk of the book around a specific position for fast initial rendering
 */
export async function loadBookChunk(
  filePath: string,
  format: BookFormat,
  position: number = 0
): Promise<ChunkedBookContent> {
  try {
    // For now, only implement chunked loading for TXT files
    // EPUB and FB2 are already compressed and need full parsing
    if (format !== "txt") {
      // For non-txt files, we'll need to load the full content
      // Return null to indicate full loading is needed
      throw new Error("Chunked loading only supported for TXT files");
    }

    // Get file info to determine size
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      throw new Error("File not found");
    }

    const fileSize = fileInfo.size || 0;

    // If file is small enough, just load it all
    if (fileSize < INITIAL_CHUNK_SIZE * 2) {
      const fullContent = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const fileName = filePath.split("/").pop() || "Unknown";
      const title = fileName.replace(/\.(txt|TXT)$/, "");

      return {
        text: fullContent,
        chapters: [],
        metadata: {
          title,
          author: "Unknown",
        },
        isPartial: false,
        loadedStart: 0,
        loadedEnd: fullContent.length,
      };
    }

    // Calculate chunk boundaries
    const chunkStart = Math.max(0, position - CHUNK_PADDING);
    const chunkEnd = Math.min(fileSize, position + INITIAL_CHUNK_SIZE + CHUNK_PADDING);

    // Read the full file (we need to do this for UTF-8 encoding)
    // Note: FileSystem doesn't support partial reads with proper UTF-8 handling
    // So we read the full file but will optimize this differently
    const fullContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Extract the chunk
    const actualChunkStart = Math.max(0, position - CHUNK_PADDING);
    const actualChunkEnd = Math.min(
      fullContent.length,
      position + INITIAL_CHUNK_SIZE + CHUNK_PADDING
    );

    // Find word boundaries to avoid cutting words
    let adjustedStart = actualChunkStart;
    let adjustedEnd = actualChunkEnd;

    // Adjust start to word boundary
    if (adjustedStart > 0) {
      while (adjustedStart > 0 && !/\s/.test(fullContent[adjustedStart])) {
        adjustedStart--;
      }
    }

    // Adjust end to word boundary
    if (adjustedEnd < fullContent.length) {
      while (adjustedEnd < fullContent.length && !/\s/.test(fullContent[adjustedEnd])) {
        adjustedEnd++;
      }
    }

    const chunkText = fullContent.substring(adjustedStart, adjustedEnd);

    const fileName = filePath.split("/").pop() || "Unknown";
    const title = fileName.replace(/\.(txt|TXT)$/, "");

    return {
      text: chunkText,
      chapters: [],
      metadata: {
        title,
        author: "Unknown",
      },
      isPartial: true,
      loadedStart: adjustedStart,
      loadedEnd: adjustedEnd,
    };
  } catch (error) {
    console.error("Error loading book chunk:", error);
    throw error;
  }
}

/**
 * Load the full book content
 */
export async function loadFullBook(
  filePath: string,
  format: BookFormat
): Promise<BookContent> {
  // This will use the existing parsers
  const { parseBookFile } = await import("./index");
  return parseBookFile(filePath, format);
}

/**
 * Check if we should use chunked loading for this book
 */
export function shouldUseChunkedLoading(
  format: BookFormat,
  fileSize?: number
): boolean {
  // Only use chunked loading for TXT files larger than threshold
  if (format !== "txt") {
    return false;
  }

  if (fileSize && fileSize < INITIAL_CHUNK_SIZE * 2) {
    return false;
  }

  return true;
}

