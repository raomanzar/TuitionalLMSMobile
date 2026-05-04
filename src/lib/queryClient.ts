import { QueryClient } from "@tanstack/react-query";

/**
 * Single QueryClient instance for the app. Tune defaults here so every
 * `useQuery` / `useMutation` inherits them without per-call config.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // data is "fresh" for 60s — no refetch on remount
      gcTime: 5 * 60_000, // keep in cache for 5 min after last subscriber
      retry: 1, // retry once on failure
      refetchOnWindowFocus: false, // app focus instead of window focus on RN
    },
    mutations: {
      retry: 0,
    },
  },
});
