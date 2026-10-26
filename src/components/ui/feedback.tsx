import type { ComponentProps } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing } from "@/theme";
import { Button } from "./button";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <View style={styles.state} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.description}>{label}</Text>
    </View>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon = "file-tray-outline",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.state}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button title={actionLabel} size="sm" variant="secondary" onPress={onAction} />
      )}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Não foi possível carregar"
      description={message}
      actionLabel={onRetry ? "Tentar novamente" : undefined}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 40,
    paddingHorizontal: spacing.xl,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    marginBottom: 4,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
  },
  title: { fontSize: 15, fontWeight: "800", color: colors.foreground, textAlign: "center" },
  description: {
    maxWidth: 300,
    marginBottom: 6,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    textAlign: "center",
  },
});
