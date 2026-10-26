import type { ReactNode } from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";
import { colors, radius, shadow, spacing, typography } from "@/theme";

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={typography.heading}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerCopy: { flex: 1, gap: 3 },
  description: { fontSize: 12, color: colors.muted, lineHeight: 18 },
});
