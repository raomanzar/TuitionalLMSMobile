import {
  Avatar,
  Field,
  PrimaryButton,
  ScreenBg,
  SectionTitle,
  SelectLook,
  TextField,
  TopBar,
} from "@/components/global";
import { DialCodePickerModal, RolePickerModal } from "@/components/ui/users";
import {
  DEFAULT_DIAL_CODE_ENTRY,
  type DialCode,
  findDialByIso,
  stripDialDigits,
} from "@/constants/dialCodes";
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from "@/constants/theme";
import type { UserDetail } from "@/constants/users";
import { useRolesQuery } from "@/hooks/modules/roles";
import { useUpdateUserMutation, useUserByIdQuery } from "@/hooks/modules/users";
import {
  showApiErrorToast,
  showInfoToast,
  showSuccessToast,
} from "@/lib/toast";
import { useAuthToken } from "@/stores";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Friendly status / sync labels mirrored to the boolean payload values.
const STATUS_OPTIONS = ["Active", "Inactive"] as const;
const SYNC_OPTIONS = ["Synced", "Unsynced"] as const;

export default function EditUser() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const token = useAuthToken();
  const { data: u, isPending, error } = useUserByIdQuery(id, token);

  if (isPending) {
    return (
      <View style={[styles.root, styles.centerFill]}>
        <ScreenBg />
        <TopBar title="Edit User" onBack={router.back} />
        <ActivityIndicator color={Colors.mainBlue} />
      </View>
    );
  }

  if (error || !u) {
    return (
      <View style={[styles.root, styles.centerFill]}>
        <ScreenBg />
        <TopBar title="Edit User" onBack={router.back} />
        <Text style={styles.notFoundTitle}>User not found</Text>
        <Pressable onPress={router.back} style={styles.notFoundBtn} hitSlop={8}>
          <Feather name="chevron-left" size={16} color={Colors.blue2} />
          <Text style={styles.notFoundBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  // Form is mounted only once `u` is real — its `useState` initializers see
  // the API values, not placeholders, so the inputs render pre-filled.
  return <EditUserForm user={u} id={id} />;
}

function EditUserForm({ user: u, id }: { user: UserDetail; id?: string }) {
  const token = useAuthToken();
  const [name, setName] = useState(`${u.first} ${u.last}`.trim());
  const [email, setEmail] = useState(u.email);
  const [pseudo, setPseudo] = useState(u.pseudo);
  const [profileImageUrl, setProfileImageUrl] = useState(
    u.profileImageUrl ?? "",
  );
  // Pre-fill: look up the dial entry by stored ISO code, fall back to UAE
  // default if the stored code is empty/unknown. Then strip the dial digits
  // from the stored full phone so the input shows only the local part.
  const initialDial = findDialByIso(u.countryCode) ?? DEFAULT_DIAL_CODE_ENTRY;
  const [dial, setDial] = useState<DialCode>(initialDial);
  const [phone, setPhone] = useState(
    stripDialDigits(u.phone, initialDial.dial),
  );
  const [dialPickerOpen, setDialPickerOpen] = useState(false);
  const [roleId, setRoleId] = useState<number | null>(u.roleId);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [ticket, setTicket] = useState(u.ticket);
  // UI labels are friendly strings; payload uses booleans (see handleUpdate).
  const [status, setStatus] = useState<"Active" | "Inactive">(
    u.active ? "Active" : "Inactive",
  );
  const [sync, setSync] = useState<"Synced" | "Unsynced">(
    u.synced ? "Synced" : "Unsynced",
  );

  const rolesQuery = useRolesQuery(token);
  const roles = rolesQuery.data ?? [];

  // Backend rule: `ticket` is mandatory when role is Student. Roles are dynamic
  // so we identify Student by case-insensitive name match against the picked role.
  const selectedRoleName = roles.find((r) => r.id === roleId)?.name ?? "";
  const isStudentRole = selectedRoleName.toLowerCase() === "student";

  // Drives the SelectLook placeholder when the role list is in a non-ready state.
  const rolePlaceholder = rolesQuery.isPending
    ? "Loading roles…"
    : rolesQuery.isError
      ? "Couldn't load roles · tap to retry"
      : roles.length === 0
        ? "No roles available"
        : "Select user type";

  const update = useUpdateUserMutation();
  const numericId = id ? Number(id) : NaN;

  const handleUpdate = useCallback(() => {
    // No field validation — fields are pre-filled from the API, so an
    // unmodified submit just persists the current snapshot. Only the technical
    // checks (parseable id, role still selected) gate the call. If the user
    // edits a field invalidly the backend toast will surface the rejection.
    if (!Number.isFinite(numericId)) {
      showInfoToast("Invalid user id", "Missing field");
      return;
    }
    if (roleId === null) {
      showInfoToast("User type is required", "Missing field");
      return;
    }
    // Backend contract:
    //   country_code → ISO alpha-2 (e.g. "PK")
    //   phone_number → dial digits + local digits (e.g. "923390747464")
    const localDigits = phone.trim().replace(/\D/g, "");
    const dialDigits = dial.dial.replace(/\D/g, "");
    const fullPhone = localDigits ? `${dialDigits}${localDigits}` : "";

    update.mutate(
      {
        id: numericId,
        name: name.trim(),
        email: email.trim(),
        roleId,
        pseudo_name: pseudo,
        profileImageUrl,
        status: status === "Active",
        isSync: sync === "Synced",
        // Only ship country_code + phone alongside an actual phone — sending
        // them for an empty phone would just store the dial prefix as the number.
        country_code: localDigits ? dial.code : undefined,
        phone_number: fullPhone || undefined,
        // Only ship `ticket` for Student-role users — backend rejects it
        // otherwise and requires it when present.
        ...(isStudentRole ? { ticket: ticket.trim() } : {}),
      },
      {
        onSuccess: () => {
          showSuccessToast("User updated successfully.");
          // Replace so the back stack collapses to /users — and the list query
          // refetches automatically because the mutation invalidates `usersQueryKeys.all`.
          router.replace("/users");
        },
        onError: (err) => {
          showApiErrorToast(
            err,
            "Failed to update user",
            "Couldn't update user",
          );
        },
      },
    );
  }, [
    numericId,
    name,
    email,
    roleId,
    pseudo,
    profileImageUrl,
    status,
    sync,
    phone,
    dial,
    isStudentRole,
    ticket,
    update,
  ]);

  return (
    <View style={styles.root}>
      <ScreenBg />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TopBar
          title="Edit User"
          subtitle="Update account details and role"
          onBack={router.back}
          big
        />

        <View style={styles.avatarWrap}>
          <Avatar first={u.first} last={u.last} color={u.color} size={96} />
          <Pressable style={styles.editBtn}>
            <Feather name="edit-2" size={14} color={Colors.white} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <SectionTitle>Identity</SectionTitle>
          <Field label="Full Name" required>
            <TextField
              value={name}
              onChangeText={setName}
              leading={
                <Feather name="user" size={18} color={Colors.textMuted} />
              }
            />
          </Field>
          <Field label="Email Address" required>
            <TextField
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leading={
                <Feather name="mail" size={18} color={Colors.textMuted} />
              }
            />
          </Field>
          <Field label="Pseudo Name" hint="Display name shown in the LMS">
            <TextField
              value={pseudo}
              onChangeText={setPseudo}
              placeholder="Enter pseudo name"
            />
          </Field>
          <Field
            label="Profile Image URL"
            hint="Direct link to the avatar image"
          >
            <TextField
              value={profileImageUrl}
              onChangeText={setProfileImageUrl}
              placeholder="https://..."
              autoCapitalize="none"
              keyboardType="url"
              leading={
                <Feather name="image" size={18} color={Colors.textMuted} />
              }
            />
          </Field>

          <SectionTitle>Profile</SectionTitle>
          <Field label="Role" required>
            <SelectLook
              value={selectedRoleName}
              placeholder={rolePlaceholder}
              leading={
                <Feather name="users" size={18} color={Colors.textMuted} />
              }
              onPress={() => {
                if (rolesQuery.isError) {
                  rolesQuery.refetch();
                }
                setRolePickerOpen(true);
              }}
            />
          </Field>
          {isStudentRole && (
            <Field
              label="Ticket"
              required
              hint="Numeric ticket count, e.g. 100"
            >
              <TextField
                value={ticket}
                onChangeText={setTicket}
                placeholder="100"
                keyboardType="number-pad"
                leading={
                  <Feather name="hash" size={18} color={Colors.textMuted} />
                }
              />
            </Field>
          )}
          <Field label="Status">
            <Chips
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
            />
          </Field>
          <Field label="Sync">
            <Chips options={SYNC_OPTIONS} value={sync} onChange={setSync} />
          </Field>
          <Field label="Phone Number">
            <View style={styles.phoneRow}>
              <Pressable
                style={styles.dial}
                onPress={() => setDialPickerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Select country code"
              >
                <Text style={styles.dialText}>
                  {dial.flag} {dial.dial}
                </Text>
                <Feather name="chevron-down" size={14} color={Colors.text} />
              </Pressable>
              <View style={styles.phoneInputWrap}>
                <TextField
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="50 123 4567"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </Field>

          <View style={styles.submitWrap}>
            <PrimaryButton
              icon={<Feather name="check" size={18} color={Colors.white} />}
              disabled={update.isPending}
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

      <DialCodePickerModal
        open={dialPickerOpen}
        value={dial.code}
        onClose={() => setDialPickerOpen(false)}
        onSelect={setDial}
      />

      <RolePickerModal
        open={rolePickerOpen}
        onClose={() => setRolePickerOpen(false)}
        roles={roles}
        selectedId={roleId}
        onSelect={setRoleId}
        isLoading={rolesQuery.isPending}
        isError={rolesQuery.isError}
        onRetry={rolesQuery.refetch}
      />
    </View>
  );
}

/**
 * Generic single-select chip row used by the Status / Sync pickers. Mirror of
 * the helper in add.tsx — keep in sync.
 */
function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((opt) => {
        const on = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
          >
            <Text
              style={[
                styles.chipText,
                { color: on ? Colors.white : Colors.text },
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  scroll: { paddingBottom: 60 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
  },
  chipOn: { backgroundColor: Colors.mainBlue },
  chipOff: {
    backgroundColor: Colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    letterSpacing: LetterSpacing.normal,
  },
  avatarWrap: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 22,
  },
  editBtn: {
    position: "absolute",
    right: "38%",
    bottom: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.mainBlue,
    borderWidth: 2,
    borderColor: Colors.surfaceTint,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.fab,
  },
  body: { paddingHorizontal: Spacing.s4 + 3 },
  phoneRow: { flexDirection: "row", gap: 8 },
  dial: {
    width: 92,
    height: 48,
    borderRadius: Radius.control,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderRow,
    ...Shadow.input,
  },
  dialText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  phoneInputWrap: { flex: 1 },
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
