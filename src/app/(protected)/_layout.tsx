import { AppDrawerContent } from "@/components/global";
import { useIsAuthenticated } from "@/stores";
import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";

export default function ProtectedLayout() {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) return <Redirect href="/signin" />;

  return (
    <Drawer
      screenOptions={{ headerShown: false, drawerType: "back" }}
      drawerContent={(props) => <AppDrawerContent {...props} />}
    >
      <Drawer.Screen name="users" options={{ title: "Users" }} />
      <Drawer.Screen name="roles" options={{ title: "Roles" }} />
      <Drawer.Screen
        name="cancelled-classes"
        options={{ title: "Cancelled Classes" }}
      />
      <Drawer.Screen name="enrollments" options={{ title: "Enrollments" }} />
      <Drawer.Screen name="enrollments-logs" options={{ title: "Logs" }} />
    </Drawer>
  );
}
