import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatCurrency, formatDate } from "@/lib/format";
import { STATUS_META } from "@/lib/purchase-requests";
import { colors, radius, shadow, spacing } from "@/theme";
import type { PurchaseRequest } from "@/types/purchase-request";
import { StatusBadge } from "@/components/ui/status-badge";

export const RequestCard = memo(function RequestCard({ request }: { request: PurchaseRequest }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${request.title}, ${formatCurrency(request.estimatedAmount)}, ${STATUS_META[request.status].label}`}
      onPress={() => router.push({ pathname: "/request/[id]", params: { id: request.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Ionicons name="document-text-outline" size={19} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {request.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {request.requester.name} · {formatDate(request.createdAt)}
        </Text>
        <View style={styles.footer}>
          <StatusBadge status={request.status} />
          <Text style={styles.amount}>{formatCurrency(request.estimatedAmount)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  pressed: { opacity: 0.85, backgroundColor: "#FCFCFF" },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    backgroundColor: colors.primarySoft,
    borderRadius: 11,
  },
  body: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  meta: { fontSize: 12, color: colors.muted },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  amount: { fontSize: 14, fontWeight: "800", color: colors.foreground },
});
