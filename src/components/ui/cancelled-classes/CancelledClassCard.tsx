import React, { memo, useEffect } from 'react';
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
import { Avatar, Badge } from '@/components/global';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';
import {
  refundStatusBadgeKind,
  type CancelledClass,
} from '@/constants/cancelled-classes';

const ACTION_WIDTH = 74;
const OPEN_OFFSET = -ACTION_WIDTH * 2;

type Props = {
  item: CancelledClass;
  isOpen: boolean;
  onOpen: (id: number | null) => void;
  onTap: (item: CancelledClass) => void;
  onRefund: (item: CancelledClass) => void;
  onReschedule: (item: CancelledClass) => void;
};

function CancelledClassCardImpl({
  item,
  isOpen,
  onOpen,
  onTap,
  onRefund,
  onReschedule,
}: Props) {
  const tx = useSharedValue(0);

  useEffect(() => {
    tx.value = withSpring(isOpen ? OPEN_OFFSET : 0, { damping: 20, stiffness: 220 });
  }, [isOpen, tx]);

  const pan = Gesture.Pan()
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
          runOnJS(onOpen)(item.id);
        } else {
          tx.value = withTiming(0, { duration: 220 });
        }
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  const handlePress = () => {
    if (isOpen) {
      tx.value = withTiming(0, { duration: 220 });
      onOpen(null);
      return;
    }
    onTap(item);
  };

  const closeAndRun = (fn: (c: CancelledClass) => void) => () => {
    tx.value = withTiming(0, { duration: 220 });
    onOpen(null);
    fn(item);
  };

  const [subjectFirst, subjectSecond] = item.subject.split(/\s+/);

  return (
    <View style={styles.wrapper}>
      <View style={styles.actions}>
        <Pressable
          style={[styles.action, { backgroundColor: Colors.mainBlue }]}
          onPress={closeAndRun(onReschedule)}
        >
          <Feather name="calendar" size={20} color={Colors.white} />
          <Text style={styles.actionText}>Reschedule</Text>
        </Pressable>
        <Pressable
          style={[styles.action, styles.actionRight, { backgroundColor: Colors.green }]}
          onPress={closeAndRun(onRefund)}
        >
          <Feather name="dollar-sign" size={20} color={Colors.white} />
          <Text style={styles.actionText}>Refund</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Pressable onPress={handlePress} style={styles.cardInner}>
            <Avatar
              first={subjectFirst ?? 'C'}
              last={subjectSecond ?? ''}
              color={item.color}
              size={44}
            />

            <View style={styles.body}>
              <View style={styles.row1}>
                <Text style={styles.subject} numberOfLines={1}>
                  {item.subject}
                </Text>
                <Badge kind={refundStatusBadgeKind(item.refundStatus)}>
                  {item.refundStatus}
                </Badge>
              </View>

              <Text style={styles.people} numberOfLines={1}>
                {item.studentName} · {item.teacherName}
              </Text>

              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: cancelledByColor(item.cancelledBy) },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: Colors.textMuted }]}>
                    {item.cancelledBy} cancelled
                  </Text>
                </View>
                <View style={styles.bullet} />
                <Text style={[styles.statusText, { color: Colors.textMuted }]}>
                  #{item.id}
                </Text>
                <Text style={[styles.statusText, styles.date]}>{item.cancelledAt}</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const cancelledByColor = (by: CancelledClass['cancelledBy']) => {
  switch (by) {
    case 'Student': return Colors.greenText;
    case 'Teacher': return Colors.purpleText;
    case 'Admin':   return Colors.blue3;
  }
};

/**
 * Memoized so a parent re-render doesn't re-render every visible card —
 * only the card whose item/openness actually changed.
 */
export const CancelledClassCard = memo(CancelledClassCardImpl);

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
    fontSize: FontSize.regular14,
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
  subject: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
    flexShrink: 1,
  },
  people: {
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
    fontSize: FontSize.regular14,
    letterSpacing: LetterSpacing.normal,
  },
  date: {
    marginLeft: 'auto',
    color: Colors.textMuted,
  },
});
