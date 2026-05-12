import * as SecureStore from 'expo-secure-store';
import { type StateStorage } from 'zustand/middleware';

/**
 * Zustand persist adapter backed by `expo-secure-store`.
 * Use for sensitive data (auth tokens, refresh tokens). For non-sensitive
 * UI prefs prefer AsyncStorage / MMKV — secure-store has a 2KB per-key
 * cap on iOS and a small native crypto cost per read.
 */
export const secureStorage: StateStorage = {
  getItem: async (name) => {
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name, value) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    await SecureStore.deleteItemAsync(name);
  },
};
