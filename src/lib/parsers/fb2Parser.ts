import * as FileSystem from "expo-file-system/legacy";
import { XMLParser } from "fast-xml-parser";
import { BookContent, BookMetadata, Chapter } from "../../types";

export async function parseFb2File(filePath: string): Promise<BookContent> {
  try {
    const xmlContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseTagValue: false,
    });

    const result = parser.parse(xmlContent);
    const fb2 = result.FictionBook || result.fictionBook;

    if (!fb2) {
      throw new Error("Invalid FB2 format");
    }

    const metadata = extractMetadata(fb2);
    const { text, chapters } = extractContent(fb2);

    return {
      text,
      chapters,
      metadata,
    };
  } catch (error) {
    console.error("Error parsing FB2 file:", error);
    throw new Error("Failed to parse FB2 file");
  }
}

function extractMetadata(fb2: any): BookMetadata {
  const description = fb2.description || {};
  const titleInfo = description["title-info"] || {};

  const title = titleInfo["book-title"] || "Unknown";
  const author = extractAuthor(titleInfo.author);
  const language = titleInfo.lang || undefined;

  const publishInfo = description["publish-info"] || {};
  const publisher = publishInfo.publisher || undefined;
  const publishDate = publishInfo.year || undefined;

  return {
    title,
    author,
    language,
    publisher,
    publishDate,
  };
}

function extractAuthor(authorData: any): string {
  if (!authorData) return "Unknown";

  if (Array.isArray(authorData)) {
    authorData = authorData[0];
  }

  const firstName = authorData["first-name"] || "";
  const middleName = authorData["middle-name"] || "";
  const lastName = authorData["last-name"] || "";

  return (
    [firstName, middleName, lastName].filter(Boolean).join(" ") || "Unknown"
  );
}

function extractContent(fb2: any): { text: string; chapters: Chapter[] } {
  const body = fb2.body;
  if (!body) {
    return { text: "", chapters: [] };
  }

  const sections = Array.isArray(body) ? body[0].section : body.section;
  if (!sections) {
    return { text: "", chapters: [] };
  }

  const sectionArray = Array.isArray(sections) ? sections : [sections];
  const chapters: Chapter[] = [];
  let fullText = "";
  let currentPosition = 0;

  sectionArray.forEach((section: any, index: number) => {
    const title = extractSectionTitle(section) || `Chapter ${index + 1}`;
    const sectionText = extractSectionText(section);

    chapters.push({
      id: `chapter-${index}`,
      title,
      startPosition: currentPosition,
      endPosition: currentPosition + sectionText.length,
    });

    fullText += sectionText + "\n\n";
    currentPosition = fullText.length;
  });

  return { text: fullText, chapters };
}

function extractSectionTitle(section: any): string {
  if (section.title) {
    const titleData = section.title;
    if (titleData.p) {
      return Array.isArray(titleData.p) ? titleData.p[0] : titleData.p;
    }
    if (typeof titleData === "string") {
      return titleData;
    }
  }
  return "";
}

function extractSectionText(section: any): string {
  let text = "";

  if (section.p) {
    const paragraphs = Array.isArray(section.p) ? section.p : [section.p];
    paragraphs.forEach((p: any) => {
      const paragraphText = typeof p === "string" ? p : p["#text"] || "";
      text += paragraphText + "\n\n";
    });
  }

  if (section.section) {
    const subsections = Array.isArray(section.section)
      ? section.section
      : [section.section];
    subsections.forEach((subsection: any) => {
      text += extractSectionText(subsection);
    });
  }

  return text;
}
