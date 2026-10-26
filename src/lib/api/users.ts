import type { AuthUser, RegisterInput } from "@/types/auth";
import { apiRequest } from "./client";

export const usersApi = {
  register(input: RegisterInput) {
    return apiRequest<AuthUser & { isActive: boolean }>("/users", {
      method: "POST",
      body: input,
    });
  },
};
