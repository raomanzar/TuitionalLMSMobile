import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  PrimaryButton,
  ScreenBg,
  SectionTitle,
  TopBar,
} from '@/components/global';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';

const COLUMNS = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Created', 'Country', 'Phone', 'Sync'];

type Scope = 'filtered' | 'all';

const SCOPE_OPTIONS: { id: Scope; title: string; sub: string }[] = [
  { id: 'filtered', title: 'Current filter', sub: '238 users matching active filters' },
  { id: 'all', title: 'All users', sub: '704 users · ignores filters' },
];

export default function ExportUsers() {
  const [scope, setScope] = useState<Scope>('filtered');
  const [sent, setSent] = useState(false);

  if (sent) return <ExportSuccessView />;

  return (
    <View style={styles.root}>
      <ScreenBg />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TopBar title="Export Users" subtitle="CSV will be sent to your inbox" onBack={router.back} big />

        <View style={styles.body}>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryIcon}>
              <Feather name="mail" size={18} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveryLabel}>Send to</Text>
              <Text style={styles.deliveryEmail}>hello@tuitionaledu.com</Text>
            </View>
          </View>

          <SectionTitle>Scope</SectionTitle>
          {SCOPE_OPTIONS.map((o) => {
            const on = scope === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => setScope(o.id)}
                style={[styles.scopeCard, on ? styles.scopeOn : styles.scopeOff]}
              >
                <View
                  style={[
                    styles.radio,
                    on && { borderColor: Colors.mainBlue, borderWidth: 6, backgroundColor: Colors.white },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.scopeTitle}>{o.title}</Text>
                  <Text style={styles.scopeSub}>{o.sub}</Text>
                </View>
              </Pressable>
            );
          })}

          <SectionTitle>Columns Included</SectionTitle>
          <View style={styles.colsRow}>
            {COLUMNS.map((c) => (
              <View key={c} style={styles.colChip}>
                <Text style={styles.colChipText}>{c}</Text>
              </View>
            ))}
          </View>

          <View style={styles.submitWrap}>
            <PrimaryButton
              icon={<Feather name="send" size={18} color={Colors.white} />}
              onPress={() => setSent(true)}
            >
              Send Export
            </PrimaryButton>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ExportSuccessView() {
  return (
    <View style={[styles.root, styles.successRoot]}>
      <ScreenBg />
      <View style={styles.successCenter}>
        <View style={styles.successIcon}>
          <Feather name="send" size={36} color={Colors.white} />
        </View>
        <Text style={styles.successTitle}>Export sent</Text>
        <Text style={styles.successBody}>
          We&apos;ve emailed the CSV to{' '}
          <Text style={styles.successEmail}>hello@tuitionaledu.com</Text>. It usually arrives within 2 minutes.
        </Text>
        <View style={styles.fileCard}>
          <View style={styles.fileIcon}>
            <Feather name="mail" size={18} color={Colors.blue2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fileName}>users-export-30Apr.csv</Text>
            <Text style={styles.fileMeta}>238 rows · 14 columns</Text>
          </View>
        </View>
        <View style={{ width: '100%', maxWidth: 320 }}>
          <PrimaryButton onPress={router.back}>Done</PrimaryButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  scroll: { paddingBottom: 60 },
  body: { paddingHorizontal: Spacing.s4 + 3, paddingTop: 10 },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    ...Shadow.input,
  },
  deliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.mainBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryLabel: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  deliveryEmail: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.blue2,
    letterSpacing: LetterSpacing.tight,
    marginTop: 2,
  },
  scopeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: Radius.card,
    marginBottom: 10,
  },
  scopeOff: {
    backgroundColor: Colors.frost75,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderRow,
    ...Shadow.input,
  },
  scopeOn: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.mainBlue,
    shadowColor: Colors.mainBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.borderDash,
  },
  scopeTitle: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  scopeSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
    marginTop: 2,
  },
  colsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  colChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(56,182,255,0.10)',
  },
  colChipText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular14,
    color: Colors.blue2,
    letterSpacing: LetterSpacing.tight,
  },
  submitWrap: { marginTop: 22 },

  // Success state
  successRoot: { justifyContent: 'center' },
  successCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.mainBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Shadow.fab,
  },
  successTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.medium26,
    color: Colors.text,
    letterSpacing: LetterSpacing.normal,
    marginBottom: 10,
  },
  successBody: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize.regular18 * 1.55,
    textAlign: 'center',
    maxWidth: 290,
    marginBottom: 28,
  },
  successEmail: { color: Colors.blue2, fontFamily: Fonts.semibold },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 28,
    ...Shadow.input,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(56,182,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
  },
  fileMeta: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular14,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
