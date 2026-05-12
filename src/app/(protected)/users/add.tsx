import {
  Field,
  PrimaryButton,
  ScreenBg,
  SectionTitle,
  SelectLook,
  TextField,
  TopBar,
} from "@/components/global";
import { DialCodePickerModal, RolePickerModal } from "@/components/ui/users";
import { DEFAULT_DIAL_CODE_ENTRY, type DialCode } from "@/constants/dialCodes";
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useRolesQuery } from "@/hooks/modules/roles";
import { useCreateUserMutation } from "@/hooks/modules/users";
import {
  showApiErrorToast,
  showInfoToast,
  showSuccessToast,
} from "@/lib/toast";
import { useAuthToken } from "@/stores";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg"] as const;

// Gender is open per the /signUp spec (`gender: string`); the API doesn't
// enumerate values so we expose the two the product currently supports.
const GENDER_OPTIONS = ["Male", "Female"] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = (e: string) => EMAIL_RE.test(e.trim());

const extensionFromUri = (uri: string): string => {
  const cleaned = uri.split("?")[0].split("#")[0];
  const dot = cleaned.lastIndexOf(".");
  return dot >= 0 ? cleaned.slice(dot + 1).toLowerCase() : "";
};

export default function AddUser() {
  const token = useAuthToken();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [hide, setHide] = useState(true);
  const [gender, setGender] = useState<(typeof GENDER_OPTIONS)[number] | "">(
    "",
  );
  const [phone, setPhone] = useState("");
  const [dial, setDial] = useState<DialCode>(DEFAULT_DIAL_CODE_ENTRY);
  const [dialPickerOpen, setDialPickerOpen] = useState(false);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [ticket, setTicket] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

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

  const create = useCreateUserMutation();

  const handlePickImage = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showInfoToast(
        "Enable photo access in Settings to set a profile picture.",
        "Permission needed",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset?.uri) return;

    // Format guard — even with mediaTypes:'images', some pickers can return
    // .heic / .gif / odd extensions. Whitelist what the backend accepts.
    const fileName = asset.fileName ?? asset.uri;
    const ext = extensionFromUri(fileName);
    const isAllowed = (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(
      ext,
    );

    if (!isAllowed) {
      showInfoToast(
        `Profile picture must be ${ALLOWED_IMAGE_EXTENSIONS.join(" / ")}. Got "${ext || "unknown"}".`,
        "Unsupported format",
      );
      return;
    }

    setImageUri(asset.uri);
  }, []);

  /**
   * Returns the first failing field's message, or null if everything is valid.
   * The submit handler toasts this so the user always knows *why* their tap
   * didn't go through.
   */
  const getValidationError = useCallback((): string | null => {
    if (!name.trim()) return "Full name is required";
    if (!isEmailValid(email)) return "A valid email is required";
    if (pw.length < 8) return "Password must be at least 8 characters";
    if (!gender) return "Gender is required";
    if (roleId === null) return "User type is required";
    if (!phone.trim()) return "Phone number is required";
    // if (!imageUri) return "Profile picture is required";
    if (isStudentRole && !ticket.trim())
      return "Ticket is required for Student";
    return null;
  }, [name, email, pw, gender, roleId, phone, isStudentRole, ticket]);

  const handleSubmit = useCallback(() => {
    const validationError = getValidationError();
    if (validationError) {
      showInfoToast(validationError, "Missing field");
      return;
    }
    // Non-null assertions below are safe because getValidationError() passed.
    const ext = extensionFromUri(imageUri!) || "jpg";
    const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    const profileImage = { uri: imageUri!, name: `profile.${ext}`, type: mime };

    // Backend contract:
    //   country_code → ISO alpha-2 (e.g. "PK")
    //   phone_number → dial digits + local digits (e.g. "923390747464")
    const dialDigits = dial.dial.replace(/\D/g, "");
    const localDigits = phone.trim().replace(/\D/g, "");

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password: pw,
      roleId: roleId!,
      gender,
      country_code: dial.code,
      phone_number: `${dialDigits}${localDigits}`,
      profileImage,
      // Only ship `ticket` for Student-role users — backend rejects it otherwise
      // and requires it when present.
      ...(isStudentRole ? { ticket: ticket.trim() } : {}),
    };

    create.mutate(payload, {
      onSuccess: () => {
        showSuccessToast("User created successfully.");
        // Replace so the back stack collapses to /users — and the list query
        // refetches automatically because the mutation invalidates `usersQueryKeys.all`.
        router.replace("/users");
      },
      onError: (err) => {
        showApiErrorToast(err, "Failed to create user", "Couldn't create user");
      },
    });
  }, [
    getValidationError,
    name,
    email,
    pw,
    roleId,
    gender,
    phone,
    dial,
    imageUri,
    isStudentRole,
    ticket,
    create,
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
          title="Add New User"
          subtitle="Fill out the form in order to create the user"
          onBack={router.back}
          big
        />

        <View style={styles.avatarWrap}>
          <Pressable
            onPress={handlePickImage}
            style={styles.avatar}
            accessibilityRole="button"
            accessibilityLabel="Choose profile picture"
            hitSlop={8}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <Feather name="user" size={42} color={Colors.blue2} />
            )}
          </Pressable>
          <Pressable
            style={styles.cameraBtn}
            onPress={handlePickImage}
            accessibilityRole="button"
            accessibilityLabel="Choose profile picture"
            hitSlop={8}
          >
            <Feather name="camera" size={15} color={Colors.white} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <SectionTitle>Account</SectionTitle>
          <Field label="Full Name" required>
            <TextField
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              leading={
                <Feather name="user" size={18} color={Colors.textMuted} />
              }
            />
          </Field>
          <Field label="Email Address" required>
            <TextField
              value={email}
              onChangeText={setEmail}
              placeholder="name@school.edu"
              keyboardType="email-address"
              autoCapitalize="none"
              leading={
                <Feather name="mail" size={18} color={Colors.textMuted} />
              }
            />
          </Field>
          <Field label="Password" required hint="Minimum 8 characters">
            <TextField
              value={pw}
              onChangeText={setPw}
              placeholder="Enter password"
              secureTextEntry={hide}
              leading={
                <Feather name="lock" size={18} color={Colors.textMuted} />
              }
              trailing={
                <Pressable onPress={() => setHide((h) => !h)} hitSlop={6}>
                  <Feather
                    name={hide ? "eye" : "eye-off"}
                    size={18}
                    color={Colors.textMuted}
                  />
                </Pressable>
              }
            />
          </Field>

          <SectionTitle>Profile</SectionTitle>
          <Field label="User Type" required>
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
          <Field label="Gender" required>
            <Chips
              options={GENDER_OPTIONS}
              value={gender}
              onChange={setGender}
            />
          </Field>
          <Field label="Phone Number" required>
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
              icon={<Feather name="plus" size={18} color={Colors.white} />}
              disabled={create.isPending}
              onPress={handleSubmit}
            >
              {create.isPending ? "Adding…" : "Add User"}
            </PrimaryButton>
          </View>
          <Text style={styles.footnote}>
            User will appear as{" "}
            <Text style={styles.footnoteAccent}>Not Synced</Text> until they log
            in via Google.
          </Text>
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
 * Generic single-select chip row used by the Gender picker. If a third caller
 * appears outside this file, lift to `@/components/global`.
 */
function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T | "";
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.blue4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.blue3,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.frost50,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarHint: {
    marginTop: 10,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular14,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
  },
  cameraBtn: {
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
  footnote: {
    textAlign: "center",
    marginTop: 12,
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular14,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
  },
  footnoteAccent: {
    color: Colors.red1,
    fontFamily: Fonts.semibold,
  },
});
