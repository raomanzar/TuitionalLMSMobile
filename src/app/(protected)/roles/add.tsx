import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
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
  Spacing,
} from "@/constants/theme";
import { useCreateRoleMutation } from "@/hooks/modules/roles";

export default function AddRoleScreen() {
  const [name, setName] = useState("");
  const create = useCreateRoleMutation();
  const canSubmit = !!name.trim() && !create.isPending;

  const handleCreate = useCallback(() => {
    if (!canSubmit) return;
    create.mutate(
      { name: name.trim() },
      {
        onSuccess: () => router.back(),
        onError: (err) => {
          const msg = err instanceof Error ? err.message : "Failed to add role";
          Alert.alert("Couldn’t add role", msg);
        },
      },
    );
  }, [canSubmit, name, create]);

  return (
    <View style={styles.root}>
      <ScreenBg />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TopBar
          title="Add Role"
          subtitle="Create a new role"
          onBack={router.back}
          big
        />

        <View style={styles.body}>
          <SectionTitle>Identity</SectionTitle>
          <Field label="Role Name" required>
            <TextField
              value={name}
              onChangeText={setName}
              placeholder="e.g. Tutor Lead"
              autoCapitalize="words"
              autoCorrect={false}
              leading={<Feather name="shield" size={18} color={Colors.textMuted} />}
            />
          </Field>

          <View style={styles.submitWrap}>
            <PrimaryButton
              icon={<Feather name="plus" size={18} color={Colors.white} />}
              disabled={!canSubmit}
              onPress={handleCreate}
            >
              {create.isPending ? "Adding…" : "Add Role"}
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
});
