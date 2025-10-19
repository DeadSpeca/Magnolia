export enum FontFamily {
  SYSTEM = "System",
  SERIF = "serif",
  SANS_SERIF = "sans-serif",
  MONOSPACE = "monospace",
}

export enum TextAlign {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
  JUSTIFY = "justify",
}

export enum ReadingMode {
  VERTICAL_SCROLL = "vertical",
  PAGINATED = "paginated",
}

export interface ReaderTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
}

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: FontFamily;
  textAlign: TextAlign;
  readingMode: ReadingMode;
  theme: ReaderTheme;
  backgroundColor: string;
  textColor: string;
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.6,
  fontFamily: FontFamily.SYSTEM,
  textAlign: TextAlign.LEFT,
  readingMode: ReadingMode.VERTICAL_SCROLL,
  theme: {
    id: "light",
    name: "Light",
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
  },
  backgroundColor: "#FFFFFF",
  textColor: "#000000",
};

export const READER_THEMES: ReaderTheme[] = [
  {
    id: "light",
    name: "Light",
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
  },
  {
    id: "sepia",
    name: "Sepia",
    backgroundColor: "#F4ECD8",
    textColor: "#5B4636",
  },
  {
    id: "dark",
    name: "Dark",
    backgroundColor: "#1E1E1E",
    textColor: "#E0E0E0",
  },
  {
    id: "black",
    name: "Black",
    backgroundColor: "#000000",
    textColor: "#FFFFFF",
  },
];
