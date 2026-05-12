import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

/** Soft brand wash (top-right + mid-left blobs) for module form screens. */
export function ScreenBg() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.washTopRight} />
      <View style={styles.washMidLeft} />
    </View>
  );
}

const styles = StyleSheet.create({
  washTopRight: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 320,
    height: 280,
    borderRadius: 200,
    backgroundColor: Colors.wash1,
  },
  washMidLeft: {
    position: "absolute",
    top: 120,
    left: -120,
    width: 280,
    height: 240,
    borderRadius: 200,
    backgroundColor: Colors.wash2,
  },
});
