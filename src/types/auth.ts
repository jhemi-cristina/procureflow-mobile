export type UserRole = "admin" | "approver" | "requester";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: string;
  user: AuthUser;
}

export interface Session {
  token: string;
  user: AuthUser;
  /** Epoch em milissegundos extraído do `exp` do JWT. */
  expiresAt: number | null;
}
