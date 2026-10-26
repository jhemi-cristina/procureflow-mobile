import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { purchaseRequestsApi } from "@/lib/api/purchase-requests";
import type {
  DecidePurchaseRequestInput,
  PurchaseRequest,
  PurchaseRequestInput,
} from "@/types/purchase-request";
import { useAuth } from "./use-auth";

export const purchaseRequestKeys = {
  all: ["purchase-requests"] as const,
};

function requireToken(token: string | null) {
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");
  return token;
}

/** Invalida a lista após qualquer mutação para manter os dados sincronizados com a API. */
function useInvalidateRequests() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: purchaseRequestKeys.all });
}

export function usePurchaseRequests() {
  const { token } = useAuth();

  return useQuery({
    queryKey: purchaseRequestKeys.all,
    queryFn: () => purchaseRequestsApi.list(requireToken(token)),
    enabled: Boolean(token),
  });
}

/**
 * Lê uma solicitação a partir da lista em cache (a API só lista as do próprio usuário,
 * então a lista já contém tudo que esta tela pode exibir).
 */
export function usePurchaseRequest(id: string | undefined) {
  const { token } = useAuth();

  return useQuery({
    queryKey: purchaseRequestKeys.all,
    queryFn: () => purchaseRequestsApi.list(requireToken(token)),
    enabled: Boolean(token && id),
    select: (requests: PurchaseRequest[]) =>
      requests.find((request) => request.id === id) ?? null,
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
      /** Quando informado, atualiza o rascunho; senão, cria um novo. */
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
