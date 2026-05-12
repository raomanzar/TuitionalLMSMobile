import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from "@/constants/theme";
import type { Role } from "@/constants/roles";

type Props = {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
};

function RoleCardImpl({ role, onEdit, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBubble, { backgroundColor: role.color }]}>
        <Feather name="shield" size={20} color={Colors.text} />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {role.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>#{role.id}</Text>
          <View style={styles.bullet} />
          <Text style={styles.metaText}>{role.date}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => onEdit(role)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${role.name}`}
          style={({ pressed }) => [
            styles.iconBtn,
            styles.iconBtnEdit,
            pressed && styles.iconBtnPressed,
          ]}
        >
          <Feather name="edit-2" size={18} color={Colors.mainBlue} />
        </Pressable>
        <Pressable
          onPress={() => onDelete(role)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${role.name}`}
          style={({ pressed }) => [
            styles.iconBtn,
            styles.iconBtnDelete,
            pressed && styles.iconBtnPressed,
          ]}
        >
          <Feather name="trash-2" size={18} color={Colors.red} />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Memoized so a parent re-render doesn't re-render every visible card —
 * only the card whose role actually changed.
 */
export const RoleCard = memo(RoleCardImpl);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: Spacing.s3,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    ...Shadow.card,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular20,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    marginBottom: 4,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular14,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.iconMuted,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  // Semantic tints — soft blue for edit, soft red for delete. Matches the icon
  // colour so the action's intent is legible at a glance.
  iconBtnEdit: {
    backgroundColor: Colors.blue5,
  },
  iconBtnDelete: {
    backgroundColor: Colors.redBg,
  },
  iconBtnPressed: {
    opacity: 0.6,
  },
});
