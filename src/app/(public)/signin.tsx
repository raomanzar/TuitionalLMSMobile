import { PrimaryButton, ScreenBg, TextField } from "@/components/global";
import { BrandMark } from "@/components/ui/auth";
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Spacing,
} from "@/constants/theme";
import { useSignInMutation } from "@/hooks/modules/auth";
import { showApiErrorToast } from "@/lib/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: signIn, isPending } = useSignInMutation();
  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !isPending;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    signIn(
      { email: email.trim(), password },
      {
        onSuccess: () => router.replace("/users"),
        onError: (err) => showApiErrorToast(err, "Unable to sign in."),
      },
    );
  }, [canSubmit, email, password, signIn]);

  const handleForgot = useCallback(() => {
    router.push("/forgot-password");
  }, []);

  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);

  return (
    <View style={styles.root}>
      <ScreenBg />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.center}>
            <View style={styles.brandRow}>
              <BrandMark size={56} />
            </View>

            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Login to manage your account</Text>

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
                returnKeyType="next"
                leading={
                  <Feather name="mail" size={18} color={Colors.iconStrong} />
                }
              />

              <View style={styles.gap} />

              <TextField
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                leading={
                  <Feather name="lock" size={18} color={Colors.iconStrong} />
                }
                trailing={
                  <Pressable onPress={togglePassword} hitSlop={10}>
                    <Feather
                      name={showPassword ? "eye" : "eye-off"}
                      size={18}
                      color={Colors.iconMuted}
                    />
                  </Pressable>
                }
              />

              <Pressable
                onPress={handleForgot}
                hitSlop={6}
                style={styles.forgotRow}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              <PrimaryButton onPress={handleSubmit} disabled={!canSubmit}>
                {isPending ? "Signing in..." : "Sign in"}
              </PrimaryButton>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerCaption}>Tuitional Edu</Text>
            <View style={styles.dotSep} />
            <Text style={styles.footerCaption}>Learning, made personal</Text>
          </View>
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
  center: { flex: 1, justifyContent: "center" },
  brandRow: { alignItems: "flex-start", marginBottom: Spacing.s5 },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.large34,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.normal,
    marginTop: 6,
    marginBottom: Spacing.s5,
  },
  form: { gap: 0 },
  gap: { height: Spacing.s4 - 1 },
  forgotRow: {
    alignSelf: "flex-end",
    paddingVertical: Spacing.s3,
    paddingHorizontal: 2,
    marginTop: 2,
    marginBottom: Spacing.s4 - 1,
  },
  forgotText: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.blue2,
    letterSpacing: LetterSpacing.normal,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: Spacing.s5,
  },
  dotSep: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.iconMuted,
  },
  footerCaption: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular14,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.wide,
  },
});
