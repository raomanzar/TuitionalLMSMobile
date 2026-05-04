import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
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

export default function AddUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [hide, setHide] = useState(true);
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('');

  const valid = !!name && !!email && pw.length >= 8 && !!type;

  return (
    <View style={styles.root}>
      <ScreenBg />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TopBar title="Add New User" subtitle="Provision a new account in the LMS" onBack={router.back} big />

        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Feather name="user" size={42} color={Colors.blue2} />
          </View>
          <Pressable style={styles.cameraBtn}>
            <Feather name="camera" size={15} color={Colors.white} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <SectionTitle>Account</SectionTitle>
          <Field label="Full Name" required>
            <TextField
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              leading={<Feather name="user" size={18} color={Colors.textMuted} />}
            />
          </Field>
          <Field label="Email Address" required>
            <TextField
              value={email}
              onChangeText={setEmail}
              placeholder="name@school.edu"
              keyboardType="email-address"
              autoCapitalize="none"
              leading={<Feather name="mail" size={18} color={Colors.textMuted} />}
            />
          </Field>
          <Field label="Password" required hint="Minimum 8 characters">
            <TextField
              value={pw}
              onChangeText={setPw}
              placeholder="Enter password"
              secureTextEntry={hide}
              leading={<Feather name="lock" size={18} color={Colors.textMuted} />}
              trailing={
                <Pressable onPress={() => setHide((h) => !h)} hitSlop={6}>
                  <Feather name={hide ? 'eye' : 'eye-off'} size={18} color={Colors.textMuted} />
                </Pressable>
              }
            />
          </Field>

          <SectionTitle>Profile</SectionTitle>
          <View style={styles.row}>
            <View style={styles.col}>
              <Field label="Gender">
                <SelectLook value={gender} placeholder="Select" onPress={() => setGender(gender ? '' : 'Male')} />
              </Field>
            </View>
            <View style={styles.col}>
              <Field label="User Type" required>
                <SelectLook value={type} placeholder="Select role" onPress={() => setType(type ? '' : 'Student')} />
              </Field>
            </View>
          </View>
          <Field label="Country">
            <SelectLook
              value={country}
              placeholder="Select country"
              leading={<Feather name="globe" size={18} color={Colors.textMuted} />}
              onPress={() => setCountry(country ? '' : 'United Arab Emirates')}
            />
          </Field>
          <Field label="Phone Number">
            <View style={styles.phoneRow}>
              <Pressable style={styles.dial}>
                <Text style={styles.dialText}>🇦🇪 +971</Text>
                <Feather name="chevron-down" size={14} color={Colors.text} />
              </Pressable>
              <View style={styles.phoneInputWrap}>
                <TextField value={phone} onChangeText={setPhone} placeholder="50 123 4567" keyboardType="phone-pad" />
              </View>
            </View>
          </Field>

          <View style={styles.submitWrap}>
            <PrimaryButton
              icon={<Feather name="plus" size={18} color={Colors.white} />}
              disabled={!valid}
              onPress={router.back}
            >
              Add User
            </PrimaryButton>
          </View>
          <Text style={styles.footnote}>
            User will appear as <Text style={styles.footnoteAccent}>Not Synced</Text> until they log in via Google.
          </Text>
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.blue4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.blue3,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.frost50,
  },
  cameraBtn: {
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
  footnote: {
    textAlign: 'center',
    marginTop: 12,
    fontFamily: Fonts.regular,
    fontSize: FontSize.regular14,
    color: Colors.textMuted,
    letterSpacing: LetterSpacing.tight,
  },
  footnoteAccent: {
    color: Colors.red1,
    fontFamily: Fonts.semibold,
  },
});
