import { useCallback, useDeferredValue, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { usePurchaseRequests } from "@/hooks/use-purchase-requests";
import { getErrorMessage } from "@/lib/api/client";
import { STATUS_META } from "@/lib/purchase-requests";
import { colors, radius, spacing } from "@/theme";
import type { PurchaseRequest, PurchaseRequestStatus } from "@/types/purchase-request";
import { Chip } from "@/components/ui/chip";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/feedback";
import { ScreenHeader } from "@/components/layout/screen-header";
import { RequestCard } from "@/components/requests/request-card";

const STATUS_FILTERS: ("all" | PurchaseRequestStatus)[] = [
  "all",
  "draft",
  "pending",
  "approved",
  "rejected",
];

type StatusFilter = (typeof STATUS_FILTERS)[number];

function filterRequests(requests: PurchaseRequest[], search: string, status: StatusFilter) {
  const term = search.trim().toLowerCase();
  return requests.filter((request) => {
    if (status !== "all" && request.status !== status) return false;
    if (!term) return true;
    return `${request.title} ${request.description ?? ""} ${request.requester.name}`
      .toLowerCase()
      .includes(term);
  });
}

const renderItem: ListRenderItem<PurchaseRequest> = ({ item }) => <RequestCard request={item} />;
const keyExtractor = (item: PurchaseRequest) => item.id;
const Separator = () => <View style={{ height: spacing.md }} />;

export default function RequestsScreen() {
  const { data: requests = [], isPending, isError, error, refetch, isRefetching } =
    usePurchaseRequests();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(
    () => filterRequests(requests, deferredSearch, status),
    [requests, deferredSearch, status],
  );

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { all: requests.length };
    for (const request of requests) counts[request.status] = (counts[request.status] ?? 0) + 1;
    return counts;
  }, [requests]);

  const renderEmpty = useCallback(() => {
    if (isPending) return <LoadingState label="Carregando solicitações..." />;
    if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
    if (requests.length === 0) {
      return (
        <EmptyState
          title="Nenhuma solicitação ainda"
          description="Toque no botão + para criar a primeira."
        />
      );
    }
    return (
      <EmptyState
        icon="search-outline"
        title="Nenhum resultado"
        description="Ajuste a busca ou o filtro de status."
      />
    );
  }, [isPending, isError, error, refetch, requests.length]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        data={isPending || isError ? [] : filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader
              title="Solicitações"
              description="Acompanhe e envie suas solicitações de compra."
            />

            <View style={styles.search}>
              <Ionicons name="search" size={17} color={colors.mutedLight} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por título ou descrição..."
                placeholderTextColor="#A9ADBF"
                style={styles.searchInput}
                returnKeyType="search"
                clearButtonMode="while-editing"
                accessibilityLabel="Buscar solicitações"
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {STATUS_FILTERS.map((filter) => (
                <Chip
                  key={filter}
                  label={filter === "all" ? "Todas" : STATUS_META[filter].label}
                  count={countByStatus[filter] ?? 0}
                  selected={status === filter}
                  onPress={() => setStatus(filter)}
                />
              ))}
            </ScrollView>
          </View>
        }
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nova solicitação"
        onPress={() => router.push("/request/form")}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 100, flexGrow: 1 },
  header: { marginBottom: spacing.lg },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    height: 46,
    paddingHorizontal: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.foreground },
  chips: { gap: spacing.sm, paddingTop: spacing.md },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    width: 58,
    height: 58,
    backgroundColor: colors.primary,
    borderRadius: 29,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabPressed: { backgroundColor: colors.primaryPressed, transform: [{ scale: 0.96 }] },
});
