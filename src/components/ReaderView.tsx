import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { ReadingMode, ReaderSettings, BookMetadata } from "../types";

interface ReaderViewProps {
  content: string;
  settings: ReaderSettings;
  initialPosition: number;
  onPositionChange: (position: number) => void;
  bookMetadata?: BookMetadata;
}

export function ReaderView({
  content,
  settings,
  initialPosition,
  onPositionChange,
  bookMetadata,
}: ReaderViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);
  const hasScrolledToInitial = useRef(false);

  useEffect(() => {
    if (settings.readingMode === ReadingMode.PAGINATED) {
      const paginatedPages = getPages(content, settings);
      setPages(paginatedPages);

      const initialPage = Math.floor(
        (initialPosition / content.length) * paginatedPages.length
      );
      setCurrentPage(initialPage);
    } else {
      // For scroll mode, scroll to initial position after content is rendered
      if (
        !hasScrolledToInitial.current &&
        scrollViewRef.current &&
        initialPosition > 0
      ) {
        setTimeout(() => {
          const scrollPercentage = initialPosition / content.length;
          const contentHeight = content.length * 0.5; // Approximate content height
          scrollViewRef.current?.scrollTo({
            y: contentHeight * scrollPercentage,
            animated: false,
          });
          hasScrolledToInitial.current = true;
        }, 100);
      }
    }
  }, [content, settings.readingMode, settings.fontSize, settings.lineHeight]);

  const getPages = (text: string, settings: ReaderSettings): string[] => {
    const screenHeight = Dimensions.get("window").height;
    const screenWidth = Dimensions.get("window").width;

    const lineHeight = settings.fontSize * settings.lineHeight;
    const padding = 48;
    const availableHeight = screenHeight - padding * 2;
    const availableWidth = screenWidth - padding * 2;

    const charsPerLine = Math.floor(availableWidth / (settings.fontSize * 0.6));
    const linesPerPage = Math.floor(availableHeight / lineHeight);
    const charsPerPage = charsPerLine * linesPerPage;

    const pages: string[] = [];
    let currentPos = 0;

    while (currentPos < text.length) {
      let endPos = currentPos + charsPerPage;

      if (endPos < text.length) {
        const nextSpace = text.indexOf(" ", endPos);
        const nextNewline = text.indexOf("\n", endPos);

        if (nextSpace !== -1 && nextSpace < endPos + 100) {
          endPos = nextSpace;
        } else if (nextNewline !== -1 && nextNewline < endPos + 100) {
          endPos = nextNewline;
        }
      } else {
        endPos = text.length;
      }

      pages.push(text.substring(currentPos, endPos));
      currentPos = endPos;
    }

    return pages;
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // Prevent division by zero and ensure valid position calculation
    if (contentSize.height > 0) {
      const scrollPercentage =
        contentOffset.y / (contentSize.height - layoutMeasurement.height);
      const clampedPercentage = Math.max(0, Math.min(1, scrollPercentage));
      const position = Math.floor(clampedPercentage * content.length);
      onPositionChange(position);
    }
  };

  const handlePageChange = (index: number) => {
    setCurrentPage(index);
    const position = Math.floor((index / pages.length) * content.length);
    onPositionChange(position);
  };

  // Function to parse and render formatted text
  const renderFormattedText = (text: string, textStyle: any) => {
    // Match **bold**, *italic*, ***bold italic***
    const parts: Array<{ text: string; bold: boolean; italic: boolean }> = [];
    let currentIndex = 0;

    // Regex to match formatting: ***text*** or **text** or *text*
    const formatRegex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let match;

    while ((match = formatRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push({
          text: text.substring(currentIndex, match.index),
          bold: false,
          italic: false,
        });
      }

      const matchedText = match[0];
      if (matchedText.startsWith("***") && matchedText.endsWith("***")) {
        // Bold and italic
        parts.push({
          text: matchedText.slice(3, -3),
          bold: true,
          italic: true,
        });
      } else if (matchedText.startsWith("**") && matchedText.endsWith("**")) {
        // Bold
        parts.push({
          text: matchedText.slice(2, -2),
          bold: true,
          italic: false,
        });
      } else if (matchedText.startsWith("*") && matchedText.endsWith("*")) {
        // Italic
        parts.push({
          text: matchedText.slice(1, -1),
          bold: false,
          italic: true,
        });
      }

      currentIndex = match.index + matchedText.length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push({
        text: text.substring(currentIndex),
        bold: false,
        italic: false,
      });
    }

    // If no formatting found, return plain text
    if (parts.length === 0) {
      return <Text style={textStyle}>{text}</Text>;
    }

    return (
      <Text style={textStyle}>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={{
              fontWeight: part.bold ? "bold" : "normal",
              fontStyle: part.italic ? "italic" : "normal",
            }}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  };

  const renderBookTitle = () => {
    if (!bookMetadata) return null;

    return (
      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.bookTitle,
            {
              color: settings.textColor,
              fontSize: settings.fontSize * 2,
            },
          ]}
        >
          {bookMetadata.title}
        </Text>
        {bookMetadata.author && bookMetadata.author !== "Unknown" && (
          <Text
            style={[
              styles.bookAuthor,
              {
                color: settings.textColor,
                fontSize: settings.fontSize * 1.2,
              },
            ]}
          >
            by {bookMetadata.author}
          </Text>
        )}
        {bookMetadata.description && (
          <Text
            style={[
              styles.bookDescription,
              {
                color: settings.textColor,
                fontSize: settings.fontSize * 0.9,
                opacity: 0.8,
              },
            ]}
          >
            {bookMetadata.description}
          </Text>
        )}
        <View
          style={[styles.divider, { backgroundColor: settings.textColor }]}
        />
      </View>
    );
  };

  const textStyle = {
    fontSize: settings.fontSize,
    lineHeight: settings.fontSize * settings.lineHeight,
    fontFamily: settings.fontFamily,
    textAlign: settings.textAlign,
    color: settings.textColor,
  };

  const containerStyle = {
    backgroundColor: settings.backgroundColor,
  };

  if (settings.readingMode === ReadingMode.PAGINATED) {
    return (
      <View style={[styles.container, containerStyle]}>
        <FlatList
          ref={flatListRef}
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => `page-${index}`}
          initialScrollIndex={currentPage}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / Dimensions.get("window").width
            );
            handlePageChange(index);
          }}
          renderItem={({ item }) => (
            <View
              style={[styles.page, { width: Dimensions.get("window").width }]}
            >
              <Text style={[styles.text, textStyle]}>{item}</Text>
            </View>
          )}
          getItemLayout={(_, index) => ({
            length: Dimensions.get("window").width,
            offset: Dimensions.get("window").width * index,
            index,
          })}
        />
        <View style={styles.pageIndicator}>
          <Text style={[styles.pageNumber, { color: settings.textColor }]}>
            {currentPage + 1} / {pages.length}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, containerStyle]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      removeClippedSubviews={false}
      nestedScrollEnabled={true}
    >
      <View style={styles.textContainer}>
        {renderBookTitle()}
        {renderFormattedText(content, [styles.text, textStyle])}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  textContainer: {
    padding: 24,
  },
  text: {
    flexWrap: "wrap",
  },
  page: {
    padding: 24,
    justifyContent: "flex-start",
  },
  pageIndicator: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pageNumber: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  titleContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  bookTitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  bookAuthor: {
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.9,
  },
  bookDescription: {
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  divider: {
    width: 100,
    height: 2,
    marginTop: 8,
    opacity: 0.3,
  },
});
