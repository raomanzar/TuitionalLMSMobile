import { PrimaryButton, ScreenBg } from '@/components/global';
import { BrandMark } from '@/components/ui/auth';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '@/hooks/modules/auth';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function PasswordResetScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(''));
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const inputs = useRef<(TextInput | null)[]>([]);

  const { mutate: verifyToken, isPending: isVerifying } = useResetPasswordMutation();
  const { mutate: resendCode, isPending: isResending } = useForgotPasswordMutation();

  const code = useMemo(() => digits.join(''), [digits]);
  const canSubmit = code.length === CODE_LENGTH && !isVerifying;

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const focusBox = useCallback((i: number) => {
    inputs.current[i]?.focus();
  }, []);

  const handleChange = useCallback(
    (i: number, value: string) => {
      // Sanitize: keep digits only.
      const cleaned = value.replace(/\D/g, '');

      // Paste path — distribute across boxes when more than one digit lands.
      if (cleaned.length > 1) {
        const next = Array(CODE_LENGTH).fill('');
        for (let k = 0; k < CODE_LENGTH; k++) {
          next[k] = cleaned[k] ?? '';
        }
        setDigits(next);
        const lastFilled = Math.min(cleaned.length, CODE_LENGTH) - 1;
        focusBox(Math.min(lastFilled + 1, CODE_LENGTH - 1));
        return;
      }

      setDigits((prev) => {
        const copy = [...prev];
        copy[i] = cleaned;
        return copy;
      });

      if (cleaned && i < CODE_LENGTH - 1) focusBox(i + 1);
    },
    [focusBox],
  );

  const handleKey = useCallback(
    (i: number, key: string) => {
      if (key !== 'Backspace') return;
      setDigits((prev) => {
        if (prev[i]) {
          const copy = [...prev];
          copy[i] = '';
          return copy;
        }
        if (i > 0) {
          const copy = [...prev];
          copy[i - 1] = '';
          focusBox(i - 1);
          return copy;
        }
        return prev;
      });
    },
    [focusBox],
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    if (!email) {
      showApiErrorToast(
        null,
        'Missing email. Please restart the reset flow.',
        'Cannot verify code',
      );
      return;
    }
    verifyToken(
      { email, token: code },
      {
        onSuccess: () => {
          router.push({
            pathname: '/confirm-password',
            params: { email, token: code },
          });
        },
        onError: (err) =>
          showApiErrorToast(err, 'Invalid or expired code.'),
      },
    );
  }, [canSubmit, code, email, verifyToken]);

  const handleResend = useCallback(() => {
    if (resendIn > 0 || isResending) return;
    if (!email) {
      showApiErrorToast(
        null,
        'Missing email. Please restart the reset flow.',
        'Cannot resend code',
      );
      return;
    }
    resendCode(
      { email },
      {
        onSuccess: (data) => {
          showSuccessToast(data?.message ?? 'A new code has been sent.');
          setResendIn(RESEND_SECONDS);
        },
        onError: (err) =>
          showApiErrorToast(err, 'Unable to resend code.'),
      },
    );
  }, [email, isResending, resendCode, resendIn]);

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

            <Text style={styles.title}>Password Reset</Text>
            <Text style={styles.subtitle}>
              We sent a code to{' '}
              {email ? <Text style={styles.email}>{email}</Text> : <Text style={styles.email}>your email</Text>}.
              Enter the code below to reset your password.
            </Text>

            <View style={styles.codeRow}>
              {digits.map((d, i) => {
                const focused = d.length === 0 && i === digits.findIndex((x) => x === '');
                return (
                  <View
                    key={i}
                    style={[
                      styles.codeBox,
                      d ? styles.codeBoxFilled : null,
                      focused ? styles.codeBoxFocused : null,
                    ]}
                  >
                    <TextInput
                      ref={(el) => {
                        inputs.current[i] = el;
                      }}
                      value={d}
                      onChangeText={(v) => handleChange(i, v)}
                      onKeyPress={(e) => handleKey(i, e.nativeEvent.key)}
                      keyboardType="number-pad"
                      inputMode="numeric"
                      maxLength={CODE_LENGTH}
                      textContentType="oneTimeCode"
                      autoComplete="sms-otp"
                      selectTextOnFocus
                      style={styles.codeInput}
                      caretHidden
                    />
                  </View>
                );
              })}
            </View>

            <View style={styles.resendRow}>
              <Text style={styles.resendCaption}>Didn&apos;t receive a code?</Text>
              <Pressable
                onPress={handleResend}
                disabled={resendIn > 0 || isResending}
                hitSlop={6}
              >
                <Text style={[styles.resendLink, (resendIn > 0 || isResending) && styles.resendLinkOff]}>
                  {isResending ? 'Sending...' : resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend'}
                </Text>
              </Pressable>
            </View>

            <PrimaryButton onPress={handleSubmit} disabled={!canSubmit}>
              {isVerifying ? 'Verifying...' : 'Continue'}
            </PrimaryButton>
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
    ...Shadow.control,
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
  email: {
    fontFamily: Fonts.semibold,
    color: Colors.blue2,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: Spacing.s4 + 1,
  },
  codeBox: {
    flex: 1,
    height: 56,
    borderRadius: Radius.control + 2,
    backgroundColor: Colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderRow,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.input,
  },
  codeBoxFilled: {
    borderColor: Colors.blue2,
    borderWidth: 1.5,
  },
  codeBoxFocused: {
    borderColor: Colors.mainBlue,
    borderWidth: 1.5,
  },
  codeInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontFamily: Fonts.bold,
    fontSize: FontSize.medium26,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    padding: 0,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.s5 + 2,
  },
  resendCaption: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
  },
  resendLink: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.blue2,
    letterSpacing: LetterSpacing.normal,
  },
  resendLinkOff: {
    color: Colors.iconMuted,
  },
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
