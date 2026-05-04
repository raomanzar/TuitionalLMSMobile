import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
} from '@/constants/theme';

type Props = {
  value?: string;
  placeholder?: string;
  leading?: React.ReactNode;
  onPress?: () => void;
};

/** Visual "select" — looks like a TextField but with a chevron and is pressable. */
export function SelectLook({ value, placeholder, leading, onPress }: Props) {
  const empty = !value;
  return (
    <Pressable onPress={onPress} style={styles.root}>
      {leading ? <View style={styles.icon}>{leading}</View> : null}
      <Text style={[styles.text, empty && styles.placeholder]} numberOfLines={1}>
        {empty ? placeholder : value}
      </Text>
      <Feather name="chevron-down" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: Radius.control,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderRow,
    ...Shadow.input,
  },
  icon: { alignItems: 'center', justifyContent: 'center' },
  text: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  placeholder: { color: '#b3b3b3' },
});
