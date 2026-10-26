import { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/hooks/use-auth";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import { colors, spacing } from "@/theme";
import { Button } from "@/components/ui/button";
import { TextField, type TextInputHandle } from "@/components/ui/text-field";
import { AuthScreen, FormError } from "@/components/auth/auth-screen";
import { PasswordToggle } from "@/components/auth/password-toggle";

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe seu nome completo.")
      .max(150, "O nome deve ter no máximo 150 caracteres."),
    email: z
      .email("Informe um e-mail válido.")
      .max(180, "O e-mail deve ter no máximo 180 caracteres."),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .max(72, "A senha deve ter no máximo 72 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const emailRef = useRef<TextInputHandle>(null);
  const passwordRef = useRef<TextInputHandle>(null);
  const confirmRef = useRef<TextInputHandle>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    try {
      await signUp({ name, email: email.trim(), password });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setError("email", { message: error.message });
        return;
      }
      setError("root", { message: getErrorMessage(error, "Não foi possível criar sua conta.") });
    }
  });

  const toggle = (
    <PasswordToggle
      visible={showPassword}
      onToggle={() => setShowPassword((visible) => !visible)}
    />
  );
  const lockIcon = <Ionicons name="lock-closed-outline" size={18} color={colors.mutedLight} />;

  return (
    <AuthScreen
      title="Crie sua conta"
      subtitle="Cadastre-se para criar e acompanhar suas solicitações de compra."
      switchPrompt={{ text: "Já tem uma conta?", linkLabel: "Entrar", href: "/login" }}
    >
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextField
            label="Nome completo"
            placeholder="Como você quer ser chamado(a)"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={() => emailRef.current?.focus()}
            error={errors.name?.message}
            icon={<Ionicons name="person-outline" size={18} color={colors.mutedLight} />}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            ref={emailRef}
            label="E-mail"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
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
            placeholder="Mínimo de 8 caracteres"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={() => confirmRef.current?.focus()}
            error={errors.password?.message}
            icon={lockIcon}
            trailing={toggle}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <TextField
            ref={confirmRef}
            label="Confirmar senha"
            placeholder="Repita a senha"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={() => void onSubmit()}
            error={errors.confirmPassword?.message}
            icon={lockIcon}
          />
        )}
      />

      {errors.root?.message && <FormError message={errors.root.message} />}

      <Button
        title={isSubmitting ? "Criando conta..." : "Criar conta"}
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
