import React, { useMemo, useState } from 'react';
import {
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
import { DIAL_CODES, type DialCode } from '@/constants/dialCodes';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Spacing,
} from '@/constants/theme';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Currently-selected ISO code (e.g. `PK`). Disambiguates `+1` US/Canada. */
  value: string;
  /** Fired with the full picked entry so the caller can store both ISO + dial. */
  onSelect: (entry: DialCode) => void;
};

const keyExtractor = (c: DialCode) => c.code;

export function DialCodePickerModal({ open, onClose, value, onSelect }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DIAL_CODES;
    return DIAL_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [query]);

  const handlePick = (entry: DialCode) => {
    onSelect(entry);
    setQuery('');
    onClose();
  };

  const renderItem: ListRenderItem<DialCode> = ({ item }) => {
    const active = item.code === value;
    return (
      <Pressable
        onPress={() => handlePick(item)}
        style={[styles.row, active && styles.rowActive]}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <Text style={styles.rowName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.rowDial}>{item.dial}</Text>
        {active ? (
          <Feather
            name="check"
            size={18}
            color={Colors.mainBlue}
            style={styles.check}
          />
        ) : null}
      </Pressable>
    );
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabberWrap}>
            <View style={styles.grabber} />
          </View>

          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <Text style={styles.title}>Country Code</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <Feather name="search" size={16} color={Colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search country or +code"
              placeholderTextColor={Colors.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
              style={styles.searchInput}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Feather name="x" size={16} color={Colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            windowSize={10}
            ListEmptyComponent={
              <Text style={styles.empty}>No matches for “{query}”.</Text>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.control,
    gap: 12,
  },
  rowActive: {
    backgroundColor: Colors.frost75,
  },
  flag: {
    fontSize: FontSize.regular22,
  },
  rowName: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  rowDial: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.wide,
  },
  check: { marginLeft: 4 },
  empty: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
