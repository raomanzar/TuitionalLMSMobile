import { AppDrawerContent } from "@/components/global";
import { Drawer } from "expo-router/drawer";

export default function ProtectedLayout() {
  return (
    <Drawer
      screenOptions={{ headerShown: true, drawerType: "back" }}
      drawerContent={(props) => <AppDrawerContent {...props} />}
    >
      <Drawer.Screen name="users" options={{ title: "Users" }} />
      <Drawer.Screen name="enrollments" options={{ title: "Enrollments" }} />
      <Drawer.Screen name="enrollments-logs" options={{ title: "Logs" }} />
    </Drawer>
  );
}
