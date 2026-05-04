import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  title: string;
  subtitle?: string;
  onBack?: () => void;
  trailing?: React.ReactNode;
  /** When true, renders an iOS-style large title under the nav row. */
  big?: boolean;
};

/**
 * App top bar — back button + (centered) title + trailing slot.
 *
 * Intentionally renders no border / divider so screens flow into the
 * scrolling content cleanly.
 */
export function TopBar({ title, subtitle, onBack, trailing, big }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.navRow}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={8}>
            <Feather name="chevron-left" size={20} color={Colors.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
        {!big && (
          <Text style={styles.titleCompact} numberOfLines={1}>
            {title}
          </Text>
        )}
        <View style={styles.trailing}>{trailing}</View>
      </View>

      {big && (
        <View style={styles.bigWrap}>
          <Text style={styles.titleBig}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.control,
    backgroundColor: Colors.frost75,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.control,
  },
  titleCompact: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 12,
    fontFamily: Fonts.bold,
    fontSize: FontSize.regular20,
    color: Colors.text,
    letterSpacing: LetterSpacing.normal,
  },
  trailing: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
  bigWrap: {
    paddingHorizontal: Spacing.s4 + 3,
    paddingTop: 10,
  },
  titleBig: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.medium28,
    color: Colors.text,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.medium28 + 4,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
    marginTop: 6,
  },
});
