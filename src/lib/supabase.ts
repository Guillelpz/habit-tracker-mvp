import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * expo-secure-store documents a ~2048 UTF-8 bytes per value limit on Android.
 * Keep a buffer to avoid borderline failures.
 */
const SINGLE_VALUE_MAX_BYTES = 2000;

/** Base64 is ASCII; chunk size is measured in characters. */
const CHUNK_CHAR_LEN = 1800;
const MAX_CHUNKS = 400;

const CHUNK_META_SUFFIX = ".__sbmeta_n";
const chunkPartSuffix = (i: number): string => `.__sbmeta_p${i}`;

function sanitizeKey(key: string): string {
  // SecureStore keys must be alphanumeric plus ".", "-", "_" (Expo docs).
  return key.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function metaKey(baseKey: string): string {
  return `${baseKey}${CHUNK_META_SUFFIX}`;
}

function partKey(baseKey: string, index: number): string {
  return `${baseKey}${chunkPartSuffix(index)}`;
}

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64EncodeBytes(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i]!;
    const b2 = i + 1 < bytes.length ? bytes[i + 1]! : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2]! : 0;

    const triple = (b1 << 16) | (b2 << 8) | b3;
    out += BASE64_ALPHABET[(triple >> 18) & 63]!;
    out += BASE64_ALPHABET[(triple >> 12) & 63]!;
    out += i + 1 < bytes.length ? BASE64_ALPHABET[(triple >> 6) & 63]! : "=";
    out += i + 2 < bytes.length ? BASE64_ALPHABET[triple & 63]! : "=";
  }
  return out;
}

function base64DecodeToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[\r\n\s]/g, "");
  if (clean.length % 4 !== 0) {
    throw new Error("Invalid base64 length.");
  }

  const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
  const outLen = (clean.length / 4) * 3 - padding;
  const out = new Uint8Array(outLen);

  let outIndex = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const c1 = clean[i]!;
    const c2 = clean[i + 1]!;
    const c3 = clean[i + 2]!;
    const c4 = clean[i + 3]!;

    const i1 = BASE64_ALPHABET.indexOf(c1);
    const i2 = BASE64_ALPHABET.indexOf(c2);
    const i3 = c3 === "=" ? -1 : BASE64_ALPHABET.indexOf(c3);
    const i4 = c4 === "=" ? -1 : BASE64_ALPHABET.indexOf(c4);

    if (i1 < 0 || i2 < 0 || (i3 < 0 && c3 !== "=") || (i4 < 0 && c4 !== "=")) {
      throw new Error("Invalid base64 character.");
    }

    const triple = (i1 << 18) | (i2 << 12) | ((i3 < 0 ? 0 : i3) << 6) | (i4 < 0 ? 0 : i4);
    if (outIndex < outLen) out[outIndex++] = (triple >> 16) & 255;
    if (outIndex < outLen) out[outIndex++] = (triple >> 8) & 255;
    if (outIndex < outLen) out[outIndex++] = triple & 255;
  }

  return out;
}

function utf8ToBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  return base64EncodeBytes(bytes);
}

function base64ToUtf8(b64: string): string {
  const bytes = base64DecodeToBytes(b64);
  return new TextDecoder().decode(bytes);
}

async function clearAllForKey(rawKey: string): Promise<void> {
  const baseKey = sanitizeKey(rawKey);

  let n = 0;
  try {
    const nStr = await SecureStore.getItemAsync(metaKey(baseKey));
    if (nStr !== null) {
      const parsed = Number.parseInt(nStr, 10);
      if (Number.isFinite(parsed) && parsed > 0 && parsed <= MAX_CHUNKS) {
        n = parsed;
      }
    }
  } catch {
    /* ignore */
  }

  for (let i = 0; i < n; i += 1) {
    try {
      await SecureStore.deleteItemAsync(partKey(baseKey, i));
    } catch {
      /* ignore */
    }
  }

  try {
    await SecureStore.deleteItemAsync(metaKey(baseKey));
  } catch {
    /* ignore */
  }

  try {
    await SecureStore.deleteItemAsync(baseKey);
  } catch {
    /* ignore */
  }
}

async function getItemChunked(rawKey: string): Promise<string | null> {
  const baseKey = sanitizeKey(rawKey);

  let nStr: string | null;
  try {
    nStr = await SecureStore.getItemAsync(metaKey(baseKey));
  } catch (e) {
    console.error("[supabase] SecureStore chunked meta read failed:", e);
    return null;
  }

  if (nStr === null) {
    return null;
  }

  const n = Number.parseInt(nStr, 10);
  if (!Number.isFinite(n) || n < 1 || n > MAX_CHUNKS) {
    return null;
  }

  const parts: string[] = [];
  for (let i = 0; i < n; i += 1) {
    try {
      const p = await SecureStore.getItemAsync(partKey(baseKey, i));
      if (p === null) {
        return null;
      }
      parts.push(p);
    } catch (e) {
      console.error("[supabase] SecureStore chunked part read failed:", e);
      return null;
    }
  }

  try {
    return base64ToUtf8(parts.join(""));
  } catch (e) {
    console.error("[supabase] Session base64 decode failed:", e);
    return null;
  }
}

async function setItemChunked(rawKey: string, value: string): Promise<void> {
  const baseKey = sanitizeKey(rawKey);
  await clearAllForKey(rawKey);

  const b64 = utf8ToBase64(value);
  const chunks: string[] = [];
  for (let i = 0; i < b64.length; i += CHUNK_CHAR_LEN) {
    chunks.push(b64.slice(i, i + CHUNK_CHAR_LEN));
  }

  if (chunks.length > MAX_CHUNKS) {
    console.error("[supabase] Session too large to persist safely; refusing to store.");
    return;
  }

  for (let i = 0; i < chunks.length; i += 1) {
    try {
      await SecureStore.setItemAsync(partKey(baseKey, i), chunks[i]!);
    } catch (e) {
      console.error("[supabase] SecureStore chunked part write failed:", e);
      await clearAllForKey(rawKey);
      return;
    }
  }

  try {
    await SecureStore.setItemAsync(metaKey(baseKey), String(chunks.length));
  } catch (e) {
    console.error("[supabase] SecureStore chunked meta write failed:", e);
    await clearAllForKey(rawKey);
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Add them to .env (see .env.example)."
  );
}

/**
 * iOS/Android: persist auth with `expo-secure-store` only (no AsyncStorage — RNAsyncStorage is null in some Expo Go builds).
 * Large session JSON is stored as base64 split across multiple keys under the per-entry size limit.
 */
function createNativeAuthStorage(): {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
} {
  return {
    getItem: async (key: string): Promise<string | null> => {
      const safeKey = sanitizeKey(key);
      try {
        const single = await SecureStore.getItemAsync(safeKey);
        if (single !== null) {
          return single;
        }
      } catch (e) {
        console.error("[supabase] SecureStore getItem failed:", e);
      }

      return getItemChunked(key);
    },

    setItem: async (key: string, value: string): Promise<void> => {
      const safeKey = sanitizeKey(key);

      if (utf8ByteLength(value) <= SINGLE_VALUE_MAX_BYTES) {
        try {
          await clearAllForKey(key);
          await SecureStore.setItemAsync(safeKey, value);
        } catch (e) {
          console.error("[supabase] SecureStore setItem failed:", e);
        }
        return;
      }

      await setItemChunked(key, value);
    },

    removeItem: async (key: string): Promise<void> => {
      await clearAllForKey(key);
    },
  };
}

const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === "web" ? webStorage : createNativeAuthStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

