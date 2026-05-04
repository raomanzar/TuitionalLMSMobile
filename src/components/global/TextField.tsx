import React from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
} from '@/constants/theme';

type Props = TextInputProps & {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
};

/** Single-line input wrapped in a white pill — used across all forms. */
export function TextField({ leading, trailing, style, ...rest }: Props) {
  return (
    <View style={styles.root}>
      {leading ? <View style={styles.icon}>{leading}</View> : null}
      <TextInput
        placeholderTextColor={Colors.textMuted}
        {...rest}
        style={[styles.input, style]}
      />
      {trailing ? <View style={styles.icon}>{trailing}</View> : null}
    </View>
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
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    padding: 0,
    minWidth: 0,
  },
});
