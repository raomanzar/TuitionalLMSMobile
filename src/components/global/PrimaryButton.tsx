import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
} from '@/constants/theme';

type Variant = 'primary' | 'danger' | 'ghost';

type Props = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  /** Smaller height (44 vs 52). */
  small?: boolean;
  style?: ViewStyle;
};

/** Brand CTA — solid primary, danger, or ghost outline. */
export function PrimaryButton({
  children,
  icon,
  onPress,
  disabled,
  variant = 'primary',
  small,
  style,
}: Props) {
  const ghost = variant === 'ghost';
  const danger = variant === 'danger';

  const containerStyle = [
    styles.base,
    { height: small ? 44 : 52 },
    ghost ? styles.ghost : danger ? styles.danger : styles.primary,
    !disabled && !ghost && (danger ? Shadow.fab : styles.shadowPrimary),
    !disabled && ghost && Shadow.input,
    disabled && styles.disabled,
    style,
  ];
  const textColor = ghost ? Colors.blue2 : Colors.white;

  return (
    <Pressable onPress={onPress} disabled={disabled} style={containerStyle}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, { color: textColor }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: Radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: {
    backgroundColor: Colors.mainBlue,
  },
  danger: {
    backgroundColor: Colors.red,
  },
  ghost: {
    backgroundColor: Colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderSoft,
  },
  shadowPrimary: {
    shadowColor: Colors.mainBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: { alignItems: 'center', justifyContent: 'center' },
  label: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular20,
    letterSpacing: LetterSpacing.wide,
  },
});
