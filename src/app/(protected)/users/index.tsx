import { ProtectedNavRow } from "@/components/global";
import { UserCard, UserFabSheet, UserFilterSheet } from "@/components/ui/users";
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from "@/constants/theme";
import {
  type RoleFilter,
  type StatusFilter,
  type SyncFilter,
  type User,
} from "@/constants/users";
import {
  countActiveFilters,
  useFilteredUsers,
  useUsersQuery,
} from "@/hooks/modules/users";
import { uiFiltersToApiPayload } from "@/services/apis/users";
import { useAuthToken } from "@/stores";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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

const HEADER_HEIGHT = 178;
const TITLE_LARGE = FontSize.medium30;
const TITLE_SMALL = FontSize.regular18;

const keyExtractor = (u: User) => String(u.id);

export default function UsersScreen() {
  console.log("users screen render");
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const token = useAuthToken();

  // `UsersSearchBar` owns the live text + debounce so keystrokes don't bubble
  // a re-render up here. We only see the debounced value.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [sync, setSync] = useState<SyncFilter>("All");
  const [countryCode, setCountryCode] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const filters = useMemo(
    () => ({ search: debouncedSearch, role, status, sync, countryCode }),
    [debouncedSearch, role, status, sync, countryCode],
  );
  const apiPayload = useMemo(
    () => ({ ...uiFiltersToApiPayload(filters), limit: 15 }),
    [filters],
  );
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersQuery(apiPayload, token);

  const users = useMemo(
    () => data?.pages.flatMap((p) => p.users) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.total ?? 0;
  const filtered = useFilteredUsers(users, filters);
  const activeFilters = countActiveFilters(filters);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ─── Stable handlers ───────────────────────────────────────────
  const handleOpenFilter = useCallback(() => setFilterOpen(true), []);
  const handleCloseFilter = useCallback(() => setFilterOpen(false), []);
  const handleOpenFab = useCallback(() => setFabOpen(true), []);
  const handleCloseFab = useCallback(() => setFabOpen(false), []);

  const handleCardTap = useCallback(
    (u: User) =>
      router.push({ pathname: "/users/[id]", params: { id: String(u.id) } }),
    [],
  );
  const handleCardEdit = useCallback(
    (u: User) =>
      router.push({ pathname: "/users/edit", params: { id: String(u.id) } }),
    [],
  );
  const handleCardDelete = useCallback(
    (u: User) =>
      router.push({ pathname: "/users/delete", params: { id: String(u.id) } }),
    [],
  );

  const renderItem = useCallback<ListRenderItem<User>>(
    ({ item }) => (
      <UserCard
        user={item}
        isOpen={openId === item.id}
        onOpen={setOpenId}
        onTap={handleCardTap}
        onEdit={handleCardEdit}
        onDelete={handleCardDelete}
      />
    ),
    [openId, handleCardTap, handleCardEdit, handleCardDelete],
  );

  const ListEmpty = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="small" color={Colors.mainBlue} />
          <Text style={styles.emptyText}>Loading users…</Text>
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Couldn&apos;t load users.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No users match your filters.</Text>
      </View>
    );
  }, [isLoading, isError, refetch]);

  const ListFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={Colors.mainBlue} />
          <Text style={styles.footerHint}>Loading more…</Text>
        </View>
      );
    }
    if (filtered.length === 0) return null;
    return (
      <Text style={styles.footerHint}>
        Showing {filtered.length} of {totalCount}
        {hasNextPage ? " · scroll to load more" : " · all loaded"}
      </Text>
    );
  }, [isFetchingNextPage, filtered.length, totalCount, hasNextPage]);

  const listContentStyle = useMemo(
    () => [
      styles.listContent,
      { paddingTop: HEADER_HEIGHT + insets.top, paddingBottom: 24 },
    ],
    [insets.top],
  );

  // ─── Animated header styles ────────────────────────────────────
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      [0, 60],
      [TITLE_LARGE, TITLE_SMALL],
      Extrapolation.CLAMP,
    ),
    lineHeight: interpolate(
      scrollY.value,
      [0, 60],
      [TITLE_LARGE + 3, TITLE_SMALL + 4],
      Extrapolation.CLAMP,
    ),
  }));

  const titlePaddingStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(
      scrollY.value,
      [0, 60],
      [8, 0],
      Extrapolation.CLAMP,
    ),
    paddingBottom: interpolate(
      scrollY.value,
      [0, 60],
      [12, 8],
      Extrapolation.CLAMP,
    ),
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 30], [1, 0], Extrapolation.CLAMP),
    height: interpolate(scrollY.value, [0, 30], [18, 0], Extrapolation.CLAMP),
  }));

  const headerBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 24], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.washTopRight} />
      <View pointerEvents="none" style={styles.washMidLeft} />

      <Animated.View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.headerBg, headerBgStyle]}
        />

        <ProtectedNavRow />

        <Animated.View style={[styles.titleBlock, titlePaddingStyle]}>
          <Animated.Text style={[styles.title, titleStyle]}>
            Users
          </Animated.Text>
          <Animated.View style={[styles.subtitleWrap, subtitleStyle]}>
            <Text style={styles.subtitle} numberOfLines={1}>
              {isLoading
                ? "Loading…"
                : isError
                  ? "Failed to load · pull to retry"
                  : `${filtered.length} of ${users.length} shown · ${totalCount} total`}
            </Text>
          </Animated.View>
        </Animated.View>

        <View style={styles.searchRow}>
          <UsersSearchBar onDebouncedChange={setDebouncedSearch} />
          <Pressable
            style={[
              styles.filterBtn,
              activeFilters > 0 && styles.filterBtnActive,
            ]}
            onPress={handleOpenFilter}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFilters > 0 ? Colors.white : Colors.text}
            />
            {activeFilters > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilters}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </Animated.View>

      <Animated.FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={listContentStyle}
        refreshing={isFetching && !isLoading && !isFetchingNextPage}
        onRefresh={refetch}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={9}
      />

      <Pressable
        style={[styles.fab, { bottom: 24 + insets.bottom * 0.2 }]}
        onPress={handleOpenFab}
      >
        <Feather name="plus" size={26} color={Colors.white} />
      </Pressable>

      <UserFabSheet open={fabOpen} onClose={handleCloseFab} />
      <UserFilterSheet
        open={filterOpen}
        onClose={handleCloseFilter}
        role={role}
        setRole={setRole}
        status={status}
        setStatus={setStatus}
        sync={sync}
        setSync={setSync}
        countryCode={countryCode}
        setCountryCode={setCountryCode}
      />
    </View>
  );
}

