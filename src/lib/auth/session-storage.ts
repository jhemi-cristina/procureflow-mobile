import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { AuthUser, Session } from "@/types/auth";

const STORAGE_KEY = "procureflow.session";

/**
 * No iOS/Android a sessão fica no Keychain/Keystore (criptografado pelo sistema).
 * O SecureStore não existe na web, então lá usamos localStorage como fallback.
 */
const storage = {
  async get() {
    if (Platform.OS === "web") return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
    return SecureStore.getItemAsync(STORAGE_KEY);
  },
  async set(value: string) {
    if (Platform.OS === "web") return globalThis.localStorage?.setItem(STORAGE_KEY, value);
    return SecureStore.setItemAsync(STORAGE_KEY, value);
  },
  async remove() {
    if (Platform.OS === "web") return globalThis.localStorage?.removeItem(STORAGE_KEY);
    return SecureStore.deleteItemAsync(STORAGE_KEY);
  },
};

function decodeTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function isExpired(session: Session) {
  return session.expiresAt !== null && session.expiresAt <= Date.now();
}

export const secureSession = {
  async load(): Promise<Session | null> {
    try {
      const raw = await storage.get();
      if (!raw) return null;
      const session = JSON.parse(raw) as Session;
      if (!session.token || !session.user || isExpired(session)) {
        await storage.remove();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  async save(token: string, user: AuthUser): Promise<Session> {
    const session: Session = { token, user, expiresAt: decodeTokenExpiry(token) };
    await storage.set(JSON.stringify(session));
    return session;
  },

  async clear() {
    try {
      await storage.remove();
    } catch {
      // Se a remoção falhar, a sessão em memória já foi descartada pelo contexto.
    }
  },
};
