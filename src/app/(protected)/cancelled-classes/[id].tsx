import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
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
import { CANCELLED_CLASSES } from '@/constants/cancelled-classes';

export default function CancelledClassDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const item = id ? CANCELLED_CLASSES.find((c) => String(c.id) === id) : undefined;

  if (!item) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top + 24 }]}>
        <Feather name="alert-circle" size={36} color={Colors.textMuted} />
        <Text style={styles.missing}>Cancelled class not found.</Text>
        <Pressable onPress={router.back} style={styles.backBtn}>
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.hero,
            { backgroundColor: `${item.color}80`, paddingTop: insets.top + 8 },
          ]}
        >
          <View style={styles.heroNav}>
            <Pressable onPress={router.back} style={styles.iconBtn} hitSlop={8}>
              <Feather name="chevron-left" size={20} color={Colors.text} />
            </Pressable>
          </View>

          <View style={styles.heroBody}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.scheduled}>{item.scheduledAt}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Row label="Student" value={item.studentName} />
          <Row label="Teacher" value={item.teacherName} />
          <Row label="Duration" value={`${item.durationMinutes} min`} />
          <Row label="Cancelled by" value={item.cancelledBy} />
          <Row label="Cancelled" value={item.cancelledAt} />
          <Row label="Refund status" value={item.refundStatus} last />
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonLabel}>REASON</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      style={[
        styles.row,
        last && { borderBottomWidth: 0 },
      ]}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  scroll: { paddingBottom: 60 },
  missing: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
  },
  backBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.control,
    backgroundColor: Colors.mainBlue,
  },
  backText: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.white,
    letterSpacing: LetterSpacing.normal,
  },
  hero: {
    paddingHorizontal: 12,
    paddingBottom: 22,
  },
  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
  heroBody: { alignItems: 'center', gap: 4 },
  subject: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.regular22,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    textAlign: 'center',
  },
  scheduled: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textSecondary,
    letterSpacing: LetterSpacing.tight,
  },
  card: {
    marginHorizontal: Spacing.s4 + 3,
    marginTop: -10,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadow.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderRow,
  },
  rowLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.wide,
  },
  rowValue: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    maxWidth: '60%',
  },
  reasonCard: {
    marginHorizontal: Spacing.s4 + 3,
    marginTop: 14,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 14,
    ...Shadow.input,
  },
  reasonLabel: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.wide,
    marginBottom: 6,
  },
  reasonText: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
});
