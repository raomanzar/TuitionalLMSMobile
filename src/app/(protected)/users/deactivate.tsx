import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { useUserByIdQuery } from '@/hooks/modules/users';
import { useAuthToken } from '@/stores';

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
  const token = useAuthToken();
  const { data: u, isPending, error } = useUserByIdQuery(id, token);
  const [mode, setMode] = useState<Mode>('permanent');
  const [reason, setReason] = useState('');

  if (isPending) {
    return (
      <View style={[styles.root, styles.centerFill]}>
        <ScreenBg />
        <TopBar title="Deactivate User" onBack={router.back} />
        <ActivityIndicator color={Colors.mainBlue} />
      </View>
    );
  }

  if (error || !u) {
    return (
      <View style={[styles.root, styles.centerFill]}>
        <ScreenBg />
        <TopBar title="Deactivate User" onBack={router.back} />
        <Text style={styles.notFoundTitle}>User not found</Text>
        <Pressable onPress={router.back} style={styles.notFoundBtn} hitSlop={8}>
          <Feather name="chevron-left" size={16} color={Colors.blue2} />
          <Text style={styles.notFoundBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

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

          <SectionTitle>
            Reason <Text style={styles.requiredMark}>*</Text>
          </SectionTitle>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Add reason"
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
                disabled={!reason.trim()}
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
  requiredMark: {
    color: Colors.red,
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
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundTitle: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
  },
  notFoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.control,
    backgroundColor: Colors.frost75,
  },
  notFoundBtnText: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.blue2,
    letterSpacing: LetterSpacing.normal,
  },
});
