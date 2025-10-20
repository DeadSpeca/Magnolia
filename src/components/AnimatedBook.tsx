import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface AnimatedBookProps {
  size?: number;
  color?: string;
}

export function AnimatedBook({
  size = 80,
  color = "#6200ee",
}: AnimatedBookProps) {
  const pageFlip = useRef(new Animated.Value(0)).current;
  const bookScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const flipAnimation = Animated.loop(
      Animated.sequence([
        // Page flipping animation
        Animated.timing(pageFlip, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pageFlip, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        // Breathing animation
        Animated.timing(bookScale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bookScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    flipAnimation.start();
    scaleAnimation.start();

    return () => {
      flipAnimation.stop();
      scaleAnimation.stop();
    };
  }, [pageFlip, bookScale]);

  const leftPageRotate = pageFlip.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-180deg"],
  });

  const rightPageRotate = pageFlip.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const leftPageOpacity = pageFlip.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 1],
  });

  const rightPageOpacity = pageFlip.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ scale: bookScale }],
        },
      ]}
    >
      {/* Book spine */}
      <View
        style={[
          styles.spine,
          {
            width: size * 0.1,
            height: size * 0.8,
            backgroundColor: color,
          },
        ]}
      />

      {/* Left page */}
      <Animated.View
        style={[
          styles.page,
          styles.leftPage,
          {
            width: size * 0.4,
            height: size * 0.8,
            backgroundColor: "#ffffff",
            borderColor: color,
            transform: [{ perspective: 1000 }, { rotateY: leftPageRotate }],
            opacity: leftPageOpacity,
          },
        ]}
      >
        <View style={[styles.pageLines, { borderColor: color }]} />
        <View style={[styles.pageLines, { borderColor: color, top: 12 }]} />
        <View style={[styles.pageLines, { borderColor: color, top: 24 }]} />
      </Animated.View>

      {/* Right page */}
      <Animated.View
        style={[
          styles.page,
          styles.rightPage,
          {
            width: size * 0.4,
            height: size * 0.8,
            backgroundColor: "#ffffff",
            borderColor: color,
            transform: [{ perspective: 1000 }, { rotateY: rightPageRotate }],
            opacity: rightPageOpacity,
          },
        ]}
      >
        <View style={[styles.pageLines, { borderColor: color }]} />
        <View style={[styles.pageLines, { borderColor: color, top: 12 }]} />
        <View style={[styles.pageLines, { borderColor: color, top: 24 }]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  spine: {
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  page: {
    borderWidth: 2,
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  leftPage: {
    marginRight: -2,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  rightPage: {
    marginLeft: -2,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  pageLines: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 8,
    height: 2,
    borderTopWidth: 1,
    opacity: 0.3,
  },
});
