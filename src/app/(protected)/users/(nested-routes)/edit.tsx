import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';
import { USERS } from '@/constants/users';

const FALLBACK = {
  first: 'Diego',
  last: 'Acuña',
  email: 'swirlywhirly27@gmail.com',
  pseudo: 'Swirly Whirly',
  country: 'United Arab Emirates',
  phone: '+971 582 660 841',
  role: 'Student',
  parentEmail: '',
  color: '#FFD3B6',
};

export default function EditUser() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const user = id ? USERS.find((x) => String(x.id) === id) : undefined;
  const u = user
    ? {
        first: user.first,
        last: user.last,
        email: user.email,
        pseudo: '',
        country: '',
        phone: '',
        role: user.role,
        parentEmail: '',
        color: user.color,
      }
    : FALLBACK;
  const [name, setName] = useState(`${u.first} ${u.last}`);
  const [email, setEmail] = useState(u.email);
  const [pseudo, setPseudo] = useState(u.pseudo);
  const [country, setCountry] = useState(u.country);
  const [phone, setPhone] = useState(u.phone.replace(/^\+971\s?/, ''));
  const [role, setRole] = useState(u.role);
  const [parentEmail, setParentEmail] = useState(u.parentEmail);

  return (
    <View style={styles.root}>
      <ScreenBg />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TopBar title="Edit User" subtitle="Update account details and role" onBack={router.back} big />

        <View style={styles.avatarWrap}>
          <Avatar first={u.first} last={u.last} color={u.color} size={96} />
          <Pressable style={styles.editBtn}>
            <Feather name="edit-2" size={14} color={Colors.white} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <SectionTitle>Identity</SectionTitle>
          <Field label="Full Name" required>
            <TextField value={name} onChangeText={setName} leading={<Feather name="user" size={18} color={Colors.textMuted} />} />
          </Field>
          <Field label="Email Address" required>
            <TextField
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leading={<Feather name="mail" size={18} color={Colors.textMuted} />}
            />
          </Field>
          <Field label="Pseudo Name" hint="Display name shown in the LMS">
            <TextField value={pseudo} onChangeText={setPseudo} placeholder="Enter pseudo name" />
          </Field>

          <SectionTitle>Profile</SectionTitle>
          <View style={styles.row}>
            <View style={styles.col}>
              <Field label="Country">
                <SelectLook
                  value={country}
                  placeholder="Select"
                  onPress={() => setCountry(country ? '' : 'United Arab Emirates')}
                />
              </Field>
            </View>
            <View style={styles.col}>
              <Field label="Role" required>
                <SelectLook value={role} placeholder="Role" onPress={() => setRole(role === 'Student' ? 'Teacher' : 'Student')} />
              </Field>
            </View>
          </View>
          <Field label="Phone Number">
            <View style={styles.phoneRow}>
              <Pressable style={styles.dial}>
                <Text style={styles.dialText}>🇦🇪 +971</Text>
                <Feather name="chevron-down" size={14} color={Colors.text} />
              </Pressable>
              <View style={styles.phoneInputWrap}>
                <TextField value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>
            </View>
          </Field>

          {role === 'Student' && (
            <>
              <SectionTitle>Guardian</SectionTitle>
              <Field label="Parent Email Address" hint="Used for billing and reports">
                <TextField
                  value={parentEmail}
                  onChangeText={setParentEmail}
                  placeholder="parent@email.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  leading={<Feather name="mail" size={18} color={Colors.textMuted} />}
                />
              </Field>
            </>
          )}

          <View style={styles.submitWrap}>
            <PrimaryButton icon={<Feather name="check" size={18} color={Colors.white} />} onPress={router.back}>
              Update
            </PrimaryButton>
          </View>
          <View style={styles.cancelWrap}>
            <PrimaryButton variant="ghost" onPress={router.back}>
              Cancel
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
  avatarWrap: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 22,
  },
  editBtn: {
    position: 'absolute',
    right: '38%',
    bottom: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.mainBlue,
    borderWidth: 2,
    borderColor: Colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.fab,
  },
  body: { paddingHorizontal: Spacing.s4 + 3 },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  phoneRow: { flexDirection: 'row', gap: 8 },
  dial: {
    width: 92,
    height: 48,
    borderRadius: Radius.control,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderRow,
    ...Shadow.input,
  },
  dialText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
  phoneInputWrap: { flex: 1 },
  submitWrap: { marginTop: 18 },
  cancelWrap: { marginTop: 10 },
});
