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
import { usersApi } from "@/lib/api/users";
import { secureSession } from "@/lib/auth/session-storage";
import type { AuthUser, LoginInput, RegisterInput, Session } from "@/types/auth";

const MAX_TIMEOUT_MS = 2 ** 31 - 1;

export interface AuthContextValue {
  isLoading: boolean;
  user: AuthUser | null;
  token: string | null;
  signIn: (credentials: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const signUp = useCallback(
    async (input: RegisterInput) => {
      await usersApi.register(input);
      try {
        await signIn({ email: input.email, password: input.password });
      } catch {
        throw new Error("Conta criada com sucesso! Faça login para continuar.");
      }
    },
    [signIn],
  );

  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

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
      signUp,
      signOut,
    }),
    [isLoading, session, signIn, signUp, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
