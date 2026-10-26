import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { usePurchaseRequest, useSavePurchaseRequest } from "@/hooks/use-purchase-requests";
import { getErrorMessage } from "@/lib/api/client";
import { colors, spacing } from "@/theme";
import type { PurchaseRequestInput } from "@/types/purchase-request";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { RequestForm } from "@/components/requests/request-form";

export default function RequestFormScreen() {
  // Sem `id` o formulário cria uma solicitação; com `id`, edita o rascunho.
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const { data: request, isPending } = usePurchaseRequest(id);
  const save = useSavePurchaseRequest();

  const handleSave = (input: PurchaseRequestInput, submit: boolean) => {
    save.mutate(
      { id, input, submit },
      {
        onSuccess: () => router.back(),
        onError: (error) => {
          const message = getErrorMessage(error);
          if (Platform.OS === "web") globalThis.alert?.(message);
          else Alert.alert("Não foi possível salvar", message);
        },
      },
    );
  };

  if (isEditing && isPending) return <LoadingState />;
  if (isEditing && request?.status !== "draft") {
    return (
      <EmptyState
        icon="lock-closed-outline"
        title="Edição indisponível"
        description="Somente solicitações em rascunho podem ser editadas."
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: isEditing ? "Editar rascunho" : "Nova solicitação" }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Salve como rascunho para revisar depois ou envie direto para aprovação.
        </Text>
        <RequestForm request={request} saving={save.isPending} onSave={handleSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  intro: { marginBottom: spacing.xl, fontSize: 13, lineHeight: 19, color: colors.muted },
});
