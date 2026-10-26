import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { getErrorMessage } from "@/lib/api/client";
import { colors, spacing } from "@/theme";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/feedback";
import { ScreenHeader } from "@/components/layout/screen-header";
import { UserCard } from "@/components/users/user-card";

const Separator = () => <View style={{ height: spacing.md }} />;

export default function UsersScreen() {
  const { user: currentUser } = useAuth();
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsers();

  if (currentUser?.role !== "admin") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          icon="lock-closed-outline"
          title="Acesso restrito"
          description="Apenas administradores podem gerenciar usuários."
        />
      </SafeAreaView>
    );
  }

  const users = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserCard user={item} isSelf={item.id === currentUser.id} />}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.content}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <ScreenHeader
            eyebrow="Administração"
            title="Usuários"
            description={
              total > 0
                ? `${total} ${total === 1 ? "usuário cadastrado" : "usuários cadastrados"}. Toque em um perfil para alterá-lo.`
                : "Defina quem pode aprovar solicitações e quem administra a plataforma."
            }
          />
        }
        ListEmptyComponent={
          isPending ? (
            <LoadingState label="Carregando usuários..." />
          ) : isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          ) : (
            <EmptyState icon="people-outline" title="Nenhum usuário encontrado" />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl, flexGrow: 1 },
  footerLoader: { marginTop: spacing.lg },
});
