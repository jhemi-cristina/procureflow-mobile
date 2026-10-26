import { colors } from "@/theme";
import type { UserRole } from "@/types/auth";
import type { PurchaseRequestStatus } from "@/types/purchase-request";

export const STATUS_META: Record<
  PurchaseRequestStatus,
  { label: string; color: string; background: string }
> = {
  draft: { label: "Rascunho", color: colors.neutral, background: colors.neutralSoft },
  pending: { label: "Em aprovação", color: colors.warning, background: colors.warningSoft },
  approved: { label: "Aprovada", color: colors.success, background: colors.successSoft },
  rejected: { label: "Rejeitada", color: colors.danger, background: colors.dangerSoft },
  cancelled: { label: "Cancelada", color: colors.muted, background: colors.borderSoft },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador(a)",
  approver: "Aprovador(a)",
  requester: "Solicitante",
};

export function canDecide(role: UserRole | undefined) {
  return role === "admin" || role === "approver";
}
