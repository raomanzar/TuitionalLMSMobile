import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  Field,
  PrimaryButton,
  ScreenBg,
  SectionTitle,
  TextField,
  TopBar,
} from "@/components/global";
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Spacing,
} from "@/constants/theme";
import { useRoleByIdQuery, useUpdateRoleMutation } from "@/hooks/modules/roles";
import { useAuthToken } from "@/stores";
import type { Role } from "@/constants/roles";

export default function EditRoleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const token = useAuthToken();
  const { data: r, isPending, error } = useRoleByIdQuery(id, token);

  if (isPending) {
    return (
      <View style={[styles.root, styles.centerFill]}>
        <ScreenBg />
        <TopBar title="Edit Role" onBack={router.back} />
        <ActivityIndicator color={Colors.mainBlue} />
      </View>
    );
  }

  if (error || !r) {
    return (
      <View style={[styles.root, styles.centerFill]}>
        <ScreenBg />
        <TopBar title="Edit Role" onBack={router.back} />
        <Text style={styles.notFoundTitle}>Role not found</Text>
        <Pressable onPress={router.back} style={styles.notFoundBtn} hitSlop={8}>
          <Feather name="chevron-left" size={16} color={Colors.blue2} />
          <Text style={styles.notFoundBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  // Form is mounted only once `r` is real — its `useState` initializers see
  // the API value, not a placeholder, so the input renders pre-filled.
  return <EditRoleForm role={r} id={id} />;
}

function EditRoleForm({ role: r, id }: { role: Role; id?: string }) {
  const [name, setName] = useState(r.name);
  const update = useUpdateRoleMutation();
  const canSubmit = !!id && !!name.trim() && !update.isPending;

  const handleUpdate = useCallback(() => {
    if (!canSubmit || !id) return;
    update.mutate(
      { id, name: name.trim() },
      {
        onSuccess: () => router.back(),
        onError: (err) => {
          const msg =
            err instanceof Error ? err.message : "Failed to update role";
          Alert.alert("Couldn’t update role", msg);
        },
      },
    );
  }, [canSubmit, id, name, update]);

  return (
    <View style={styles.root}>
      <ScreenBg />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TopBar
          title="Edit Role"
          subtitle={`#${r.id}`}
          onBack={router.back}
          big
        />

        <View style={styles.body}>
          <SectionTitle>Identity</SectionTitle>
          <Field label="Role Name" required>
            <TextField
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              leading={<Feather name="shield" size={18} color={Colors.textMuted} />}
            />
          </Field>

          <View style={styles.submitWrap}>
            <PrimaryButton
              icon={<Feather name="check" size={18} color={Colors.white} />}
              disabled={!canSubmit}
              onPress={handleUpdate}
            >
              {update.isPending ? "Updating…" : "Update"}
            </PrimaryButton>
          </View>
          <View style={styles.cancelWrap}>
            <PrimaryButton variant="ghost" onPress={router.back}>
              Cancel
            </PrimaryButton>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  scroll: { paddingBottom: 60 },
  body: { paddingHorizontal: Spacing.s4 + 3 },
  submitWrap: { marginTop: 18 },
  cancelWrap: { marginTop: 10 },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  notFoundTitle: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
  },
  notFoundBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.control,
    backgroundColor: Colors.frost75,
  },
  notFoundBtnText: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.blue2,
    letterSpacing: LetterSpacing.normal,
  },
});
