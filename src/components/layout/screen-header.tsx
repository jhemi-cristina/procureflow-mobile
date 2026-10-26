import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function ScreenHeader({ eyebrow, title, description, action }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        {eyebrow && (
          <View style={styles.eyebrowRow}>
            <View style={styles.dot} />
            <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
          </View>
        )}
        <Text style={typography.title} accessibilityRole="header">
          {title}
        </Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  copy: { flex: 1, gap: 6 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#6F63ED" },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 1, color: "#818CA0" },
  description: { fontSize: 13, lineHeight: 19, color: colors.muted },
});
