import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/hooks/use-auth";
import {
  RECENT_CACHE_LIMIT,
  useApprovalQueue,
  usePurchaseRequests,
  useTeamRecentRequests,
  useTeamRequests,
} from "@/hooks/use-purchase-requests";
import { useRequestStats } from "@/hooks/use-request-stats";
import { getErrorMessage } from "@/lib/api/client";
import { formatCompactCurrency, getFirstName, greetingFor } from "@/lib/format";
import { canDecide } from "@/lib/purchase-requests";
import { colors, spacing } from "@/theme";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/feedback";
import { ScreenHeader } from "@/components/layout/screen-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RequestCard } from "@/components/requests/request-card";

const RECENT_LIMIT = 4;

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const isApprover = canDecide(user?.role);
  const mine = usePurchaseRequests();
  const teamAll = useTeamRequests();
  const { data: requests = [], isPending, isError, error, refetch, isRefetching } = isApprover
    ? teamAll
    : mine;
  const myRequests = mine.data ?? [];
  const stats = useRequestStats(requests);
  const people = new Set(requests.map((request) => request.requester.id)).size;
  const [now] = useState(() => new Date());

  const queue = useApprovalQueue();
  const pending = isApprover
    ? (queue.data ?? [])
    : myRequests.filter((request) => request.status === "pending");
  const team = useTeamRecentRequests(RECENT_CACHE_LIMIT);
  const recent = isApprover ? (team.data ?? []) : myRequests.slice(0, RECENT_LIMIT);

  const openForm = () => router.push("/request/form");
  const refreshAll = () => {
    void refetch();
    if (isApprover) {
      void mine.refetch();
      void queue.refetch();
      void team.refetch();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching || queue.isRefetching || team.isRefetching}
            onRefresh={refreshAll}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <ScreenHeader
          eyebrow={weekdayFormatter.format(now)}
          title={`${greetingFor(now)}, ${getFirstName(user?.name ?? "")}`}
          description={
            isApprover
              ? "Resumo das solicitações de toda a equipe."
              : "Resumo das suas solicitações de compra."
          }
        />

        <Button
          title="Nova solicitação"
          icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
          onPress={openForm}
          style={styles.newButton}
        />

        {isPending ? (
          <LoadingState label="Carregando painel..." />
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <>
            <View style={styles.metrics}>
              <MetricCard
                title="Total"
                value={String(stats.total)}
                footnote={
                  isApprover
                    ? `De ${pluralize(people, "pessoa", "pessoas")}`
                    : pluralize(stats.drafts, "rascunho", "rascunhos")
                }
                icon="clipboard-outline"
                tone="violet"
              />
              <MetricCard
                title="Em aprovação"
                value={String(stats.pending)}
                footnote="Aguardando decisão"
                icon="time-outline"
                tone="amber"
              />
              <MetricCard
                title="Aprovadas"
                value={String(stats.approved)}
                footnote={`Taxa de ${stats.approvalRate}%`}
                icon="checkmark-circle-outline"
                tone="green"
              />
              <MetricCard
                title="Valor solicitado"
                value={formatCompactCurrency(stats.totalAmount)}
                footnote="Soma de todas"
                icon="wallet-outline"
                tone="blue"
              />
            </View>

            <View style={styles.section}>
              <SectionHeader
                title={isApprover ? "Para você aprovar" : "Aguardando aprovação"}
                description={pluralize(pending.length, "solicitação pendente", "solicitações pendentes")}
                action={
                  isApprover && pending.length > 0 ? (
                    <Link href="/approvals" style={styles.link}>
                      Ver fila
                    </Link>
                  ) : undefined
                }
              />
              {pending.length === 0 ? (
                <EmptyState
                  icon="checkmark-done-outline"
                  title="Tudo em dia"
                  description="Nenhuma solicitação pendente no momento."
                />
              ) : (
                <View style={styles.list}>
                  {pending.slice(0, RECENT_LIMIT).map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <SectionHeader
                title={isApprover ? "Recentes da equipe" : "Recentes"}
                description={
                  isApprover ? "Últimas solicitações enviadas por todos os usuários." : undefined
                }
                action={
                  <Link href={isApprover ? "/approvals" : "/requests"} style={styles.link}>
                    {isApprover ? "Ver fila" : "Ver todas"}
                  </Link>
                }
              />
              {isApprover && team.isPending ? (
                <LoadingState label="Carregando solicitações..." />
              ) : isApprover && team.isError ? (
                <ErrorState message={getErrorMessage(team.error)} onRetry={team.refetch} />
              ) : recent.length === 0 ? (
                <EmptyState
                  title="Nenhuma solicitação ainda"
                  description={
                    isApprover
                      ? "Quando a equipe enviar solicitações, elas aparecem aqui."
                      : "Crie sua primeira solicitação de compra para começar."
                  }
                  actionLabel="Nova solicitação"
                  onAction={openForm}
                />
              ) : (
                <View style={styles.list}>
                  {recent.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  newButton: { marginBottom: spacing.xl },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  section: { marginTop: spacing.xxl },
  list: { gap: spacing.md },
  link: { fontSize: 13, fontWeight: "700", color: colors.primary },
});
