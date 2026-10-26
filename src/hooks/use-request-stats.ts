import { useMemo } from "react";
import type { PurchaseRequest } from "@/types/purchase-request";

export interface RequestStats {
  total: number;
  drafts: number;
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  approvalRate: number;
}

export function useRequestStats(requests: PurchaseRequest[]): RequestStats {
  return useMemo(() => {
    const count = (status: PurchaseRequest["status"]) =>
      requests.filter((request) => request.status === status).length;

    const approved = count("approved");
    const rejected = count("rejected");
    const decided = approved + rejected;

    return {
      total: requests.length,
      drafts: count("draft"),
      pending: count("pending"),
      approved,
      rejected,
      totalAmount: requests.reduce((sum, request) => sum + Number(request.estimatedAmount), 0),
      approvalRate: decided === 0 ? 0 : Math.round((approved / decided) * 100),
    };
  }, [requests]);
}
