import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItem } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/use-auth";
import { useApprovalQueue } from "@/hooks/use-purchase-requests";
import { getErrorMessage } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";
import { canDecide } from "@/lib/purchase-requests";
import { colors, spacing } from "@/theme";
import type { PurchaseRequest } from "@/types/purchase-request";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/feedback";
import { ScreenHeader } from "@/components/layout/screen-header";
import { RequestCard } from "@/components/requests/request-card";

const renderItem: ListRenderItem<PurchaseRequest> = ({ item }) => <RequestCard request={item} />;
const keyExtractor = (item: PurchaseRequest) => item.id;
const Separator = () => <View style={{ height: spacing.md }} />;

export default function ApprovalsScreen() {
  const { user } = useAuth();
  const { data: queue = [], isPending, isError, error, refetch, isRefetching } =
    useApprovalQueue();

  if (!canDecide(user?.role)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          icon="lock-closed-outline"
          title="Acesso restrito"
          description="Apenas administradores e aprovadores podem revisar solicitações."
        />
      </SafeAreaView>
    );
  }

  const totalAmount = queue.reduce((sum, request) => sum + Number(request.estimatedAmount), 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        data={isPending || isError ? [] : queue}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <ScreenHeader
            eyebrow="Fila de aprovação"
            title="Aprovações"
            description={
              queue.length > 0
                ? `${queue.length} pendente(s) · ${formatCurrency(totalAmount)} em análise`
                : "Solicitações da equipe aguardando sua decisão."
            }
          />
        }
        ListEmptyComponent={
          isPending ? (
            <LoadingState label="Carregando fila..." />
          ) : isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          ) : (
            <EmptyState
              icon="checkmark-done-outline"
              title="Nenhuma solicitação pendente"
              description="Quando alguém enviar uma solicitação para aprovação, ela aparece aqui."
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl, flexGrow: 1 },
});
