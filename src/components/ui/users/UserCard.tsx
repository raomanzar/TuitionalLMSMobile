import React, { memo, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Avatar, Badge, type BadgeKind } from '@/components/global';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';
import { USER_AVATAR_FALLBACK, type User } from '@/constants/users';

const ACTION_WIDTH = 74;
const OPEN_OFFSET = -ACTION_WIDTH * 2;

type Props = {
  user: User;
  isOpen: boolean;
  onOpen: (id: number | null) => void;
  onTap: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

function UserCardImpl({ user, isOpen, onOpen, onTap, onEdit, onDelete }: Props) {
  const tx = useSharedValue(0);

  useEffect(() => {
    tx.value = withSpring(isOpen ? OPEN_OFFSET : 0, { damping: 20, stiffness: 220 });
  }, [isOpen, tx]);

  // Memoize the gesture so GestureDetector doesn't get a fresh instance each
  // render — only rebuilds when its closures actually need new values. `tx`
  // is a stable shared-value ref (excluded from deps for that reason).
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-12, 12])
        .onUpdate((e) => {
          const base = isOpen ? OPEN_OFFSET : 0;
          let next = base + e.translationX;
          if (next > 0) next = next * 0.2;
          if (next < OPEN_OFFSET - 32) next = OPEN_OFFSET - 32 + (next - (OPEN_OFFSET - 32)) * 0.2;
          tx.value = next;
        })
        .onEnd((e) => {
          const d = e.translationX;
          if (isOpen) {
            if (d > 60) {
              tx.value = withTiming(0, { duration: 220 });
              runOnJS(onOpen)(null);
            } else {
              tx.value = withSpring(OPEN_OFFSET, { damping: 20, stiffness: 220 });
            }
          } else {
            if (d < -60) {
              tx.value = withSpring(OPEN_OFFSET, { damping: 20, stiffness: 220 });
              runOnJS(onOpen)(user.id);
            } else {
              tx.value = withTiming(0, { duration: 220 });
            }
          }
        }),
    [isOpen, onOpen, user.id, tx],
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  const handlePress = () => {
    if (isOpen) {
      tx.value = withTiming(0, { duration: 220 });
      onOpen(null);
      return;
    }
    onTap(user);
  };

  const closeAndRun = (fn: (u: User) => void) => () => {
    tx.value = withTiming(0, { duration: 220 });
    onOpen(null);
    fn(user);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.actions}>
        <Pressable style={[styles.action, { backgroundColor: Colors.mainBlue }]} onPress={closeAndRun(onEdit)}>
          <Feather name="edit-2" size={20} color={Colors.white} />
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.action, styles.actionRight, { backgroundColor: Colors.red }]}
          onPress={closeAndRun(onDelete)}
        >
          <Feather name="trash-2" size={20} color={Colors.white} />
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Pressable onPress={handlePress} style={styles.cardInner}>
            <Avatar
              first={user.first}
              last={user.last}
              color={user.color}
              size={44}
              imageUri={user.profileImageUrl}
              fallbackImage={USER_AVATAR_FALLBACK}
            />

            <View style={styles.body}>
              <View style={styles.row1}>
                <Text style={styles.name} numberOfLines={1}>
                  {user.first} {user.last}
                </Text>
                <Badge kind={user.role.toLowerCase() as BadgeKind}>{user.role}</Badge>
              </View>

              <Text style={styles.email} numberOfLines={1}>
                {user.email}
              </Text>

              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: user.active ? Colors.green : Colors.iconMuted,
                      },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: user.active ? Colors.greenText : Colors.textMuted }]}>
                    {user.active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <View style={styles.bullet} />
                <Text style={[styles.statusText, { color: user.synced ? Colors.greenText : Colors.redText }]}>
                  {user.synced ? 'Synced' : 'Unsynced'}
                </Text>
                <View style={styles.bullet} />
                <Text style={[styles.statusText, { color: Colors.textMuted }]}>#{user.id}</Text>
                <Text style={[styles.statusText, styles.date]}>{user.date}</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/**
 * Memoized so a parent re-render doesn't re-render every visible card —
 * only the card whose user/openness actually changed.
 */
export const UserCard = memo(UserCardImpl);

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: Spacing.s3,
  },
  actions: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  action: {
    width: ACTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s1,
  },
  actionRight: {
    borderTopRightRadius: Radius.card,
    borderBottomRightRadius: Radius.card,
  },
  actionText: {
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    letterSpacing: LetterSpacing.wide,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    ...Shadow.card,
  },
  cardInner: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular20,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    flexShrink: 1,
  },
  email: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.borderDash,
  },
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    letterSpacing: LetterSpacing.normal,
  },
  date: {
    marginLeft: 'auto',
    color: Colors.textMuted,
  },
});
