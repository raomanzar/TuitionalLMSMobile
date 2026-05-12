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
  SelectLook,
  TextField,
  TopBar,
} from '@/components/global';
import { UserPickerModal } from '@/components/ui/users';
import { type User } from '@/constants/users';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';

const RELATION_CHIPS = ['Father', 'Mother', 'Guardian', 'Uncle', 'Aunt'];

// Backend role ids — matches the convention used in `uiRoleToRoleId`.
const STUDENT_ROLE_ID = 3;
const PARENT_ROLE_ID = 4;

const fullName = (u: User) => `${u.first} ${u.last}`.trim();

export default function AddRelation() {
  const [guardian, setGuardian] = useState<User | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [relation, setRelation] = useState('');
  const [guardianPickerOpen, setGuardianPickerOpen] = useState(false);
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);

  const valid = !!guardian && !!student && relation.trim().length > 0;

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
          subtitle="Link a guardian to a student"
          onBack={router.back}
          big
        />

        {/* Hero connector — visualises the relation as guardian → label → student. */}
        <View style={styles.hero}>
          <HeroDisk user={guardian} />
          <View style={styles.heroLink}>
            <Feather name="link" size={20} color={Colors.blue2} />
            <Text style={styles.heroLinkLabel}>{relation || 'relation'}</Text>
          </View>
          <HeroDisk user={student} />
        </View>

        <View style={styles.body}>
          <SectionTitle>Guardian</SectionTitle>
          <Field label="Select Guardian" required>
            <SelectLook
              value={guardian ? fullName(guardian) : ''}
              placeholder="Choose guardian"
              leading={<Feather name="user" size={18} color={Colors.textMuted} />}
              onPress={() => setGuardianPickerOpen(true)}
            />
          </Field>

          <SectionTitle>Student</SectionTitle>
          <Field label="Select Student" required>
            <SelectLook
              value={student ? fullName(student) : ''}
              placeholder="Choose student"
              leading={<Feather name="user" size={18} color={Colors.textMuted} />}
              onPress={() => setStudentPickerOpen(true)}
            />
          </Field>

          <SectionTitle>Relationship</SectionTitle>
          <Field label="Relation" required hint="e.g. Father, Mother, Guardian">
            <TextField
              value={relation}
              onChangeText={setRelation}
              placeholder="Enter relation"
            />
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
                  <Text
                    style={[
                      styles.chipText,
                      { color: on ? Colors.white : Colors.textSecondary },
                    ]}
                  >
                    {r}
                  </Text>
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

      <UserPickerModal
        open={guardianPickerOpen}
        onClose={() => setGuardianPickerOpen(false)}
        title="Select Guardian"
        userType={PARENT_ROLE_ID}
        selectedId={guardian?.id ?? null}
        onSelect={setGuardian}
      />
      <UserPickerModal
        open={studentPickerOpen}
        onClose={() => setStudentPickerOpen(false)}
        title="Select Student"
        userType={STUDENT_ROLE_ID}
        selectedId={student?.id ?? null}
        onSelect={setStudent}
      />
    </View>
  );
}

/** Big avatar disk in the hero strip. Shows a dashed empty placeholder when nothing is picked. */
function HeroDisk({ user }: { user: User | null }) {
  if (!user) {
    return (
      <View style={styles.heroCircle}>
        <Feather name="user" size={26} color={Colors.blue2} />
      </View>
    );
  }
  return (
    <View style={styles.heroAvatar}>
      <Avatar
        first={user.first}
        last={user.last}
        color={user.color}
        size={60}
        imageUri={user.profileImageUrl}
      />
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
  heroAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  heroLink: { alignItems: 'center', gap: 2 },
  heroLinkLabel: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular14,
    color: Colors.blue2,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase',
  },
  body: { paddingHorizontal: Spacing.s4 + 3 },
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
    ...Shadow.input,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular16,
    letterSpacing: LetterSpacing.tight,
  },
  submitWrap: { marginTop: 14 },
});
