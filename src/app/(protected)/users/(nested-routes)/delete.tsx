import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  Avatar,
  Badge,
  PrimaryButton,
  ScreenBg,
  TopBar,
} from '@/components/global';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
} from '@/constants/theme';
import type { BadgeKind } from '@/components/global';
import { USERS } from '@/constants/users';

const FALLBACK = {
  first: 'Diego',
  last: 'Acuña',
  email: 'swirlywhirly27@gmail.com',
  role: 'Student' as const,
  color: '#FFD3B6',
};

export default function DeleteUser() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const user = id ? USERS.find((x) => String(x.id) === id) : undefined;
  const u = user ?? FALLBACK;

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
              onPress={router.back}
            >
              Delete
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
});
