import { Stack } from "expo-router";

/**
 * Public routes (signin, password reset, etc.) are reachable by everyone.
 * Authentication is enforced one level up by `(protected)/_layout.tsx`,
 * not here — keeping this layout free of an auth check means deep links
 * into public flows (e.g. password-reset emails) work whether the user
 * is signed in or not.
 */
export default function PublicLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
