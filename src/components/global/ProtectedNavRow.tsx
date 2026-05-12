import { Colors, Radius, Shadow } from "@/constants/theme";
import { USER_AVATAR_FALLBACK } from "@/constants/users";
import { useAuthUser } from "@/stores";
import { Feather } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  /** Override the default drawer-open behavior. */
  onMenuPress?: () => void;
  /** Override the bell tap. */
  onBellPress?: () => void;
  /** Render the unread dot on the bell. */
  showBellDot?: boolean;
};

/**
 * Shared top-row controls for every protected screen — drawer button on the
 * left, bell + profile image on the right. Screens compose this inside their
 * own animated header so washes, large titles, search, and filter chips stay
 * per-screen while the action icons stay consistent.
 */
export function ProtectedNavRow({
  onMenuPress,
  onBellPress,
  showBellDot = true,
}: Props) {
  const navigation = useNavigation();
  const authUser = useAuthUser();
  const profileImageUri = authUser?.profileImageUrl?.trim() || undefined;

  const handleMenu = useCallback(() => {
    if (onMenuPress) return onMenuPress();
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation, onMenuPress]);

  return (
    <View style={styles.navRow}>
      <Pressable style={styles.iconBtn} onPress={handleMenu} hitSlop={8}>
        <Feather name="menu" size={20} color={Colors.text} />
      </Pressable>
      <View style={styles.navRight}>
        <Pressable style={styles.iconBtn} onPress={onBellPress} hitSlop={8}>
          <Feather name="bell" size={20} color={Colors.text} />
          {showBellDot ? <View style={styles.bellDot} /> : null}
        </Pressable>
        <Image
          source={
            profileImageUri ? { uri: profileImageUri } : USER_AVATAR_FALLBACK
          }
          placeholder={USER_AVATAR_FALLBACK}
          style={styles.profileImage}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
          recyclingKey={profileImageUri ?? "fallback"}
          accessibilityIgnoresInvertColors
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  navRight: {
    flexDirection: "row",
    gap: 8,
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
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: Radius.control,
  },
  bellDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.red,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
});
