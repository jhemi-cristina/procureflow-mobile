import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSetUserActive, useUpdateUserRole } from "@/hooks/use-users";
import { getErrorMessage } from "@/lib/api/client";
import { ROLE_LABELS } from "@/lib/purchase-requests";
import { colors, radius, shadow, spacing } from "@/theme";
import type { ManagedUser, UserRole } from "@/types/auth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

const ROLES: UserRole[] = ["admin", "approver", "requester"];

function notify(title: string, message: string) {
  if (Platform.OS === "web") globalThis.alert?.(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

function confirm(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: "Confirmar", onPress: onConfirm },
  ]);
}

interface UserCardProps {
  user: ManagedUser;
  isSelf: boolean;
}

export function UserCard({ user, isSelf }: UserCardProps) {
  const updateRole = useUpdateUserRole();
  const setActive = useSetUserActive();

  const changeRole = (role: UserRole) => {
    if (role === user.role || isSelf) return;
    confirm("Alterar perfil", `Definir ${user.name} como ${ROLE_LABELS[role]}?`, () =>
      updateRole.mutate({ id: user.id, role }, { onError: (error) => notify("Erro", getErrorMessage(error)) }),
    );
  };

  const toggleActive = () => {
    const action = user.isActive ? "Desativar" : "Reativar";
    confirm(`${action} usuário`, `${action} a conta de ${user.name}?`, () =>
      setActive.mutate(
        { id: user.id, active: !user.isActive },
        { onError: (error) => notify("Erro", getErrorMessage(error)) },
      ),
    );
  };

  return (
    <View style={[styles.card, !user.isActive && styles.inactive]}>
      <View style={styles.header}>
        <Avatar name={user.name} />
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
            {isSelf && (
              <View style={styles.selfTag}>
                <Text style={styles.selfTagText}>Você</Text>
              </View>
            )}
          </View>
          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
        <View style={[styles.status, user.isActive ? styles.statusActive : styles.statusInactive]}>
          <Text style={[styles.statusText, { color: user.isActive ? colors.success : colors.muted }]}>
            {user.isActive ? "Ativo" : "Inativo"}
          </Text>
        </View>
      </View>

      <Text style={styles.label}>Perfil</Text>
      <View style={styles.roles}>
        {ROLES.map((role) => (
          <Chip
            key={role}
            label={ROLE_LABELS[role]}
            selected={user.role === role}
            onPress={() => changeRole(role)}
          />
        ))}
      </View>

      {isSelf ? (
        <View style={styles.selfNote}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.muted} />
          <Text style={styles.selfNoteText}>Você não pode alterar o próprio perfil.</Text>
        </View>
      ) : (
        <Button
          title={user.isActive ? "Desativar conta" : "Reativar conta"}
          size="sm"
          variant={user.isActive ? "danger" : "success"}
          loading={setActive.isPending}
          onPress={toggleActive}
          style={styles.toggle}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  inactive: { opacity: 0.7 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  identity: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { flexShrink: 1, fontSize: 15, fontWeight: "700", color: colors.foreground },
  email: { fontSize: 12, color: colors.muted },
  selfTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 5,
  },
  selfTagText: { fontSize: 10, fontWeight: "700", color: colors.primaryText },
  status: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 },
  statusActive: { backgroundColor: colors.successSoft },
  statusInactive: { backgroundColor: colors.borderSoft },
  statusText: { fontSize: 11, fontWeight: "700" },
  label: {
    marginTop: spacing.sm,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: colors.muted,
  },
  roles: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  selfNote: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.xs },
  selfNoteText: { fontSize: 12, color: colors.muted },
  toggle: { alignSelf: "flex-start", marginTop: spacing.xs },
});
