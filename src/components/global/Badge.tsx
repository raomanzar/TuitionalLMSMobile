import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, FontSize, LetterSpacing, Radius } from '@/constants/theme';

export type BadgeKind =
  | 'student'
  | 'teacher'
  | 'admin'
  | 'parent'
  | 'synced'
  | 'unsynced'
  | 'active'
  | 'inactive'
  | 'pending';

const PALETTE: Record<BadgeKind, { bg: string; fg: string }> = {
  student:  { bg: Colors.greenBg,   fg: Colors.greenTextDark },
  teacher:  { bg: Colors.purpleBg,  fg: Colors.purpleText },
  admin:    { bg: Colors.blue4,     fg: Colors.blue3 },
  parent:   { bg: Colors.orangeBg,  fg: Colors.orangeText },
  synced:   { bg: Colors.greenBg,   fg: Colors.greenTextDark },
  unsynced: { bg: Colors.redBg,     fg: Colors.redText },
  active:   { bg: Colors.greenBg,   fg: Colors.greenTextDark },
  inactive: { bg: Colors.border,    fg: Colors.textSecondary },
  pending:  { bg: 'rgb(249,231,159)', fg: 'rgb(140,80,0)' },
};

export function Badge({ children, kind }: { children: React.ReactNode; kind: BadgeKind }) {
  const c = PALETTE[kind] ?? { bg: Colors.border, fg: Colors.text };
  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.chip,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    letterSpacing: LetterSpacing.normal,
  },
});
