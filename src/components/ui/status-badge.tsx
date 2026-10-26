import { StyleSheet, Text, View } from "react-native";
import { STATUS_META } from "@/lib/purchase-requests";
import type { PurchaseRequestStatus } from "@/types/purchase-request";

export function StatusBadge({ status }: { status: PurchaseRequestStatus }) {
  const { label, color, background } = STATUS_META[status];

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: "600" },
});
