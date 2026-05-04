import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Spacing,
} from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const META: Record<
  string,
  { label: string; icon: keyof typeof Feather.glyphMap }
> = {
  users: { label: "Users", icon: "users" },
  enrollments: { label: "Enrollments", icon: "clipboard" },
  "enrollments-logs": { label: "Logs", icon: "file-text" },
};

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { state, navigation } = props;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scroll}
      style={styles.bg}
    >
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Tuitional"
        />
      </View>

      <View style={styles.list}>
        {state.routes.map((route, idx) => {
          const meta = META[route.name];
          if (!meta) return null;

          const focused = state.index === idx;
          const color = focused ? Colors.mainBlue : Colors.textMuted;

          const onPress = () => {
            const event = navigation.emit({
              type: "drawerItemPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={onPress}
              style={[styles.item, focused && styles.itemFocused]}
            >
              <Feather name={meta.icon} size={20} color={color} />
              <Text style={[styles.label, { color }]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: Colors.frost95,
  },
  scroll: {
    paddingTop: 0,
  },
  header: {
    // paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s6,
  },
  logo: {
    width: 64,
    height: 64,
  },
  list: {
    paddingHorizontal: Spacing.s2,
    gap: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s3,
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s3,
    borderRadius: Radius.control,
  },
  itemFocused: {
    backgroundColor: Colors.frost75,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    letterSpacing: LetterSpacing.tight,
  },
});
