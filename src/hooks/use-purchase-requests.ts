import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { purchaseRequestsApi } from "@/lib/api/purchase-requests";
import { canDecide } from "@/lib/purchase-requests";
import type {
  DecidePurchaseRequestInput,
  PurchaseRequest,
  PurchaseRequestInput,
} from "@/types/purchase-request";
import { useAuth } from "./use-auth";

export const purchaseRequestKeys = {
  all: ["purchase-requests"] as const,
  mine: ["purchase-requests", "mine"] as const,
  approvals: ["purchase-requests", "approvals"] as const,
  team: ["purchase-requests", "team"] as const,
  recent: (limit: number) => ["purchase-requests", "recent", limit] as const,
  detail: (id: string) => ["purchase-requests", "detail", id] as const,
};

export const RECENT_CACHE_LIMIT = 4;

function requireToken(token: string | null) {
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");
  return token;
}

function useInvalidateRequests() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: purchaseRequestKeys.all });
}

export function usePurchaseRequests() {
  const { token } = useAuth();

  return useQuery({
    queryKey: purchaseRequestKeys.mine,
    queryFn: () => purchaseRequestsApi.list(requireToken(token)),
    enabled: Boolean(token),
  });
}

export function useApprovalQueue() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: purchaseRequestKeys.approvals,
    queryFn: () => purchaseRequestsApi.approvals(requireToken(token)),
    enabled: Boolean(token) && canDecide(user?.role),
  });
}

export function useTeamRequests() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: purchaseRequestKeys.team,
    queryFn: () => purchaseRequestsApi.team(requireToken(token)),
    enabled: Boolean(token) && canDecide(user?.role),
  });
}

export function useTeamRecentRequests(limit: number) {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: purchaseRequestKeys.recent(limit),
    queryFn: () => purchaseRequestsApi.recent(requireToken(token), limit),
    enabled: Boolean(token) && canDecide(user?.role),
  });
}

export function usePurchaseRequest(id: string | undefined) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: purchaseRequestKeys.detail(id ?? ""),
    queryFn: () => purchaseRequestsApi.get(requireToken(token), id!),
    enabled: Boolean(token && id),
    placeholderData: () =>
      [
        purchaseRequestKeys.mine,
        purchaseRequestKeys.approvals,
        purchaseRequestKeys.team,
        purchaseRequestKeys.recent(RECENT_CACHE_LIMIT),
      ]
        .flatMap((key) => queryClient.getQueryData<PurchaseRequest[]>(key) ?? [])
        .find((request) => request.id === id),
  });
}

export function useSavePurchaseRequest() {
  const { token } = useAuth();
  const invalidate = useInvalidateRequests();

  return useMutation({
    mutationFn: async ({
      id,
      input,
      submit,
    }: {
      id?: string;
      input: PurchaseRequestInput;
      submit: boolean;
    }) => {
      const auth = requireToken(token);
      const saved = id
        ? await purchaseRequestsApi.update(auth, id, input)
        : await purchaseRequestsApi.create(auth, input);
      return submit ? purchaseRequestsApi.submit(auth, saved.id) : saved;
    },
    onSettled: invalidate,
  });
}

export function useSubmitPurchaseRequest() {
  const { token } = useAuth();
  const invalidate = useInvalidateRequests();

  return useMutation({
    mutationFn: (id: string) => purchaseRequestsApi.submit(requireToken(token), id),
    onSettled: invalidate,
  });
}

export function useDecidePurchaseRequest() {
  const { token } = useAuth();
  const invalidate = useInvalidateRequests();

  return useMutation({
    mutationFn: ({ id, ...input }: DecidePurchaseRequestInput & { id: string }) =>
      purchaseRequestsApi.decide(requireToken(token), id, input),
    onSettled: invalidate,
  });
}
