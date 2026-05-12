import type { BadgeKind } from "@/components/global";
import { Avatar, Badge } from "@/components/global";
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { type UserDetail } from "@/constants/users";
import { useUserByIdQuery } from "@/hooks/modules/users";
import { useAuthToken } from "@/stores";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function UserDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const token = useAuthToken();
  const { data: u, isPending, error } = useUserByIdQuery(id, token);

  if (isPending) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={Colors.mainBlue} />
      </View>
    );
  }

  if (error || !u) {
    return (
      <View
        style={[styles.root, styles.center, { paddingTop: insets.top + 24 }]}
      >
        <Text style={styles.notFoundTitle}>User not found</Text>
        <Pressable onPress={router.back} style={styles.notFoundBtn} hitSlop={8}>
          <Feather name="chevron-left" size={16} color={Colors.blue2} />
          <Text style={styles.notFoundBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const heroBg = `${u.color}80`;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor: heroBg,
              paddingTop: insets.top + 8,
            },
          ]}
        >
          <View style={styles.heroNav}>
            <Pressable onPress={router.back} style={styles.iconBtn} hitSlop={8}>
              <Feather name="chevron-left" size={20} color={Colors.text} />
            </Pressable>
          </View>

          <View style={styles.heroBody}>
            <Avatar first={u.first} last={u.last} color={u.color} size={88} />
            <Text style={styles.name}>
              {u.first} {u.last}
            </Text>
            <Text style={styles.email}>{u.email}</Text>
            <View style={styles.pillRow}>
              <Badge kind={u.role.toLowerCase() as BadgeKind}>{u.role}</Badge>
              <Badge kind={u.synced ? "synced" : "unsynced"}>
                {u.synced ? "Synced" : "Unsynced"}
              </Badge>
              <Badge kind={u.active ? "active" : "inactive"}>
                {u.active ? "Active" : "Inactive"}
              </Badge>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.actionsCard}>
          <ActionTile
            icon="edit-2"
            color={Colors.orange}
            label="Edit"
            onPress={() =>
              router.push({
                pathname: "/users/edit",
                params: { id: String(u.id) },
              })
            }
          />
          <ActionTile
            icon="trash-2"
            color={Colors.red}
            label="Delete"
            onPress={() =>
              router.push({
                pathname: "/users/delete",
                params: { id: String(u.id) },
              })
            }
          />
          <ActionTile
            icon="slash"
            color={Colors.red1}
            label="Disable"
            onPress={() =>
              router.push({
                pathname: "/users/deactivate",
                params: { id: String(u.id) },
              })
            }
          />
        </View>

        <View style={styles.infoBody}>
          <InfoTab u={u} />
        </View>
      </ScrollView>
    </View>
  );
}

function ActionTile({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Feather name={icon} size={18} color={Colors.white} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function InfoTab({ u }: { u: UserDetail }) {
  return (
    <View style={styles.infoCard}>
      <Row label="User ID" value={`#${u.id}`} mono />
      <Row label="Pseudo Name" value={u.pseudo || "—"} />
      <Row label="Phone" value={u.phone || "—"} />
      <Row label="Country" value={u.country || "—"} />
      <Row label="Country Code" value={u.countryCode || "—"} />
      <Row label="Created" value={u.date || "—"} />
      <Row
        label="Calendar Integration"
        value={u.calendarIntegrationEnabled ? "Enabled" : "Disabled"}
      />
      <Row label="Gender" value={u.gender || "—"} />
    </View>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  scroll: { paddingBottom: 60 },
  center: {
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

  hero: {
    paddingHorizontal: 12,
    paddingBottom: 22,
  },
  heroNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.control,
    backgroundColor: Colors.frost85,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.control,
  },
  heroBody: { alignItems: "center" },
  name: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.regular22,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    marginTop: 12,
  },
  email: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textSecondary,
    letterSpacing: LetterSpacing.tight,
    marginTop: 2,
  },
  pillRow: { flexDirection: "row", gap: 6, marginTop: 10 },

  actionsCard: {
    marginHorizontal: Spacing.s4 + 3,
    marginTop: -10,
    backgroundColor: Colors.white,
    borderRadius: 18,
    flexDirection: "row",
    paddingHorizontal: Spacing.s1,
    paddingVertical: 8,
    marginBottom: 16,
    ...Shadow.card,
  },
  action: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 10,
    gap: 6,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.control,
  },
  actionLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular14,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },

  infoBody: { paddingHorizontal: Spacing.s4 + 3 },

  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    ...Shadow.input,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderRow,
  },
  rowLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.wide,
  },
  rowValue: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    maxWidth: "60%",
  },
  mono: { fontFamily: "Menlo" },
});
