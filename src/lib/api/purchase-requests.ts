import type {
  DecidePurchaseRequestInput,
  PurchaseRequest,
  PurchaseRequestInput,
} from "@/types/purchase-request";
import { apiRequest } from "./client";

const BASE_PATH = "/purchase-requests";

function requestPath(id: string, action?: string) {
  const path = `${BASE_PATH}/${encodeURIComponent(id)}`;
  return action ? `${path}/${action}` : path;
}

export const purchaseRequestsApi = {
  list(token: string) {
    return apiRequest<PurchaseRequest[]>(BASE_PATH, { token });
  },

  approvals(token: string) {
    return apiRequest<PurchaseRequest[]>(`${BASE_PATH}/approvals`, { token });
  },

  team(token: string) {
    return apiRequest<PurchaseRequest[]>(`${BASE_PATH}/team`, { token });
  },

  recent(token: string, limit = 10) {
    return apiRequest<PurchaseRequest[]>(`${BASE_PATH}/recent?limit=${limit}`, { token });
  },

  get(token: string, id: string) {
    return apiRequest<PurchaseRequest>(requestPath(id), { token });
  },

  create(token: string, input: PurchaseRequestInput) {
    return apiRequest<PurchaseRequest>(BASE_PATH, { method: "POST", token, body: input });
  },

  update(token: string, id: string, input: Partial<PurchaseRequestInput>) {
    return apiRequest<PurchaseRequest>(requestPath(id), { method: "PATCH", token, body: input });
  },

  submit(token: string, id: string) {
    return apiRequest<PurchaseRequest>(requestPath(id, "submit"), { method: "PATCH", token });
  },

  decide(token: string, id: string, input: DecidePurchaseRequestInput) {
    return apiRequest<PurchaseRequest>(requestPath(id, "decision"), {
      method: "PATCH",
      token,
      body: input,
    });
  },
};
