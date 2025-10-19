import * as FileSystem from "expo-file-system/legacy";
import { BookContent, BookMetadata, Chapter } from "../../types";

export async function parseTxtFile(filePath: string): Promise<BookContent> {
  try {
    const content = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const fileName = filePath.split("/").pop() || "Unknown";
    const title = fileName.replace(/\.(txt|TXT)$/, "");

    const metadata: BookMetadata = {
      title,
      author: "Unknown",
    };

    const chapters = detectChapters(content);

    return {
      text: content,
      chapters,
      metadata,
    };
  } catch (error) {
    console.error("Error parsing TXT file:", error);
    throw new Error("Failed to parse TXT file");
  }
}

function detectChapters(text: string): Chapter[] {
  const chapters: Chapter[] = [];
  const chapterRegex =
    /^(Chapter|CHAPTER|Глава)\s+(\d+|[IVXLCDM]+)[:\s\-]*(.*?)$/gim;

  let match;
  let chapterIndex = 0;

  while ((match = chapterRegex.exec(text)) !== null) {
    const title = match[0].trim();
    const startPosition = match.index;

    if (chapters.length > 0) {
      chapters[chapters.length - 1].endPosition = startPosition;
    }

    chapters.push({
      id: `chapter-${chapterIndex}`,
      title,
      startPosition,
      endPosition: text.length,
    });

    chapterIndex++;
  }

  if (chapters.length === 0) {
    chapters.push({
      id: "chapter-0",
      title: "Full Text",
      startPosition: 0,
      endPosition: text.length,
    });
  }

  return chapters;
}
