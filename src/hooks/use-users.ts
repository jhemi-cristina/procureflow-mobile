import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import type { UserRole } from "@/types/auth";
import { useAuth } from "./use-auth";

const PAGE_SIZE = 20;

export const userKeys = {
  all: ["users"] as const,
};

function requireToken(token: string | null) {
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");
  return token;
}

export function useUsers() {
  const { token, user } = useAuth();

  return useInfiniteQuery({
    queryKey: userKeys.all,
    queryFn: ({ pageParam }) => usersApi.list(requireToken(token), pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    enabled: Boolean(token) && user?.role === "admin",
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: userKeys.all });
}

export function useUpdateUserRole() {
  const { token } = useAuth();
  const invalidate = useInvalidateUsers();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.updateRole(requireToken(token), id, role),
    onSettled: invalidate,
  });
}

export function useSetUserActive() {
  const { token } = useAuth();
  const invalidate = useInvalidateUsers();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      usersApi.setActive(requireToken(token), id, active),
    onSettled: invalidate,
  });
}
