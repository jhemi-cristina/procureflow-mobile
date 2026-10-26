import { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api/client";
import { colors, spacing } from "@/theme";
import { Button } from "@/components/ui/button";
import { TextField, type TextInputHandle } from "@/components/ui/text-field";
import { AuthScreen, FormError } from "@/components/auth/auth-screen";
import { PasswordToggle } from "@/components/auth/password-toggle";

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
    <AuthScreen
      title="Bem-vindo(a) de volta"
      subtitle="Entre com suas credenciais para acessar sua conta."
      switchPrompt={{ text: "Ainda não tem conta?", linkLabel: "Criar conta", href: "/register" }}
    >
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
            icon={<Ionicons name="lock-closed-outline" size={18} color={colors.mutedLight} />}
            trailing={
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((visible) => !visible)}
              />
            }
          />
        )}
      />

      {errors.root?.message && <FormError message={errors.root.message} />}

      <Button
        title={isSubmitting ? "Entrando..." : "Entrar"}
        size="lg"
        loading={isSubmitting}
        onPress={() => void onSubmit()}
        style={styles.submit}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: spacing.xs },
});
