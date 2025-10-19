import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, ProgressBar, useTheme } from "react-native-paper";
import { Book } from "../types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface BookCardProps {
  book: Book;
  onPress: () => void;
  onLongPress?: () => void;
  colorScheme?: "color" | "monochrome";
}

export function BookCard({
  book,
  onPress,
  onLongPress,
  colorScheme = "color",
}: BookCardProps) {
  const theme = useTheme();

  const getFormatIcon = () => {
    switch (book.format) {
      case "epub":
        return "book-open-page-variant";
      case "fb2":
        return "book-open";
      case "txt":
        return "text-box";
      default:
        return "file";
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <Card style={styles.card} onPress={onPress} onLongPress={onLongPress}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name={getFormatIcon() as any}
            size={24}
            color={theme.colors.primary}
            style={styles.icon}
          />
          <View style={styles.headerText}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
              {book.title}
            </Text>
            <Text variant="bodySmall" numberOfLines={1} style={styles.author}>
              {book.author}
            </Text>
          </View>
        </View>

        {book.progress > 0 && (
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={book.progress / 100}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.progressText}>
              {Math.round(book.progress)}%
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.format}>
            {book.format.toUpperCase()}
          </Text>
          <Text variant="bodySmall" style={styles.date}>
            {book.lastOpened
              ? `Opened: ${formatDate(book.lastOpened)}`
              : `Added: ${formatDate(book.dateAdded)}`}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
  },
  author: {
    opacity: 0.7,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    marginLeft: 8,
    minWidth: 40,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  format: {
    opacity: 0.6,
    fontWeight: "600",
  },
  date: {
    opacity: 0.6,
  },
});
