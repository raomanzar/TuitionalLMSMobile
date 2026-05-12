import { PrimaryButton, ScreenBg, TextField } from '@/components/global';
import { BrandMark } from '@/components/ui/auth';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Spacing,
} from '@/constants/theme';
import { useForgotPasswordMutation } from '@/hooks/modules/auth';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const { mutate: requestReset, isPending } = useForgotPasswordMutation();
  const canSubmit = email.trim().length > 0 && !isPending;

  const handleSend = useCallback(() => {
    if (!canSubmit) return;
    const trimmed = email.trim();
    requestReset(
      { email: trimmed },
      {
        onSuccess: (data) => {
          showSuccessToast(data?.message ?? 'Reset code sent to your email.');
          router.push({ pathname: '/password-reset', params: { email: trimmed } });
        },
        onError: (err) =>
          showApiErrorToast(err, 'Unable to send reset code.'),
      },
    );
  }, [canSubmit, email, requestReset]);

  const handleBack = useCallback(() => router.replace('/signin'), []);

  return (
    <View style={styles.root}>
      <ScreenBg />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={handleBack} style={styles.backIconBtn} hitSlop={10}>
            <Feather name="chevron-left" size={20} color={Colors.text} />
          </Pressable>

          <View style={styles.center}>
            <View style={styles.brandRow}>
              <BrandMark size={56} />
            </View>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              To reset your password, enter your email address below.
            </Text>

            <View style={styles.form}>
              <TextField
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="send"
                onSubmitEditing={handleSend}
                autoFocus
                leading={<Feather name="mail" size={18} color={Colors.iconStrong} />}
              />

              <View style={styles.gap} />

              <PrimaryButton onPress={handleSend} disabled={!canSubmit}>
                {isPending ? 'Sending...' : 'Send Code'}
              </PrimaryButton>
            </View>
          </View>

          <Pressable onPress={handleBack} hitSlop={8} style={styles.backLinkRow}>
            <Feather name="arrow-left" size={16} color={Colors.blue2} />
            <Text style={styles.backLinkText}>Back to sign in</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.s5 + 4,
  },
  backIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.frost85,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.s5,
  },
  center: { flex: 1, justifyContent: 'center' },
  brandRow: { alignItems: 'flex-start', marginBottom: Spacing.s5 },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.large32,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
    lineHeight: Math.round(FontSize.regular18 * 1.45),
    marginTop: 8,
    marginBottom: Spacing.s5,
  },
  form: { gap: 0 },
  gap: { height: Spacing.s5 },
  backLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingVertical: Spacing.s3,
    paddingHorizontal: Spacing.s4,
  },
  backLinkText: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.blue2,
    letterSpacing: LetterSpacing.normal,
  },
});
