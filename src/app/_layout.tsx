import "@/lib/reactotron";

import { FontAssets } from "@/constants/theme";
import { AppProviders } from "@/providers/AppProviders";
import { useAuthHasHydrated } from "@/stores";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const [loaded] = useFonts(FontAssets);
  const hasHydrated = useAuthHasHydrated();
  if (!loaded || !hasHydrated) return null;
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AppProviders>
  );
}
