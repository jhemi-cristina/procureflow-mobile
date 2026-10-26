import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, type Href } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, radius, spacing } from "@/theme";

interface AuthScreenProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  switchPrompt: { text: string; linkLabel: string; href: Href };
}

export function AuthScreen({ title, subtitle, children, switchPrompt }: AuthScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.brandMark}>
              <Ionicons name="cart-outline" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>procureflow</Text>
            <Text style={styles.brandTagline}>GESTÃO INTELIGENTE DE COMPRAS</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.form}>{children}</View>
          </View>

          <Text style={styles.switchPrompt}>
            {switchPrompt.text}{" "}
            <Link href={switchPrompt.href} replace style={styles.switchLink}>
              {switchPrompt.linkLabel}
            </Link>
          </Text>

          <Text style={styles.footer}>© 2026 ProcureFlow. Todos os direitos reservados.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <View style={styles.formError} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={17} color="#B42332" />
      <Text style={styles.formErrorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  hero: { alignItems: "center", marginBottom: spacing.xxl },
  brandMark: {
    alignItems: "center",
    justifyContent: "center",
    width: 58,
    height: 58,
    backgroundColor: colors.primary,
    borderRadius: 17,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  brandName: {
    marginTop: 14,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -1,
    color: colors.foreground,
  },
  brandTagline: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: colors.mutedLight,
  },
  card: {
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    shadowColor: "#201E46",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.8, color: colors.foreground },
  subtitle: { marginTop: 6, fontSize: 14, lineHeight: 21, color: colors.muted },
  form: { gap: spacing.lg, marginTop: spacing.xxl },
  formError: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: "#FFD7DC",
    borderRadius: radius.sm,
  },
  formErrorText: { flex: 1, fontSize: 13, lineHeight: 19, color: "#B42332" },
  switchPrompt: {
    marginTop: spacing.xxl,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
  },
  switchLink: { fontWeight: "700", color: colors.primary },
  footer: { marginTop: spacing.lg, fontSize: 12, color: colors.mutedLight, textAlign: "center" },
});
