import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/hooks/use-auth";
import { usePurchaseRequests } from "@/hooks/use-purchase-requests";
import { useRequestStats } from "@/hooks/use-request-stats";
import { getErrorMessage } from "@/lib/api/client";
import { formatCompactCurrency, getFirstName, greetingFor } from "@/lib/format";
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
  const { data: requests = [], isPending, isError, error, refetch, isRefetching } =
    usePurchaseRequests();
  const stats = useRequestStats(requests);
  // Data fixada na montagem: mantém o render puro e consistente.
  const [now] = useState(() => new Date());

  const pending = requests.filter((request) => request.status === "pending");
  const openForm = () => router.push("/request/form");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <ScreenHeader
          eyebrow={weekdayFormatter.format(now)}
          title={`${greetingFor(now)}, ${getFirstName(user?.name ?? "")}`}
          description="Resumo das suas solicitações de compra."
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
                footnote={pluralize(stats.drafts, "rascunho", "rascunhos")}
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
                title="Aguardando aprovação"
                description={pluralize(pending.length, "solicitação pendente", "solicitações pendentes")}
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
                title="Recentes"
                action={
                  <Link href="/requests" style={styles.link}>
                    Ver todas
                  </Link>
                }
              />
              {requests.length === 0 ? (
                <EmptyState
                  title="Nenhuma solicitação ainda"
                  description="Crie sua primeira solicitação de compra para começar."
                  actionLabel="Nova solicitação"
                  onAction={openForm}
                />
              ) : (
                <View style={styles.list}>
                  {requests.slice(0, RECENT_LIMIT).map((request) => (
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
