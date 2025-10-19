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
import { ReadingMode, ReaderSettings } from "../types";

interface ReaderViewProps {
  content: string;
  settings: ReaderSettings;
  initialPosition: number;
  onPositionChange: (position: number) => void;
}

export function ReaderView({
  content,
  settings,
  initialPosition,
  onPositionChange,
}: ReaderViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (settings.readingMode === ReadingMode.PAGINATED) {
      const paginatedPages = getPages(content, settings);
      setPages(paginatedPages);

      const initialPage = Math.floor(
        (initialPosition / content.length) * paginatedPages.length
      );
      setCurrentPage(initialPage);
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

    const position = Math.floor(
      (contentOffset.y / contentSize.height) * content.length
    );

    onPositionChange(position);
  };

  const handlePageChange = (index: number) => {
    setCurrentPage(index);
    const position = Math.floor((index / pages.length) * content.length);
    onPositionChange(position);
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
      scrollEventThrottle={400}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.text, textStyle]}>{content}</Text>
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
});
