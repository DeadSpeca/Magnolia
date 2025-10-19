import { BookFormat, BookContent } from "../../types";
import { parseTxtFile } from "./txtParser";
import { parseFb2File } from "./fb2Parser";
import { parseEpubFile } from "./epubParser";

export async function parseBookFile(
  filePath: string,
  format: BookFormat
): Promise<BookContent> {
  switch (format) {
    case "txt":
      return parseTxtFile(filePath);
    case "fb2":
      return parseFb2File(filePath);
    case "epub":
      return parseEpubFile(filePath);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

export * from "./txtParser";
export * from "./fb2Parser";
export * from "./epubParser";

