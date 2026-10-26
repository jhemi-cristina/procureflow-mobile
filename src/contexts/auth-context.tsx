import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { secureSession } from "@/lib/auth/session-storage";
import type { AuthUser, LoginInput, Session } from "@/types/auth";

// Limite do setTimeout (~24,8 dias); acima disso o timer dispararia imediatamente.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

export interface AuthContextValue {
  /** `true` enquanto a sessão salva no dispositivo está sendo lida. */
  isLoading: boolean;
  user: AuthUser | null;
  token: string | null;
  signIn: (credentials: LoginInput) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura a sessão do armazenamento seguro ao abrir o app.
  useEffect(() => {
    let active = true;
    secureSession.load().then((stored) => {
      if (!active) return;
      setSession(stored);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    queryClient.clear();
    void secureSession.clear();
  }, [queryClient]);

  const signIn = useCallback(async (credentials: LoginInput) => {
    const { access_token, user } = await authApi.login(credentials);
    setSession(await secureSession.save(access_token, user));
  }, []);

  // Qualquer 401 vindo da API encerra a sessão.
  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  // Encerra a sessão automaticamente quando o JWT expira.
  useEffect(() => {
    if (!session?.expiresAt) return;
    const delay = Math.min(session.expiresAt - Date.now(), MAX_TIMEOUT_MS);
    const timeout = setTimeout(signOut, delay);
    return () => clearTimeout(timeout);
  }, [session?.expiresAt, signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      user: session?.user ?? null,
      token: session?.token ?? null,
      signIn,
      signOut,
    }),
    [isLoading, session, signIn, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
