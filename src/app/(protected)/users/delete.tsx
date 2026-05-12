import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  Avatar,
  Badge,
  PrimaryButton,
  ScreenBg,
  TopBar,
} from '@/components/global';
import { useDeleteUserMutation, useUserByIdQuery } from '@/hooks/modules/users';
import { useAuthToken } from '@/stores';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
} from '@/constants/theme';
import type { BadgeKind } from '@/components/global';

export default function DeleteUser() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const token = useAuthToken();
  const { data: u, isPending, error } = useUserByIdQuery(id, token);

  const del = useDeleteUserMutation();
  const handleDelete = useCallback(() => {
    if (!id) return;
    del.mutate(
      { id },
      {
        onSuccess: () => router.back(),
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Failed to delete user';
          Alert.alert("Couldn't delete user", msg);
        },
      },
    );
  }, [id, del]);

  if (isPending) {
    return (
      <View style={[styles.root, styles.centerFill]}>
        <ScreenBg />
        <View style={styles.topAbsolute}>
          <TopBar title="Delete User" onBack={router.back} />
        </View>
        <ActivityIndicator color={Colors.mainBlue} />
      </View>
    );
  }

  if (error || !u) {
    return (
      <View style={[styles.root, styles.centerFill]}>
        <ScreenBg />
        <View style={styles.topAbsolute}>
          <TopBar title="Delete User" onBack={router.back} />
        </View>
        <Text style={styles.notFoundTitle}>User not found</Text>
        <Pressable onPress={router.back} style={styles.notFoundBtn} hitSlop={8}>
          <Feather name="chevron-left" size={16} color={Colors.blue2} />
          <Text style={styles.notFoundBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenBg />
      <View style={styles.topAbsolute}>
        <TopBar title="Delete User" onBack={router.back} />
      </View>

      <View style={styles.center}>
        <View style={styles.bigIcon}>
          <Feather name="trash-2" size={38} color={Colors.white} />
        </View>
        <Text style={styles.title}>Are you sure?</Text>
        <Text style={styles.body}>
          This will permanently delete this user and all linked data.{' '}
          <Text style={styles.bodyAccent}>This action cannot be undone.</Text>
        </Text>

        <View style={styles.userCard}>
          <Avatar first={u.first} last={u.last} color={u.color} size={40} />
          <View style={styles.userBody}>
            <Text style={styles.userName} numberOfLines={1}>
              {u.first} {u.last}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {u.email}
            </Text>
          </View>
          <Badge kind={u.role.toLowerCase() as BadgeKind}>{u.role}</Badge>
        </View>

        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <PrimaryButton variant="ghost" onPress={router.back}>
              Cancel
            </PrimaryButton>
          </View>
          <View style={{ flex: 1.2 }}>
            <PrimaryButton
              icon={<Feather name="trash-2" size={18} color={Colors.white} />}
              variant="danger"
              disabled={!id || del.isPending}
              onPress={handleDelete}
            >
              {del.isPending ? 'Deleting…' : 'Delete'}
            </PrimaryButton>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  topAbsolute: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  bigIcon: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.red1,
    shadowOpacity: 0.4,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
    marginBottom: 22,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.medium26,
    color: Colors.text,
    letterSpacing: LetterSpacing.normal,
    marginBottom: 8,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular18,
    color: Colors.textSecondary,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize.regular18 * 1.55,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 22,
  },
  bodyAccent: { color: Colors.red1, fontFamily: Fonts.semibold },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 28,
    ...Shadow.input,
  },
  userBody: { flex: 1, minWidth: 0 },
  userName: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  userEmail: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actions: { flexDirection: 'row', gap: 10, width: '100%', maxWidth: 320 },
  centerFill: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundTitle: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
  },
  notFoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
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
