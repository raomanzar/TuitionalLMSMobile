import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Shadow,
  Spacing,
} from '@/constants/theme';

type Props = {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  message?: string;
};

export function Placeholder({ title, icon, message = 'Coming soon.' }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Feather name={icon} size={36} color={Colors.mainBlue} />
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  header: {
    paddingHorizontal: Spacing.s4 + 1,
    paddingTop: 14,
    paddingBottom: 12,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.medium30,
    color: Colors.text,
    letterSpacing: LetterSpacing.normal,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: Spacing.s5 + 4,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.frost75,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.input,
  },
  message: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
    textAlign: 'center',
  },
});
