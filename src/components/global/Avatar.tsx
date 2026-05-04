import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, LetterSpacing, Shadow } from '@/constants/theme';

type Props = {
  first: string;
  last: string;
  color: string;
  size?: number;
};

export function Avatar({ first, last, color, size = 40 }: Props) {
  const initials = ((first[0] || '') + (last[0] || '')).toUpperCase();
  return (
    <View
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...Shadow.control,
    borderWidth: 1,
    borderColor: Colors.iconBoxFrost,
  },
  text: {
    color: Colors.text,
    fontFamily: Fonts.semibold,
    letterSpacing: LetterSpacing.normal,
  },
});
