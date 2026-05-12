import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Spacing,
} from '@/constants/theme';

type Role = { id: number; name: string };

type Props = {
  open: boolean;
  onClose: () => void;
  /** Full role list from `useRolesQuery`. */
  roles: readonly Role[];
  /** Currently-selected role id, or null when nothing picked. */
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** Pass the query's `isPending` so the sheet shows a spinner before data arrives. */
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

const keyExtractor = (r: Role) => String(r.id);

/**
 * Bottom-sheet picker for the dynamic role list. Mirrors the layout of
 * `DialCodePickerModal` so both pickers feel the same.
 */
export function RolePickerModal({
  open,
  onClose,
  roles,
  selectedId,
  onSelect,
  isLoading,
  isError,
  onRetry,
}: Props) {
  const handlePick = (id: number) => {
    onSelect(id);
    onClose();
  };

  const renderItem: ListRenderItem<Role> = ({ item }) => {
    const active = item.id === selectedId;
    return (
      <Pressable
        onPress={() => handlePick(item.id)}
        style={[styles.row, active && styles.rowActive]}
      >
        <Text style={styles.rowName} numberOfLines={1}>
          {item.name}
        </Text>
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
            <Text style={styles.title}>User Type</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.statusWrap}>
              <ActivityIndicator size="small" color={Colors.mainBlue} />
              <Text style={styles.statusText}>Loading roles…</Text>
            </View>
          ) : isError ? (
            <View style={styles.statusWrap}>
              <Text style={styles.statusText}>Couldn&apos;t load roles.</Text>
              <Pressable onPress={onRetry} style={styles.retryBtn} hitSlop={6}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : roles.length === 0 ? (
            <Text style={styles.statusText}>
              No roles available. Create one in Roles.
            </Text>
          ) : (
            <FlatList
              data={roles}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
            />
          )}
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
    maxHeight: '70%',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: Radius.control,
  },
  rowActive: { backgroundColor: Colors.frost75 },
  rowName: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  check: { marginLeft: 8 },
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
