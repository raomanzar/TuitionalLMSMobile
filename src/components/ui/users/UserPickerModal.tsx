import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Avatar } from '@/components/global';
import { type User, USER_AVATAR_FALLBACK } from '@/constants/users';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Spacing,
} from '@/constants/theme';
import { useUsersQuery } from '@/hooks/modules/users';
import { useAuthToken } from '@/stores';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Sheet header copy. */
  title: string;
  /** Backend role id — 3=Student, 4=Parent/Guardian, 2=Teacher, 1=Admin. */
  userType: number;
  /** Currently-picked user id (for the active checkmark). */
  selectedId: number | null;
  onSelect: (user: User) => void;
};

const PAGE_LIMIT = 15;
const SEARCH_DEBOUNCE_MS = 3000;

const keyExtractor = (u: User) => String(u.id);

/**
 * Searchable bottom-sheet picker backed by GET /api/user/getAllUsers. Filters
 * by `userType` + `status=true` and supports name/email search (router copies
 * the existing list-screen logic: a `@` in the query routes to `email`,
 * otherwise to `name`).
 */
export function UserPickerModal(props: Props) {
  return (
    <Modal
      visible={props.open}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {/* Mount the inner only when open so the query doesn't stay alive
          (and refetch on focus) while the sheet is closed. */}
      {props.open ? <PickerContent {...props} /> : null}
    </Modal>
  );
}

function PickerContent({
  onClose,
  title,
  userType,
  selectedId,
  onSelect,
}: Omit<Props, 'open'>) {
  const token = useAuthToken();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce so each keystroke doesn't fire a network call.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  // Server-side filter payload. `@` → email, otherwise → name (mirrors the
  // routing in `uiFiltersToApiPayload`).
  const apiPayload = useMemo(() => {
    const base = {
      userType,
      status: true,
      limit: PAGE_LIMIT,
    };
    if (!debouncedSearch) return base;
    return debouncedSearch.includes('@')
      ? { ...base, email: debouncedSearch }
      : { ...base, name: debouncedSearch };
  }, [userType, debouncedSearch]);

  const { data, isPending, isError, isFetching, refetch } = useUsersQuery(
    apiPayload,
    token,
  );
  // Picker only shows the first page — `useUsersQuery` is an infinite query
  // but we explicitly cap at PAGE_LIMIT to keep the sheet snappy.
  const users = data?.pages[0]?.users ?? [];

  const handlePick = (u: User) => {
    onSelect(u);
    onClose();
  };

  const renderItem: ListRenderItem<User> = ({ item }) => {
    const active = item.id === selectedId;
    return (
      <Pressable
        onPress={() => handlePick(item)}
        style={[styles.row, active && styles.rowActive]}
      >
        <Avatar
          first={item.first}
          last={item.last}
          color={item.color}
          size={36}
          imageUri={item.profileImageUrl}
          fallbackImage={USER_AVATAR_FALLBACK}
        />
        <View style={styles.rowBody}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.first} {item.last}
          </Text>
          <Text style={styles.rowEmail} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
        {active ? (
          <Feather name="check" size={18} color={Colors.mainBlue} />
        ) : null}
      </Pressable>
    );
  };

  return (
    <Pressable style={styles.scrim} onPress={onClose}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <View style={styles.grabberWrap}>
          <View style={styles.grabber} />
        </View>

        <View style={styles.headerRow}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color={Colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or email"
            placeholderTextColor={Colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
            style={styles.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Feather name="x" size={16} color={Colors.textMuted} />
            </Pressable>
          ) : isFetching && !isPending ? (
            // Live indicator while a search refetches in the background.
            <ActivityIndicator size="small" color={Colors.mainBlue} />
          ) : null}
        </View>

        {isPending ? (
          <View style={styles.statusWrap}>
            <ActivityIndicator size="small" color={Colors.mainBlue} />
            <Text style={styles.statusText}>Loading…</Text>
          </View>
        ) : isError ? (
          <View style={styles.statusWrap}>
            <Text style={styles.statusText}>Couldn&apos;t load users.</Text>
            <Pressable
              onPress={() => refetch()}
              style={styles.retryBtn}
              hitSlop={6}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : users.length === 0 ? (
          <Text style={styles.statusText}>
            {debouncedSearch
              ? `No matches for “${debouncedSearch}”.`
              : 'No users found.'}
          </Text>
        ) : (
          <FlatList
            data={users}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={PAGE_LIMIT}
          />
        )}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: Colors.scrim,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    paddingHorizontal: 18,
    paddingBottom: 16,
    maxHeight: '85%',
  },
  grabberWrap: {
    alignItems: 'center',
    paddingTop: Spacing.s3,
    paddingBottom: Spacing.s1,
  },
  grabber: {
    width: 38,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.grabber,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: Spacing.s1,
  },
  headerSpacer: { width: 40 },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.regular22,
    color: Colors.text,
    letterSpacing: LetterSpacing.normal,
  },
  done: {
    color: Colors.mainBlue,
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular20,
    letterSpacing: LetterSpacing.normal,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: Radius.control,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    paddingVertical: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.control,
  },
  rowActive: { backgroundColor: Colors.frost75 },
  rowBody: { flex: 1, minWidth: 0 },
  rowName: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  rowEmail: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
    marginTop: 2,
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  statusText: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
    textAlign: 'center',
    paddingVertical: 24,
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.control,
    backgroundColor: Colors.mainBlue,
  },
  retryText: {
    color: Colors.white,
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular14,
    letterSpacing: LetterSpacing.normal,
  },
});
