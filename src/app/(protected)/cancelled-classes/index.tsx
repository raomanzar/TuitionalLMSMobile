import React, { useCallback, useMemo, useState } from 'react';
import {
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
import { ProtectedNavRow } from '@/components/global';
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
  CANCELLED_BY_FILTERS,
  CANCELLED_CLASSES,
  TOTAL_CANCELLED_CLASSES,
  type CancelledByFilter,
  type CancelledClass,
  type DateRangeFilter,
  type RefundStatusFilter,
} from '@/constants/cancelled-classes';
import {
  CancelledClassCard,
  CancelledClassFilterSheet,
} from '@/components/ui/cancelled-classes';
import {
  countActiveCancelledClassFilters,
  useFilteredCancelledClasses,
} from '@/hooks/modules/cancelled-classes';

const HEADER_HEIGHT = 218;
const TITLE_LARGE = FontSize.medium30;
const TITLE_SMALL = FontSize.regular18;

const keyExtractor = (c: CancelledClass) => String(c.id);

export default function CancelledClassesScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const [search, setSearch] = useState('');
  const [cancelledBy, setCancelledBy] = useState<CancelledByFilter>('All');
  const [refundStatus, setRefundStatus] = useState<RefundStatusFilter>('All');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('All');
  const [openId, setOpenId] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const filters = useMemo(
    () => ({ search, cancelledBy, refundStatus, dateRange }),
    [search, cancelledBy, refundStatus, dateRange],
  );
  const filtered = useFilteredCancelledClasses(CANCELLED_CLASSES, filters);
  const activeFilters = countActiveCancelledClassFilters(filters);

  // ─── Stable handlers ───────────────────────────────────────────
  const handleSearchClear = useCallback(() => setSearch(''), []);
  const handleOpenFilter = useCallback(() => setFilterOpen(true), []);
  const handleCloseFilter = useCallback(() => setFilterOpen(false), []);

  const handleCardTap = useCallback(
    (c: CancelledClass) =>
      router.push({ pathname: '/cancelled-classes/[id]', params: { id: String(c.id) } }),
    [],
  );
  const handleRefund = useCallback((c: CancelledClass) => {
    // Stub — would trigger a refund mutation when API lands.
    console.log('refund', c.id);
  }, []);
  const handleReschedule = useCallback((c: CancelledClass) => {
    // Stub — would open a reschedule flow when API lands.
    console.log('reschedule', c.id);
  }, []);

  const renderItem = useCallback<ListRenderItem<CancelledClass>>(
    ({ item }) => (
      <CancelledClassCard
        item={item}
        isOpen={openId === item.id}
        onOpen={setOpenId}
        onTap={handleCardTap}
        onRefund={handleRefund}
        onReschedule={handleReschedule}
      />
    ),
    [openId, handleCardTap, handleRefund, handleReschedule],
  );

  const ListEmpty = useMemo(
    () => (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No cancelled classes match your filters.</Text>
      </View>
    ),
    [],
  );

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

        <ProtectedNavRow />

        <Animated.View style={[styles.titleBlock, titlePaddingStyle]}>
          <Animated.Text style={[styles.title, titleStyle]}>Cancelled Classes</Animated.Text>
          <Animated.View style={[styles.subtitleWrap, subtitleStyle]}>
            <Text style={styles.subtitle} numberOfLines={1}>
              {filtered.length} of {CANCELLED_CLASSES.length} shown · {TOTAL_CANCELLED_CLASSES} total
            </Text>
          </Animated.View>
        </Animated.View>

        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <Feather name="search" size={18} color={Colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search subject, student, teacher"
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
          contentContainerStyle={styles.chipRow}
        >
          {CANCELLED_BY_FILTERS.map((b) => {
            const on = cancelledBy === b;
            return (
              <Pressable
                key={b}
                onPress={() => setCancelledBy(b)}
                style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
              >
                <Text style={[styles.chipText, { color: on ? Colors.white : Colors.text }]}>{b}</Text>
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
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={9}
      />

      <CancelledClassFilterSheet
        open={filterOpen}
        onClose={handleCloseFilter}
        cancelledBy={cancelledBy}
        setCancelledBy={setCancelledBy}
        refundStatus={refundStatus}
        setRefundStatus={setRefundStatus}
        dateRange={dateRange}
        setDateRange={setDateRange}
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
  titleBlock: { paddingHorizontal: Spacing.s4 + 1 },
  title: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: LetterSpacing.normal,
  },
  subtitleWrap: { overflow: 'hidden' },
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
  filterBtnActive: { backgroundColor: Colors.mainBlue },
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
  chipRow: {
    paddingHorizontal: Spacing.s4 + 1,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  chipOn: { backgroundColor: Colors.text },
  chipOff: {
    backgroundColor: Colors.frost70,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.dim10,
  },
  chipText: {
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
  footerHint: {
    textAlign: 'center',
    paddingVertical: Spacing.s4 + 1,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
  },
});
