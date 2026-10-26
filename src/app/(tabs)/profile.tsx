import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/hooks/use-auth";
import { apiBaseUrl } from "@/lib/api/client";
import { ROLE_LABELS } from "@/lib/purchase-requests";
import { colors, radius, spacing } from "@/theme";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenHeader } from "@/components/layout/screen-header";

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={colors.muted} />
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} selectable>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const confirmSignOut = () => {
    // Alert com botões não existe na web; lá a saída é direta.
    if (Platform.OS === "web") return signOut();
    Alert.alert("Sair da conta", "Deseja encerrar sua sessão neste dispositivo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: signOut },
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Perfil" />

        <Card style={styles.profile}>
          <Avatar name={user.name} size={64} solid />
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.role}>
            <Text style={styles.roleText}>{ROLE_LABELS[user.role] ?? user.role}</Text>
          </View>
        </Card>

        <Card style={styles.info}>
          <InfoRow icon="mail-outline" label="E-mail" value={user.email} />
          <View style={styles.divider} />
          <InfoRow icon="server-outline" label="Servidor da API" value={apiBaseUrl} />
        </Card>

        <Button
          title="Sair da conta"
          variant="danger"
          size="lg"
          icon={<Ionicons name="log-out-outline" size={19} color={colors.danger} />}
          onPress={confirmSignOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.lg },
  profile: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  name: { marginTop: spacing.sm, fontSize: 19, fontWeight: "800", color: colors.foreground },
  role: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
  },
  roleText: { fontSize: 12, fontWeight: "700", color: colors.primaryText },
  info: { paddingVertical: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  rowCopy: { flex: 1, gap: 3 },
  rowLabel: { fontSize: 11, fontWeight: "600", color: colors.muted },
  rowValue: { fontSize: 14, color: colors.foreground },
  divider: { height: 1, backgroundColor: colors.borderSoft },
});
