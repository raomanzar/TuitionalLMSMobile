import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
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
import type { BadgeKind } from '@/components/global';
import { USERS, type Role } from '@/constants/users';

type DetailModel = {
  id: number;
  first: string;
  last: string;
  email: string;
  pseudo: string;
  role: Role;
  color: string;
  country: string;
  phone: string;
  active: boolean;
  synced: boolean;
  created: string;
};

const FALLBACK: DetailModel = {
  id: 831,
  first: 'Diego',
  last: 'Acuña',
  email: 'swirlywhirly27@gmail.com',
  pseudo: 'Swirly Whirly',
  role: 'Student',
  color: '#FFD3B6',
  country: 'United Arab Emirates',
  phone: '+971 582 660 841',
  active: true,
  synced: true,
  created: '29 Apr 2026',
};

type Tab = 'info' | 'relations' | 'activity';

const ACTIVITY: { ico: React.ComponentProps<typeof Feather>['name']; c: string; t: string; s: string }[] = [
  { ico: 'refresh-cw', c: Colors.blue2,        t: 'Email synced',     s: '5 min ago' },
  { ico: 'edit-2',     c: Colors.orange,       t: 'Profile updated',  s: 'Yesterday · pseudo name' },
  { ico: 'key',        c: Colors.purpleAccent, t: 'Logged in',        s: 'Yesterday · iOS app' },
  { ico: 'user',       c: Colors.mainBlue,     t: 'Account created',  s: '29 Apr 2026' },
];

export default function UserDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const user = id ? USERS.find((x) => String(x.id) === id) : undefined;
  const u = user
    ? {
        id: user.id,
        first: user.first,
        last: user.last,
        email: user.email,
        pseudo: '',
        role: user.role,
        color: user.color,
        country: '',
        phone: '',
        active: user.active,
        synced: user.synced,
        created: user.date,
      }
    : FALLBACK;

  const [tab, setTab] = useState<Tab>('info');

  const heroBg = `${u.color}80`;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
            <View style={styles.heroNavRight}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/users/edit', params: { id: String(u.id) } })
                }
                style={styles.iconBtn}
                hitSlop={8}
              >
                <Feather name="edit-2" size={18} color={Colors.text} />
              </Pressable>
              <Pressable style={styles.iconBtn} hitSlop={8}>
                <Feather name="more-horizontal" size={18} color={Colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.heroBody}>
            <Avatar first={u.first} last={u.last} color={u.color} size={88} />
            <Text style={styles.name}>
              {u.first} {u.last}
            </Text>
            <Text style={styles.email}>{u.email}</Text>
            <View style={styles.pillRow}>
              <Badge kind={u.role.toLowerCase() as BadgeKind}>{u.role}</Badge>
              <Badge kind={u.synced ? 'synced' : 'unsynced'}>{u.synced ? 'Synced' : 'Unsynced'}</Badge>
              <Badge kind={u.active ? 'active' : 'inactive'}>{u.active ? 'Active' : 'Inactive'}</Badge>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.actionsCard}>
          <ActionTile icon="message-circle" color={Colors.mainBlue} label="Message" onPress={() => {}} />
          <ActionTile icon="mail" color={Colors.blue2} label="Email" onPress={() => {}} />
          <ActionTile
            icon="edit-2"
            color={Colors.orange}
            label="Edit"
            onPress={() => router.push({ pathname: '/users/edit', params: { id: String(u.id) } })}
          />
          <ActionTile
            icon="slash"
            color={Colors.red1}
            label="Disable"
            onPress={() => router.push({ pathname: '/users/deactivate', params: { id: String(u.id) } })}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TabButton id="info" label="Info" active={tab} setActive={setTab} />
          <TabButton id="relations" label="Relations" active={tab} setActive={setTab} />
          <TabButton id="activity" label="Activity" active={tab} setActive={setTab} />
        </View>

        <View style={styles.tabContent}>
          {tab === 'info' && <InfoTab u={u} />}
          {tab === 'relations' && <RelationsTab />}
          {tab === 'activity' && <ActivityTab />}
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
  icon: React.ComponentProps<typeof Feather>['name'];
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

function TabButton({
  id,
  label,
  active,
  setActive,
}: {
  id: Tab;
  label: string;
  active: Tab;
  setActive: (t: Tab) => void;
}) {
  const on = active === id;
  return (
    <Pressable onPress={() => setActive(id)} style={styles.tabBtn}>
      <Text style={[styles.tabLabel, { color: on ? Colors.blue2 : Colors.textMuted }]}>{label}</Text>
      {on && <View style={styles.tabIndicator} />}
    </Pressable>
  );
}

