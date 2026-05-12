import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Spacing,
} from '@/constants/theme';
import {
  CANCELLED_BY_FILTERS,
  DATE_RANGE_FILTERS,
  REFUND_STATUS_FILTERS,
  type CancelledByFilter,
  type DateRangeFilter,
  type RefundStatusFilter,
} from '@/constants/cancelled-classes';

type Props = {
  open: boolean;
  onClose: () => void;
  cancelledBy: CancelledByFilter;
  setCancelledBy: (v: CancelledByFilter) => void;
  refundStatus: RefundStatusFilter;
  setRefundStatus: (v: RefundStatusFilter) => void;
  dateRange: DateRangeFilter;
  setDateRange: (v: DateRangeFilter) => void;
};

export function CancelledClassFilterSheet({
  open,
  onClose,
  cancelledBy,
  setCancelledBy,
  refundStatus,
  setRefundStatus,
  dateRange,
  setDateRange,
}: Props) {
  const reset = () => {
    setCancelledBy('All');
    setRefundStatus('All');
    setDateRange('All');
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabberWrap}>
            <View style={styles.grabber} />
          </View>

          <View style={styles.headerRow}>
            <Pressable onPress={reset} hitSlop={8}>
              <Text style={styles.reset}>Reset</Text>
            </Pressable>
            <Text style={styles.title}>Filter</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          <Group title="Cancelled by" value={cancelledBy} set={setCancelledBy} opts={CANCELLED_BY_FILTERS} />
          <Group title="Refund status" value={refundStatus} set={setRefundStatus} opts={REFUND_STATUS_FILTERS} />
          <Group title="Date range" value={dateRange} set={setDateRange} opts={DATE_RANGE_FILTERS} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
              style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
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
  },
  reset: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
  },
  done: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.mainBlue,
    letterSpacing: LetterSpacing.normal,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.regular20,
    color: Colors.text,
    letterSpacing: LetterSpacing.normal,
  },
  group: {
    paddingVertical: 12,
  },
  groupTitle: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.textSecondary,
    letterSpacing: LetterSpacing.normal,
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  chipActive: { backgroundColor: Colors.text },
  chipInactive: {
    backgroundColor: Colors.frost70,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.dim10,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    letterSpacing: LetterSpacing.normal,
  },
});
