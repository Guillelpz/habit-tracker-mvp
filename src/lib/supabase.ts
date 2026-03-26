import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Add them to .env (see .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Expo Router can render on the web in a Node/SSR-like environment
    // where `window` is undefined. `AsyncStorage` web impl touches `window`,
    // so we provide a storage adapter that is safe across environments.
    storage: {
      getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === "web") {
          if (typeof window === "undefined") {
            return null;
          }

          return window.localStorage.getItem(key);
        }

        return AsyncStorage.getItem(key);
      },
      setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === "web") {
          if (typeof window === "undefined") {
            return;
          }

          window.localStorage.setItem(key, value);
          return;
        }

        await AsyncStorage.setItem(key, value);
      },
      removeItem: async (key: string): Promise<void> => {
        if (Platform.OS === "web") {
          if (typeof window === "undefined") {
            return;
          }

          window.localStorage.removeItem(key);
          return;
        }

        await AsyncStorage.removeItem(key);
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
