export type BookFormat = "epub" | "fb2" | "txt";

export interface Book {
  id: string;
  title: string;
  author: string;
  format: BookFormat;
  filePath: string;
  coverUri?: string;
  dateAdded: number;
  lastOpened?: number;
  progress: number;
  currentPosition: number;
  totalLength: number;
}

export interface BookMetadata {
  title: string;
  author: string;
  language?: string;
  publisher?: string;
  publishDate?: string;
  description?: string;
}

export interface Chapter {
  id: string;
  title: string;
  startPosition: number;
  endPosition: number;
}

export interface BookContent {
  text: string;
  chapters: Chapter[];
  metadata: BookMetadata;
}

export interface ReadingProgress {
  bookId: string;
  currentPosition: number;
  progress: number;
  lastUpdated: number;
}

