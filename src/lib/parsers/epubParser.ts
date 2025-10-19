import * as FileSystem from "expo-file-system/legacy";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { BookContent, BookMetadata, Chapter } from "../../types";

export async function parseEpubFile(filePath: string): Promise<BookContent> {
  try {
    // Read the EPUB file as base64
    const base64Content = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Load the ZIP file
    const zip = await JSZip.loadAsync(base64Content, { base64: true });

    // Parse container.xml to find the OPF file
    const containerXml = await zip
      .file("META-INF/container.xml")
      ?.async("string");
    if (!containerXml) {
      throw new Error("Invalid EPUB: container.xml not found");
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });

    const containerData = parser.parse(containerXml);
    const opfPath =
      containerData.container?.rootfiles?.rootfile?.["@_full-path"];

    if (!opfPath) {
      throw new Error("Invalid EPUB: OPF path not found");
    }

    // Parse the OPF file
    const opfContent = await zip.file(opfPath)?.async("string");
    if (!opfContent) {
      throw new Error("Invalid EPUB: OPF file not found");
    }

    const opfData = parser.parse(opfContent);
    const packageData = opfData.package;

    // Extract metadata
    const metadata = extractMetadata(packageData);

    // Extract content
    const { text, chapters } = await extractContent(zip, packageData, opfPath);

    return {
      text,
      chapters,
      metadata,
    };
  } catch (error) {
    console.error("Error parsing EPUB file:", error);

    // Fallback to basic metadata
    const fileName = filePath.split("/").pop() || "Unknown";
    const title = fileName.replace(/\.(epub|EPUB)$/, "");

    return {
      text: "Failed to parse EPUB file. The file may be corrupted or in an unsupported format.",
      chapters: [
        {
          id: "chapter-0",
          title: "Error",
          startPosition: 0,
          endPosition: 100,
        },
      ],
      metadata: {
        title,
        author: "Unknown",
      },
    };
  }
}

function extractMetadata(packageData: any): BookMetadata {
  const metadata = packageData.metadata || {};

  const title = metadata["dc:title"] || "Unknown";
  const creator = metadata["dc:creator"] || "Unknown";
  const author =
    typeof creator === "string" ? creator : creator?.["#text"] || "Unknown";
  const language = metadata["dc:language"] || undefined;
  const publisher = metadata["dc:publisher"] || undefined;
  const date = metadata["dc:date"] || undefined;
  const description = metadata["dc:description"] || undefined;

  return {
    title,
    author,
    language,
    publisher,
    publishDate: date,
    description,
  };
}

async function extractContent(
  zip: JSZip,
  packageData: any,
  opfPath: string
): Promise<{ text: string; chapters: Chapter[] }> {
  try {
    const manifest = packageData.manifest?.item || [];
    const spine = packageData.spine?.itemref || [];

    const manifestItems = Array.isArray(manifest) ? manifest : [manifest];
    const spineItems = Array.isArray(spine) ? spine : [spine];

    // Get the directory of the OPF file
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);

    let fullText = "";
    const chapters: Chapter[] = [];
    let chapterIndex = 0;

    // Process spine items in order
    for (const spineItem of spineItems) {
      const idref = spineItem["@_idref"];
      const manifestItem = manifestItems.find(
        (item: any) => item["@_id"] === idref
      );

      if (!manifestItem) continue;

      const href = manifestItem["@_href"];
      const filePath = opfDir + href;

      try {
        const fileContent = await zip.file(filePath)?.async("string");
        if (!fileContent) continue;

        // Extract text from HTML/XHTML
        const text = extractTextFromHtml(fileContent);

        if (text.trim().length > 0) {
          const startPosition = fullText.length;
          fullText += text + "\n\n";
          const endPosition = fullText.length;

          chapters.push({
            id: `chapter-${chapterIndex}`,
            title: `Chapter ${chapterIndex + 1}`,
            startPosition,
            endPosition,
          });

          chapterIndex++;
        }
      } catch (error) {
        console.warn(`Failed to read file ${filePath}:`, error);
      }
    }

    return { text: fullText, chapters };
  } catch (error) {
    console.error("Error extracting EPUB content:", error);
    return {
      text: "Failed to extract content from EPUB file.",
      chapters: [],
    };
  }
}

function extractTextFromHtml(html: string): string {
  // Remove script and style tags
  let text = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\s+/g, " ");
  text = text.replace(/\n\s*\n/g, "\n\n");
  text = text.trim();

  return text;
}
