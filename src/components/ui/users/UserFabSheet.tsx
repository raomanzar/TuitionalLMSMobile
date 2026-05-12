import React, { memo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';

type Props = {
  open: boolean;
  onClose: () => void;
};

function UserFabSheetImpl({ open, onClose }: Props) {
  const goto = (path: '/users/add' | '/users/add-relation' | '/users/export') => () => {
    onClose();
    router.push(path);
  };

  return (
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.heading}>CREATE</Text>
          <Item
            icon={<Feather name="plus" size={20} color={Colors.white} />}
            color={Colors.mainBlue}
            label="Add New User"
            sub="Provision a student, teacher, or admin"
            onPress={goto('/users/add')}
          />
          <Item
            icon={<Feather name="link" size={20} color={Colors.white} />}
            color={Colors.purpleAccent}
            label="Add Relation"
            sub="Link a parent to a student, or tutor pair"
            onPress={goto('/users/add-relation')}
          />
          <Item
            icon={<Feather name="download" size={20} color={Colors.white} />}
            color={Colors.orange}
            label="Export Users"
            sub="Download CSV of current filter"
            onPress={goto('/users/export')}
            isLast
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Memoized so it doesn't re-render with the parent UsersScreen on every
 * scroll frame (the animated header re-renders the parent constantly).
 * `onClose` from the parent is already a stable `useCallback` reference.
 */
export const UserFabSheet = memo(UserFabSheetImpl);

function Item({
  icon,
  color,
  label,
  sub,
  onPress,
  isLast,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  sub: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable style={[styles.item, !isLast && styles.itemBorder]} onPress={onPress}>
      <View style={[styles.itemIcon, { backgroundColor: color }]}>{icon}</View>
      <View style={styles.itemBody}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemSub}>{sub}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: Colors.scrimLight,
    justifyContent: 'center',
    paddingHorizontal: Spacing.s4,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadow.sheet,
  },
  heading: {
    paddingTop: 14,
    paddingHorizontal: Spacing.s4 + 1,
    paddingBottom: 6,
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.body,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: Spacing.s4 + 1,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderRow,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemBody: { flex: 1 },
  itemLabel: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular20,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  itemSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
    marginTop: 2,
  },
});
