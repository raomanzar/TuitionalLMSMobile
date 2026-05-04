import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';
import {
  ROLE_FILTERS,
  type RoleFilter,
  type StatusFilter,
  type SyncFilter,
  type User,
} from '@/constants/users';
import {
  UserCard,
  UserFabSheet,
  UserFilterSheet,
} from '@/components/ui/users';
import { countActiveFilters, useFilteredUsers, useUsersQuery } from '@/hooks/modules/users';

const HEADER_HEIGHT = 218;
const TITLE_LARGE = FontSize.medium30;
const TITLE_SMALL = FontSize.regular18;

const keyExtractor = (u: User) => String(u.id);

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<RoleFilter>('All');
  const [status, setStatus] = useState<StatusFilter>('All');
  const [sync, setSync] = useState<SyncFilter>('All');
  const [openId, setOpenId] = useState<number | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const filters = useMemo(
    () => ({ search, role, status, sync }),
    [search, role, status, sync],
  );
  const { data, isLoading, isError, refetch, isFetching } = useUsersQuery();
  const users = data?.users ?? [];
  const totalCount = data?.total ?? 0;
  const filtered = useFilteredUsers(users, filters);
  const activeFilters = countActiveFilters(filters);

  // ─── Stable handlers ───────────────────────────────────────────
  const handleSearchClear = useCallback(() => setSearch(''), []);
  const handleOpenFilter = useCallback(() => setFilterOpen(true), []);
  const handleCloseFilter = useCallback(() => setFilterOpen(false), []);
  const handleOpenFab = useCallback(() => setFabOpen(true), []);
  const handleCloseFab = useCallback(() => setFabOpen(false), []);

  const handleCardTap = useCallback(
    (u: User) => router.push({ pathname: '/users/[id]', params: { id: String(u.id) } }),
    [],
  );
  const handleCardEdit = useCallback(
    (u: User) => router.push({ pathname: '/users/edit', params: { id: String(u.id) } }),
    [],
  );
  const handleCardDelete = useCallback(
    (u: User) => router.push({ pathname: '/users/delete', params: { id: String(u.id) } }),
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

  const ListFooter = useMemo(
    () =>
      filtered.length > 0 ? (
        <Text style={styles.footerHint}>Showing {filtered.length} · pull up to load more</Text>
      ) : null,
    [filtered.length],
  );

  const listContentStyle = useMemo(
    () => [styles.listContent, { paddingTop: HEADER_HEIGHT + insets.top, paddingBottom: 24 }],
    [insets.top],
  );

  // ─── Animated header styles ────────────────────────────────────
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(scrollY.value, [0, 60], [TITLE_LARGE, TITLE_SMALL], Extrapolation.CLAMP),
    lineHeight: interpolate(scrollY.value, [0, 60], [TITLE_LARGE + 3, TITLE_SMALL + 4], Extrapolation.CLAMP),
  }));

  const titlePaddingStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(scrollY.value, [0, 60], [8, 0], Extrapolation.CLAMP),
    paddingBottom: interpolate(scrollY.value, [0, 60], [12, 8], Extrapolation.CLAMP),
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
        <Animated.View style={[StyleSheet.absoluteFill, styles.headerBg, headerBgStyle]} />

        <View style={styles.navRow}>
          <Pressable style={styles.iconBtn}>
            <Feather name="chevron-left" size={20} color={Colors.text} />
          </Pressable>
          <View style={styles.navRight}>
            <Pressable style={styles.iconBtn}>
              <Feather name="bell" size={20} color={Colors.text} />
              <View style={styles.bellDot} />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Feather name="more-horizontal" size={20} color={Colors.text} />
            </Pressable>
          </View>
        </View>

        <Animated.View style={[styles.titleBlock, titlePaddingStyle]}>
          <Animated.Text style={[styles.title, titleStyle]}>Users</Animated.Text>
          <Animated.View style={[styles.subtitleWrap, subtitleStyle]}>
            <Text style={styles.subtitle} numberOfLines={1}>
              {isLoading
                ? 'Loading…'
                : isError
                  ? 'Failed to load · pull to retry'
                  : `${filtered.length} of ${users.length} shown · ${totalCount} total`}
            </Text>
          </Animated.View>
        </Animated.View>

        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <Feather name="search" size={18} color={Colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search name, email, ID"
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={handleSearchClear} style={styles.clearBtn}>
                <Feather name="x" size={11} color={Colors.textSecondary} />
              </Pressable>
            )}
          </View>
          <Pressable
            style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]}
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roleRow}
        >
          {ROLE_FILTERS.map((r) => {
            const on = role === r;
            return (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={[styles.roleChip, on ? styles.roleChipOn : styles.roleChipOff]}
              >
                <Text style={[styles.roleText, { color: on ? Colors.white : Colors.text }]}>{r}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
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
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surfaceTint,
  },
  washTopRight: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 320,
    height: 280,
    borderRadius: 200,
    backgroundColor: Colors.wash1,
  },
  washMidLeft: {
    position: 'absolute',
    top: 120,
    left: -120,
    width: 280,
    height: 240,
    borderRadius: 200,
    backgroundColor: Colors.wash2,
  },
  header: {
    position: 'absolute',
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  navRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.control,
    backgroundColor: Colors.frost85,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.control,
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.red,
    borderWidth: 1.5,
    borderColor: Colors.white,
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
    overflow: 'hidden',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
    marginTop: Spacing.s1,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.s4 + 1,
    paddingBottom: 12,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.control,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.control,
  },
  filterBtnActive: {
    backgroundColor: Colors.mainBlue,
  },
  filterBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  filterBadgeText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: FontSize.regular14,
  },
  roleRow: {
    paddingHorizontal: Spacing.s4 + 1,
    paddingBottom: 12,
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  roleChipOn: { backgroundColor: Colors.text },
  roleChipOff: {
    backgroundColor: Colors.frost70,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.dim10,
  },
  roleText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    letterSpacing: LetterSpacing.normal,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  empty: {
    alignItems: 'center',
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
    textAlign: 'center',
    paddingVertical: Spacing.s4 + 1,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
  },
  fab: {
    position: 'absolute',
    right: Spacing.s4 + 1,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.mainBlue,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 80,
    ...Shadow.fab,
  },
});
