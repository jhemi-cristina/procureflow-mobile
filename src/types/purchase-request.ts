import type { UserRole } from "./auth";

export type PurchaseRequestStatus = "draft" | "pending" | "approved" | "rejected" | "cancelled";

export interface PurchaseRequestUser {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
}

export interface PurchaseRequest {
  id: string;
  title: string;
  description: string | null;
  /** Valor numérico serializado como string pela API (ex.: "1250.00"). */
  estimatedAmount: string;
  status: PurchaseRequestStatus;
  requester: PurchaseRequestUser;
  decidedBy?: PurchaseRequestUser | null;
  decisionReason: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequestInput {
  title: string;
  description?: string;
  estimatedAmount: string;
}

export type PurchaseRequestDecision = "approved" | "rejected";

export interface DecidePurchaseRequestInput {
  decision: PurchaseRequestDecision;
  reason?: string;
}
