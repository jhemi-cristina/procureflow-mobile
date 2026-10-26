import { useState, type ReactNode } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/hooks/use-auth";
import {
  useDecidePurchaseRequest,
  usePurchaseRequest,
  useSubmitPurchaseRequest,
} from "@/hooks/use-purchase-requests";
import { getErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { canDecide } from "@/lib/purchase-requests";
import { colors, spacing } from "@/theme";
import type { PurchaseRequestDecision } from "@/types/purchase-request";
import { Button } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/feedback";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextField } from "@/components/ui/text-field";

const MAX_REASON_LENGTH = 1000;

function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: "Confirmar", onPress: onConfirm },
  ]);
}

function showError(error: unknown) {
  const message = getErrorMessage(error);
  if (Platform.OS === "web") globalThis.alert?.(message);
  else Alert.alert("Não foi possível concluir", message);
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      {typeof children === "string" ? (
        <Text style={styles.detailValue}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: request, isPending, isError, error, refetch } = usePurchaseRequest(id);
  const submitRequest = useSubmitPurchaseRequest();
  const decide = useDecidePurchaseRequest();
  const [reason, setReason] = useState("");

  if (isPending) return <LoadingState label="Carregando solicitação..." />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  if (!request) {
    return (
      <EmptyState
        icon="document-outline"
        title="Solicitação não encontrada"
        description="Ela pode ter sido removida ou não pertence à sua conta."
        actionLabel="Voltar"
        onAction={() => router.back()}
      />
    );
  }

  const isDraft = request.status === "draft";
  const canUserDecide = request.status === "pending" && canDecide(user?.role);

  const submit = () =>
    confirmAction("Enviar para aprovação", "Depois de enviada, a solicitação não poderá ser editada.", () =>
      submitRequest.mutate(request.id, { onError: showError }),
    );

  const registerDecision = (decision: PurchaseRequestDecision) => {
    const isApproval = decision === "approved";
    confirmAction(
      isApproval ? "Aprovar solicitação" : "Rejeitar solicitação",
      `${request.title} · ${formatCurrency(request.estimatedAmount)}`,
      () =>
        decide.mutate(
          { id: request.id, decision, reason: reason.trim() || undefined },
          { onSuccess: () => setReason(""), onError: showError },
        ),
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen options={{ title: request.title }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.summary}>
          <View style={styles.summaryIcon}>
            <Ionicons name="document-text-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.title}>{request.title}</Text>
          <Text style={styles.amount}>{formatCurrency(request.estimatedAmount)}</Text>
          <StatusBadge status={request.status} />
        </Card>

        <Card style={styles.details}>
          <DetailRow label="Solicitante">{request.requester.name}</DetailRow>
          <DetailRow label="Criada em">{formatDateTime(request.createdAt)}</DetailRow>
          {request.decidedAt && (
            <DetailRow label="Decisão em">{formatDateTime(request.decidedAt)}</DetailRow>
          )}
          <DetailRow label="Descrição">
            {request.description || "Nenhuma descrição informada."}
          </DetailRow>
          {request.decisionReason && (
            <DetailRow label="Justificativa da decisão">{request.decisionReason}</DetailRow>
          )}
        </Card>

        {isDraft && (
          <View style={styles.actions}>
            <Button
              title="Enviar para aprovação"
              size="lg"
              loading={submitRequest.isPending}
              icon={<Ionicons name="paper-plane-outline" size={17} color="#FFFFFF" />}
              onPress={submit}
            />
            <Button
              title="Editar rascunho"
              size="lg"
              variant="secondary"
              icon={<Ionicons name="create-outline" size={18} color={colors.primaryText} />}
              onPress={() => router.push({ pathname: "/request/form", params: { id: request.id } })}
            />
          </View>
        )}

        {canUserDecide && (
          <Card>
            <SectionHeader
              title="Sua decisão"
              description="A justificativa é opcional, mas ajuda o solicitante."
            />
            <TextField
              label="Justificativa"
              placeholder="Ex.: Aprovado conforme orçamento do trimestre"
              multiline
              maxLength={MAX_REASON_LENGTH}
              value={reason}
              onChangeText={setReason}
              hint={`${reason.length}/${MAX_REASON_LENGTH} caracteres`}
            />
            <View style={styles.decisionButtons}>
              <Button
                title="Rejeitar"
                variant="danger"
                size="lg"
                style={styles.flex}
                disabled={decide.isPending}
                icon={<Ionicons name="close" size={18} color={colors.danger} />}
                onPress={() => registerDecision("rejected")}
              />
              <Button
                title="Aprovar"
                variant="success"
                size="lg"
                style={styles.flex}
                loading={decide.isPending}
                icon={<Ionicons name="checkmark" size={18} color={colors.success} />}
                onPress={() => registerDecision("approved")}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl },
  summary: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xxl },
  summaryIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    marginBottom: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
  },
  title: { fontSize: 18, fontWeight: "800", color: colors.foreground, textAlign: "center" },
  amount: { fontSize: 26, fontWeight: "800", letterSpacing: -0.8, color: colors.foreground },
  details: { gap: spacing.lg },
  detailRow: { gap: 4 },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: colors.muted,
  },
  detailValue: { fontSize: 14, lineHeight: 21, color: colors.foreground },
  actions: { gap: spacing.md },
  decisionButtons: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
});
