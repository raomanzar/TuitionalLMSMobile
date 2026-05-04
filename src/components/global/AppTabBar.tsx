import { Colors, Fonts, FontSize, LetterSpacing, Spacing } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const META: Record<
  string,
  { label: string; icon: keyof typeof Feather.glyphMap }
> = {
  users: { label: "Users", icon: "users" },
  enrollments: { label: "Enrollments", icon: "clipboard" },
  "enrollments-logs": { label: "Logs", icon: "file-text" },
};

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, Spacing.s4 - 1) },
      ]}
    >
      <View style={styles.row}>
        {state.routes.map((route, idx) => {
          const meta = META[route.name];
          if (!meta) return null;

          const focused = state.index === idx;
          const color = focused ? Colors.mainBlue : Colors.textMuted;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented)
              navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tab}
            >
              <Feather name={meta.icon} size={24} color={color} />
              <Text style={[styles.label, { color }]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.frost95,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.dim08,
  },
  row: {
    flexDirection: "row",
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: Spacing.s1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    gap: 3,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular14,
    letterSpacing: LetterSpacing.tight,
  },
});
