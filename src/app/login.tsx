import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api/client";
import { colors, radius, spacing } from "@/theme";
import { Button } from "@/components/ui/button";
import { TextField, type TextInputHandle } from "@/components/ui/text-field";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInputHandle>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Ao salvar a sessão, o Stack.Protected troca automaticamente para as abas.
  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn({ email: values.email.trim(), password: values.password });
    } catch (error) {
      setError("root", {
        message: getErrorMessage(error, "Não foi possível entrar. Verifique suas credenciais."),
      });
    }
  });

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
              Bem-vindo(a) de volta
            </Text>
            <Text style={styles.subtitle}>Entre com suas credenciais para acessar sua conta.</Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <TextField
                    label="E-mail"
                    placeholder="seu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="username"
                    returnKeyType="next"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    error={errors.email?.message}
                    icon={<Ionicons name="mail-outline" size={18} color={colors.mutedLight} />}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <TextField
                    ref={passwordRef}
                    label="Senha"
                    placeholder="Digite sua senha"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="go"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    onSubmitEditing={() => void onSubmit()}
                    error={errors.password?.message}
                    icon={
                      <Ionicons name="lock-closed-outline" size={18} color={colors.mutedLight} />
                    }
                    trailing={
                      <Pressable
                        onPress={() => setShowPassword((visible) => !visible)}
                        accessibilityRole="button"
                        accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        hitSlop={10}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color={colors.mutedLight}
                        />
                      </Pressable>
                    }
                  />
                )}
              />

              {errors.root?.message && (
                <View style={styles.formError} accessibilityRole="alert">
                  <Ionicons name="alert-circle-outline" size={17} color="#B42332" />
                  <Text style={styles.formErrorText}>{errors.root.message}</Text>
                </View>
              )}

              <Button
                title={isSubmitting ? "Entrando..." : "Entrar"}
                size="lg"
                loading={isSubmitting}
                onPress={() => void onSubmit()}
                style={styles.submit}
              />
            </View>
          </View>

          <Text style={styles.footer}>© 2026 ProcureFlow. Todos os direitos reservados.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  submit: { marginTop: spacing.xs },
  footer: { marginTop: spacing.xxl, fontSize: 12, color: colors.mutedLight, textAlign: "center" },
});
