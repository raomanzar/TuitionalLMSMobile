import { useIsAuthenticated } from "@/stores";
import { Redirect } from "expo-router";

export default function Index() {
  const isAuthenticated = useIsAuthenticated();
  return <Redirect href={isAuthenticated ? "/users" : "/signin"} />;
}
