import { ProtectedNavRow } from "@/components/global";
import { RoleCard } from "@/components/ui/roles";
import { type Role } from "@/constants/roles";
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useRolesQuery } from "@/hooks/modules/roles";
import { useAuthToken } from "@/stores";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_HEIGHT = 132;
const TITLE_LARGE = FontSize.medium30;
const TITLE_SMALL = FontSize.regular18;

const keyExtractor = (r: Role) => String(r.id);

export default function RolesScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const token = useAuthToken();

  const { data, isLoading, isError, isFetching, refetch } = useRolesQuery(token);
  const roles = data ?? [];

  const handleAdd = useCallback(() => router.push("/roles/add"), []);
  const handleCardEdit = useCallback(
    (r: Role) =>
      router.push({ pathname: "/roles/edit", params: { id: String(r.id) } }),
    [],
  );
  const handleCardDelete = useCallback(
    (r: Role) =>
      router.push({ pathname: "/roles/delete", params: { id: String(r.id) } }),
    [],
  );

  const renderItem = useCallback<ListRenderItem<Role>>(
    ({ item }) => (
      <RoleCard
        role={item}
        onEdit={handleCardEdit}
        onDelete={handleCardDelete}
      />
    ),
    [handleCardEdit, handleCardDelete],
  );

  // ─── Animated header ───────────────────────────────────────────
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      [0, 120],
      [TITLE_LARGE, TITLE_SMALL],
      Extrapolation.CLAMP,
    ),
  }));
  const headerBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [80, 140], [0, 1], Extrapolation.CLAMP),
  }));

  // ─── Body states ───────────────────────────────────────────────
  const emptyState = isLoading ? (
    <View style={styles.empty}>
      <ActivityIndicator color={Colors.mainBlue} />
    </View>
  ) : isError ? (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>Couldn’t load roles.</Text>
      <Pressable onPress={() => refetch()} style={styles.retryBtn} hitSlop={8}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  ) : (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No roles yet.</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.washTopRight} />
      <View pointerEvents="none" style={styles.washMidLeft} />

      <Animated.View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.headerBg, headerBgStyle]}
        />

        <ProtectedNavRow />

        <View style={styles.titleBlock}>
          <Animated.Text style={[styles.title, titleStyle]}>
            Roles
          </Animated.Text>
        </View>
      </Animated.View>

      <Animated.FlatList
        data={roles}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: HEADER_HEIGHT + 6, paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
        initialNumToRender={12}
        windowSize={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        ListEmptyComponent={emptyState}
      />

      <Pressable
        style={[styles.fab, { bottom: 24 + insets.bottom * 0.2 }]}
        onPress={handleAdd}
      >
        <Feather name="plus" size={26} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  washTopRight: {
    position: "absolute",
    top: -40,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(175,226,255,0.55)",
  },
  washMidLeft: {
    position: "absolute",
    top: 220,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(214,238,255,0.55)",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 5,
  },
  headerBg: {
    backgroundColor: Colors.surfaceTint,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderSoft,
  },
  titleBlock: { paddingHorizontal: Spacing.s4 + 1, paddingTop: 4 },
  title: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: LetterSpacing.normal,
  },
  listContent: { paddingHorizontal: Spacing.s4 + 3 },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.frost75,
    borderRadius: Radius.control,
  },
  retryText: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.blue2,
    letterSpacing: LetterSpacing.normal,
  },
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.mainBlue,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.fab,
  },
});
