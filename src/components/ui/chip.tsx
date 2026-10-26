import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/theme";

interface ChipProps {
  label: string;
  count?: number;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, count, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {count !== undefined && (
        <View style={[styles.count, selected && styles.countSelected]}>
          <Text style={[styles.countText, selected && styles.labelSelected]}>{count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 36,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
  },
  selected: { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder },
  pressed: { opacity: 0.8 },
  label: { fontSize: 13, fontWeight: "600", color: colors.muted },
  labelSelected: { color: colors.primaryText },
  count: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: colors.borderSoft,
    borderRadius: 6,
    alignItems: "center",
  },
  countSelected: { backgroundColor: "#E2E0FF" },
  countText: { fontSize: 11, fontWeight: "700", color: colors.muted },
});
