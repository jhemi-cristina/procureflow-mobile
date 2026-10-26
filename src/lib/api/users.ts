import type { ManagedUser, Paginated, RegisterInput, UserRole } from "@/types/auth";
import { apiRequest } from "./client";

function userPath(id: string, action: string) {
  return `/users/${encodeURIComponent(id)}/${action}`;
}

export const usersApi = {
  register(input: RegisterInput) {
    return apiRequest<ManagedUser>("/users", {
      method: "POST",
      body: input,
    });
  },

  list(token: string, page: number, limit: number) {
    return apiRequest<Paginated<ManagedUser>>(`/users?page=${page}&limit=${limit}`, { token });
  },

  updateRole(token: string, id: string, role: UserRole) {
    return apiRequest<ManagedUser>(userPath(id, "role"), {
      method: "PATCH",
      token,
      body: { role },
    });
  },

  setActive(token: string, id: string, active: boolean) {
    return apiRequest<ManagedUser>(userPath(id, active ? "activate" : "deactivate"), {
      method: "PATCH",
      token,
    });
  },
};
