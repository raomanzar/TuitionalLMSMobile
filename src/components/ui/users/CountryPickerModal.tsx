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
import { COUNTRIES, type Country } from '@/constants/countries';
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
  /** Current selection — pass empty string to mean "no filter / All". */
  value: string;
  /** Fired with the picked ISO code, or empty string for "All". */
  onSelect: (code: string) => void;
};

const keyExtractor = (c: Country) => c.code;

export function CountryPickerModal({ open, onClose, value, onSelect }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [query]);

  const handlePick = (code: string) => {
    onSelect(code);
    setQuery('');
    onClose();
  };

  const renderItem: ListRenderItem<Country> = ({ item }) => {
    const active = item.code === value;
    return (
      <Pressable
        onPress={() => handlePick(item.code)}
        style={[styles.row, active && styles.rowActive]}
      >
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowCode}>{item.code}</Text>
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
            <Pressable onPress={() => handlePick('')}>
              <Text style={styles.allBtn}>All</Text>
            </Pressable>
            <Text style={styles.title}>Country</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <Feather name="search" size={16} color={Colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search country"
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
              <Text style={styles.empty}>No countries match “{query}”.</Text>
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
  allBtn: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    letterSpacing: LetterSpacing.normal,
  },
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
  },
  rowActive: {
    backgroundColor: Colors.frost75,
  },
  rowName: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  rowCode: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular14,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.wide,
    marginLeft: 8,
  },
  check: { marginLeft: 8 },
  empty: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
