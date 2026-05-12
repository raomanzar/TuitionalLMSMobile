import React, { memo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Spacing,
} from '@/constants/theme';
import {
  ROLE_FILTERS,
  STATUS_FILTERS,
  SYNC_FILTERS,
  type RoleFilter,
  type StatusFilter,
  type SyncFilter,
} from '@/constants/users';
import { countryNameForCode } from '@/constants/countries';
import { CountryPickerModal } from './CountryPickerModal';

type Props = {
  open: boolean;
  onClose: () => void;
  role: RoleFilter;
  setRole: (v: RoleFilter) => void;
  status: StatusFilter;
  setStatus: (v: StatusFilter) => void;
  sync: SyncFilter;
  setSync: (v: SyncFilter) => void;
  countryCode: string;
  setCountryCode: (v: string) => void;
};

function UserFilterSheetImpl({
  open,
  onClose,
  role,
  setRole,
  status,
  setStatus,
  sync,
  setSync,
  countryCode,
  setCountryCode,
}: Props) {
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const reset = () => {
    setRole('All');
    setStatus('All');
    setSync('All');
    setCountryCode('');
  };

  const countryLabel = countryCode
    ? countryNameForCode(countryCode) || countryCode
    : 'All';

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabberWrap}>
            <View style={styles.grabber} />
          </View>

          <View style={styles.headerRow}>
            <Pressable onPress={reset}>
              <Text style={styles.reset}>Reset</Text>
            </Pressable>
            <Text style={styles.title}>Filter</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          <Group title="Role" value={role} set={setRole} opts={ROLE_FILTERS} />
          <Group title="Status" value={status} set={setStatus} opts={STATUS_FILTERS} />
          <Group title="Sync" value={sync} set={setSync} opts={SYNC_FILTERS} />

          <View style={styles.group}>
            <Text style={styles.groupTitle}>Country</Text>
            <Pressable
              onPress={() => setCountryPickerOpen(true)}
              style={styles.countryRow}
            >
              <Text style={styles.countryValue} numberOfLines={1}>
                {countryLabel}
              </Text>
              <Feather name="chevron-down" size={16} color={Colors.textMuted} />
            </Pressable>
          </View>

          <CountryPickerModal
            open={countryPickerOpen}
            value={countryCode}
            onClose={() => setCountryPickerOpen(false)}
            onSelect={setCountryCode}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Memoized so it doesn't re-render with the parent UsersScreen on every
 * scroll frame. `setRole`/`setStatus`/... are React `useState` setters
 * (stable), and `onClose` is a `useCallback` in the parent.
 */
export const UserFilterSheet = memo(UserFilterSheetImpl);

function Group<T extends string>({
  title,
  value,
  set,
  opts,
}: {
  title: string;
  value: T;
  set: (v: T) => void;
  opts: readonly T[];
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.chips}>
        {opts.map((o) => {
          const active = value === o;
          return (
            <Pressable
              key={o}
              onPress={() => set(o)}
              style={[
                styles.chip,
                active ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text style={[styles.chipText, { color: active ? Colors.white : Colors.text }]}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
    paddingBottom: 32,
  },
  grabberWrap: { alignItems: 'center', paddingTop: Spacing.s3, paddingBottom: Spacing.s1 },
  grabber: { width: 38, height: 4, borderRadius: Radius.pill, backgroundColor: Colors.grabber },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 18,
    paddingHorizontal: Spacing.s1,
  },
  reset: {
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
  group: { marginBottom: 18 },
  groupTitle: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.body,
    paddingHorizontal: Spacing.s1,
    paddingBottom: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
  },
  chipActive: { backgroundColor: Colors.mainBlue },
  chipInactive: {
    backgroundColor: Colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    letterSpacing: LetterSpacing.normal,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    paddingHorizontal: 14,
    height: 44,
  },
  countryValue: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
});
