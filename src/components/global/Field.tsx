import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
} from '@/constants/theme';

type Props = {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ label, required, hint, error, children }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>
        {label.toUpperCase()}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      {children}
      {(error || hint) && (
        <Text style={[styles.hint, error ? styles.error : null]}>{error || hint}</Text>
      )}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={sectionStyles.root}>{children}</Text>;
}

const styles = StyleSheet.create({
  root: { marginBottom: 14 },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    color: Colors.textSecondary,
    letterSpacing: LetterSpacing.wide,
    marginBottom: 6,
  },
  req: { color: Colors.red },
  hint: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular14,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
    marginTop: 5,
    paddingHorizontal: 2,
  },
  error: { color: Colors.red1 },
});

const sectionStyles = StyleSheet.create({
  root: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.body,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 10,
  },
});