function InfoTab({ u }: { u: DetailModel }) {
  return (
    <View style={styles.infoCard}>
      <Row label="User ID" value={`#${u.id}`} mono />
      <Row label="Pseudo Name" value={u.pseudo || '—'} />
      <Row label="Phone" value={u.phone || '—'} />
      <Row label="Country" value={u.country || '—'} />
      <Row label="Created" value={u.created} />
      <Row label="Last sync" value="5 min ago" />
      <View style={[styles.row, { borderBottomWidth: 0 }]}>
        <Text style={styles.rowLabel}>Status</Text>
        <View style={styles.statusVal}>
          <View style={[styles.dot, { backgroundColor: u.active ? Colors.green : Colors.iconMuted }]} />
          <Text style={[styles.rowValue, { color: u.active ? Colors.greenText : Colors.textMuted }]}>
            {u.active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function RelationsTab() {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.relCard}>
        <Text style={styles.relLabel}>GUARDIAN</Text>
        <View style={styles.relRow}>
          <Avatar first="Saad" last="Khan" color="#C7E0FF" size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.relName}>Saad Khan</Text>
            <Text style={styles.relSub}>Father · saad.k@gmail.com</Text>
          </View>
          <Feather name="chevron-right" size={16} color={Colors.textMuted} />
        </View>
      </View>
      <View style={styles.relCard}>
        <Text style={styles.relLabel}>SIBLINGS · 1</Text>
        <View style={[styles.relRow, { paddingVertical: 10 }]}>
          <Avatar first="Hassan" last="Naveed" color="#FFE9C4" size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.relName}>Hassan Naveed</Text>
            <Text style={styles.relSub}>Grade 9 · Student</Text>
          </View>
          <Feather name="chevron-right" size={16} color={Colors.textMuted} />
        </View>
      </View>
      <Pressable
        onPress={() => router.push('/users/add-relation')}
        style={styles.addRelBtn}
      >
        <Feather name="plus" size={16} color={Colors.blue2} />
        <Text style={styles.addRelText}>Add Relation</Text>
      </Pressable>
    </View>
  );
}

function ActivityTab() {
  return (
    <View style={styles.activityCard}>
      {ACTIVITY.map((a, i) => (
        <View
          key={a.t}
          style={[
            styles.activityRow,
            { borderBottomWidth: i < ACTIVITY.length - 1 ? StyleSheet.hairlineWidth : 0 },
          ]}
        >
          <View style={[styles.activityIcon, { backgroundColor: a.c + '22' }]}>
            <Feather name={a.ico} size={16} color={a.c} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>{a.t}</Text>
            <Text style={styles.activitySub}>{a.s}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  scroll: { paddingBottom: 60 },

  hero: {
    paddingHorizontal: 12,
    paddingBottom: 22,
  },
  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  heroNavRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.control,
    backgroundColor: Colors.frost85,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.control,
  },
  heroBody: { alignItems: 'center' },
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
  pillRow: { flexDirection: 'row', gap: 6, marginTop: 10 },

  actionsCard: {
    marginHorizontal: Spacing.s4 + 3,
    marginTop: -10,
    backgroundColor: Colors.white,
    borderRadius: 18,
    flexDirection: 'row',
    paddingHorizontal: Spacing.s1,
    paddingVertical: 8,
    marginBottom: 16,
    ...Shadow.card,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    gap: 6,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.control,
  },
  actionLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular14,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.s4 + 3,
    backgroundColor: Colors.frost75,
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabLabel: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    letterSpacing: LetterSpacing.normal,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 1,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: Colors.mainBlue,
    borderRadius: 2,
  },
  tabContent: { paddingHorizontal: Spacing.s4 + 3 },

  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadow.input,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    maxWidth: '60%',
  },
  mono: { fontFamily: 'Menlo' },
  statusVal: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  relCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 14,
    ...Shadow.input,
  },
  relLabel: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.wide,
    marginBottom: 10,
  },
  relRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  relName: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
  },
  relSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addRelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(56,182,255,0.5)',
    backgroundColor: Colors.frost75,
  },
  addRelText: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.blue2,
    letterSpacing: LetterSpacing.normal,
  },

  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 8,
    ...Shadow.input,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: Colors.borderRow,
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
  },
  activitySub: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular14,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
