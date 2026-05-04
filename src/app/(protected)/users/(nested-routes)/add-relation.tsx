import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  Avatar,
  Field,
  PrimaryButton,
  ScreenBg,
  SectionTitle,
  TextField,
  TopBar,
} from '@/components/global';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';

type Guardian = { id: string; name: string; email: string; color: string };
type Student = { id: string; name: string; color: string };

const GUARDIANS: Guardian[] = [
  { id: 'g1', name: 'Saad Khan', email: 'saad.k@gmail.com', color: '#C7E0FF' },
  { id: 'g2', name: 'Fatima Al-Hashmi', email: 'fatima.h@outlook.com', color: '#FFD6E7' },
  { id: 'g3', name: 'John Williams', email: 'j.williams@gmail.com', color: '#C9F0E5' },
];

const STUDENTS: Student[] = [
  { id: 's1', name: 'Layan Alalawi', color: '#C7F2D2' },
  { id: 's2', name: 'Maria Clara', color: '#FFD3B6' },
  { id: 's3', name: 'Al Ghala Saif', color: '#FFE4B5' },
  { id: 's4', name: 'Hassan Naveed', color: '#FFE9C4' },
  { id: 's5', name: 'Sara Ahmed', color: '#D2EBFF' },
];

const RELATION_CHIPS = ['Father', 'Mother', 'Guardian', 'Uncle', 'Aunt'];

const splitName = (full: string) => {
  const [first = '', ...rest] = full.split(' ');
  return { first, last: rest.join(' ') };
};

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function AddRelation() {
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [relation, setRelation] = useState('');

  const toggleStudent = (s: Student) => {
    setStudents((prev) =>
      prev.find((x) => x.id === s.id) ? prev.filter((x) => x.id !== s.id) : [...prev, s],
    );
  };

  const valid = !!guardian && students.length > 0 && relation.trim().length > 0;

  return (
    <View style={styles.root}>
      <ScreenBg />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TopBar
          title="Add Relation"
          subtitle="Link a guardian to one or more students"
          onBack={router.back}
          big
        />

        {/* Hero connector */}
        <View style={styles.hero}>
          <View style={[styles.heroCircle, guardian && { backgroundColor: guardian.color }]}>
            {guardian ? (
              <Text style={styles.heroInitials}>{initials(guardian.name)}</Text>
            ) : (
              <Feather name="user" size={26} color={Colors.blue2} />
            )}
          </View>
          <View style={styles.heroLink}>
            <Feather name="link" size={20} color={Colors.blue2} />
            <Text style={styles.heroLinkLabel}>{relation || 'relation'}</Text>
          </View>
          {students.length === 0 ? (
            <View style={styles.heroCircle}>
              <Feather name="user" size={26} color={Colors.blue2} />
            </View>
          ) : (
            <View style={styles.studentStack}>
              {students.slice(0, 3).map((s, i) => (
                <View
                  key={s.id}
                  style={[
                    styles.studentChip,
                    { backgroundColor: s.color, marginLeft: i === 0 ? 0 : -16 },
                  ]}
                >
                  <Text style={styles.studentChipText}>{initials(s.name)}</Text>
                </View>
              ))}
              {students.length > 3 && (
                <View style={[styles.studentChip, styles.studentChipMore]}>
                  <Text style={[styles.studentChipText, { color: Colors.white }]}>+{students.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.body}>
          <SectionTitle>Guardian</SectionTitle>
          <Field label="Select Guardian" required>
            <View style={styles.list}>
              {GUARDIANS.map((g) => {
                const on = guardian?.id === g.id;
                const { first, last } = splitName(g.name);
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => setGuardian(g)}
                    style={[styles.row, on ? styles.rowOn : styles.rowOff]}
                  >
                    <Avatar first={first} last={last} color={g.color} size={36} />
                    <View style={styles.rowBody}>
                      <Text style={styles.rowName} numberOfLines={1}>{g.name}</Text>
                      <Text style={styles.rowSub} numberOfLines={1}>{g.email}</Text>
                    </View>
                    {on && <Feather name="check" size={20} color={Colors.mainBlue} />}
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <SectionTitle>Students</SectionTitle>
          <Field label="Select Students" required hint="Tap to select multiple">
            <View style={styles.list}>
              {STUDENTS.map((s) => {
                const on = !!students.find((x) => x.id === s.id);
                const { first, last } = splitName(s.name);
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => toggleStudent(s)}
                    style={[styles.row, on ? styles.rowOn : styles.rowOff]}
                  >
                    <View style={[styles.checkbox, on && styles.checkboxOn]}>
                      {on && <Feather name="check" size={14} color={Colors.white} />}
                    </View>
                    <Avatar first={first} last={last} color={s.color} size={32} />
                    <Text style={[styles.rowName, { flex: 1 }]} numberOfLines={1}>{s.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <SectionTitle>Relationship</SectionTitle>
          <Field label="Relation" required hint="e.g. Father, Mother, Guardian">
            <TextField value={relation} onChangeText={setRelation} placeholder="Enter relation" />
          </Field>

          <View style={styles.chipRow}>
            {RELATION_CHIPS.map((r) => {
              const on = relation === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => setRelation(r)}
                  style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                >
                  <Text style={[styles.chipText, { color: on ? Colors.white : Colors.textSecondary }]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.submitWrap}>
            <PrimaryButton
              icon={<Feather name="link" size={18} color={Colors.white} />}
              disabled={!valid}
              onPress={router.back}
            >
              Add Relation
            </PrimaryButton>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceTint },
  scroll: { paddingBottom: 60 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 18,
    paddingBottom: 22,
    paddingHorizontal: Spacing.s4 + 3,
  },
  heroCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.frost75,
    borderWidth: 2,
    borderColor: 'rgba(56,182,255,0.4)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInitials: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.regular22,
    color: Colors.text,
  },
  heroLink: { alignItems: 'center', gap: 2 },
  heroLinkLabel: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular14,
    color: Colors.blue2,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase',
  },
  studentStack: { flexDirection: 'row' },
  studentChip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentChipMore: { backgroundColor: Colors.blue2, marginLeft: -16 },
  studentChipText: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
  },
  body: { paddingHorizontal: Spacing.s4 + 3 },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.control,
  },
  rowOff: {
    backgroundColor: Colors.frost75,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderRow,
    ...Shadow.input,
  },
  rowOn: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.mainBlue,
    shadowColor: Colors.mainBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowName: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  rowSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.borderDash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: Colors.mainBlue,
    borderColor: Colors.mainBlue,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: -4,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  chipOn: { backgroundColor: Colors.mainBlue },
  chipOff: {
    backgroundColor: Colors.frost70,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderSoft,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    letterSpacing: LetterSpacing.tight,
  },
  submitWrap: { marginTop: 14 },
});
