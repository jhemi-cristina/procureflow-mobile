import type { AuthUser, LoginInput, LoginResponse } from "@/types/auth";
import { apiRequest } from "./client";

export const authApi = {
  login(credentials: LoginInput) {
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  getProfile(token: string) {
    return apiRequest<AuthUser>("/auth/profile", { token });
  },
};
