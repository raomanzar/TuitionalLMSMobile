import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  Avatar,
  Badge,
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
import type { BadgeKind } from '@/components/global';
import { USERS } from '@/constants/users';

const FALLBACK = {
  first: 'Diego',
  last: 'Acuña',
  email: 'swirlywhirly27@gmail.com',
  role: 'Student' as const,
  color: '#FFD3B6',
};

const REASONS = ['Graduated', 'Left school', 'Policy violation', 'Duplicate account', 'Inactive 90+ days'];

type Mode = 'permanent' | 'temporary';
type ModeOption = {
  id: Mode;
  title: string;
  sub: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  color: string;
};

const MODE_OPTIONS: ModeOption[] = [
  { id: 'permanent', title: 'Permanently', sub: 'Account is disabled indefinitely', icon: 'slash', color: Colors.red1 },
  { id: 'temporary', title: 'Temporarily', sub: 'Re-activate later from user actions', icon: 'power', color: Colors.blue2 },
];

export default function Deactivate() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const user = id ? USERS.find((x) => String(x.id) === id) : undefined;
  const u = user ?? FALLBACK;
  const [mode, setMode] = useState<Mode>('permanent');
  const [reason, setReason] = useState('');

  return (
    <View style={styles.root}>
      <ScreenBg />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TopBar title="Deactivate User" subtitle="Remove access to the LMS" onBack={router.back} big />

        <View style={styles.body}>
          {/* User pill */}
          <View style={styles.userPill}>
            <Avatar first={u.first} last={u.last} color={u.color} size={44} />
            <View style={styles.userPillBody}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>
                  {u.first} {u.last}
                </Text>
                <Badge kind={u.role.toLowerCase() as BadgeKind}>{u.role}</Badge>
              </View>
              <Text style={styles.userEmail} numberOfLines={1}>
                {u.email}
              </Text>
            </View>
          </View>

          {/* Warning */}
          <View style={styles.warning}>
            <Feather name="alert-triangle" size={20} color="#cc5500" />
            <Text style={styles.warningText}>
              The user will lose access immediately.{' '}
              <Text style={styles.warningBold}>Permanent</Text> deactivation cannot be undone without admin restore.
            </Text>
          </View>

          <SectionTitle>Type</SectionTitle>
          <View style={styles.modeList}>
            {MODE_OPTIONS.map((opt) => {
              const on = mode === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setMode(opt.id)}
                  style={[styles.modeCard, on && { borderColor: opt.color, borderWidth: 2 }]}
                >
                  <View style={[styles.modeIcon, { backgroundColor: on ? opt.color : Colors.dim08 }]}>
                    <Feather name={opt.icon} size={18} color={on ? Colors.white : Colors.textMuted} />
                  </View>
                  <View style={styles.modeBody}>
                    <Text style={styles.modeTitle}>{opt.title}</Text>
                    <Text style={styles.modeSub}>{opt.sub}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      on && { borderColor: opt.color, borderWidth: 6, backgroundColor: Colors.white },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>

          <SectionTitle>Reason</SectionTitle>
          <View style={styles.chipRow}>
            {REASONS.map((c) => {
              const on = reason === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setReason(c)}
                  style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                >
                  <Text style={[styles.chipText, { color: on ? Colors.white : Colors.textSecondary }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Add details (optional)…"
            placeholderTextColor={Colors.textMuted}
            multiline
            style={styles.textarea}
          />

          <View style={styles.footerRow}>
            <View style={{ flex: 1 }}>
              <PrimaryButton variant="ghost" onPress={router.back}>
                Cancel
              </PrimaryButton>
            </View>
            <View style={{ flex: 1.4 }}>
              <PrimaryButton
                icon={<Feather name="slash" size={18} color={Colors.white} />}
                variant={mode === 'permanent' ? 'danger' : 'primary'}
                onPress={router.back}
              >
                Deactivate
              </PrimaryButton>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  scroll: { paddingBottom: 60 },
  body: { paddingHorizontal: Spacing.s4 + 3, paddingTop: 10 },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.card,
    marginBottom: 18,
    ...Shadow.input,
  },
  userPillBody: { flex: 1, minWidth: 0 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular20,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  userEmail: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
    marginTop: 2,
  },
  warning: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,165,0,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,165,0,0.25)',
    borderRadius: Radius.card,
    marginBottom: 22,
  },
  warningText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: '#7a4400',
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize.regular16 * 1.5,
  },
  warningBold: {
    fontFamily: Fonts.semibold,
  },
  modeList: { gap: 10, marginBottom: 18 },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.card,
    backgroundColor: Colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderRow,
    ...Shadow.input,
  },
  modeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBody: { flex: 1 },
  modeTitle: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  modeSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.borderDash,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  chipOn: { backgroundColor: Colors.mainBlue },
  chipOff: {
    backgroundColor: Colors.frost70,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderSoft,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    letterSpacing: LetterSpacing.tight,
  },
  textarea: {
    minHeight: 100,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderRow,
    ...Shadow.input,
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    textAlignVertical: 'top',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
});