/**
 * Owns the live search text + 3-second debounce internally so keystrokes
 * don't re-render `UsersScreen`. Only the debounced value escapes via
 * `onDebouncedChange`. Memoized so the parent's renders (animated header,
 * query state changes) don't re-render this either.
 */
const UsersSearchBar = memo(function UsersSearchBar({
  onDebouncedChange,
}: {
  onDebouncedChange: (value: string) => void;
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    const t = setTimeout(() => onDebouncedChange(text), 3000);
    return () => clearTimeout(t);
  }, [text, onDebouncedChange]);

  const handleClear = useCallback(() => setText(""), []);

  return (
    <View style={styles.searchField}>
      <Feather name="search" size={18} color={Colors.textMuted} />
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Search name, email, ID"
        placeholderTextColor={Colors.textMuted}
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {text.length > 0 && (
        <Pressable onPress={handleClear} style={styles.clearBtn}>
          <Feather name="x" size={11} color={Colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surfaceTint,
  },
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
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 50,
  },
  headerBg: {
    backgroundColor: Colors.frost92,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderSoft,
  },
  titleBlock: {
    paddingHorizontal: Spacing.s4 + 1,
  },
  title: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: LetterSpacing.normal,
  },
  subtitleWrap: {
    overflow: "hidden",
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: Spacing.s4 + 1,
    paddingBottom: 12,
  },
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: Radius.control,
    paddingHorizontal: 12,
    height: 40,
    ...Shadow.control,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    padding: 0,
    minWidth: 0,
  },
  clearBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.dim08,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.control,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.control,
  },
  filterBtnActive: {
    backgroundColor: Colors.mainBlue,
  },
  filterBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: Colors.red,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  filterBadgeText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: FontSize.regular14,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: Spacing.s5,
    gap: 10,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    color: Colors.textMuted,
    fontSize: FontSize.regular18,
    letterSpacing: LetterSpacing.normal,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.control,
    backgroundColor: Colors.mainBlue,
  },
  retryText: {
    color: Colors.white,
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    letterSpacing: LetterSpacing.normal,
  },
  footerHint: {
    textAlign: "center",
    paddingVertical: Spacing.s4 + 1,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
  },
  footerLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: Spacing.s4 + 1,
  },
  fab: {
    position: "absolute",
    right: Spacing.s4 + 1,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.mainBlue,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 80,
    ...Shadow.fab,
  },
});
