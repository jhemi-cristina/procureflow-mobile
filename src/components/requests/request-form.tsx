import { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fromApiAmount, toApiAmount } from "@/lib/format";
import { spacing } from "@/theme";
import type { PurchaseRequest, PurchaseRequestInput } from "@/types/purchase-request";
import { Button } from "@/components/ui/button";
import { TextField, type TextInputHandle } from "@/components/ui/text-field";

// Aceita "1250", "1250,50", "1.250,50" ou "1250.50".
const AMOUNT_PATTERN = /^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$|^\d+(\.\d{1,2})?$/;

const requestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título deve ter pelo menos 3 caracteres.")
    .max(180, "O título deve ter no máximo 180 caracteres."),
  description: z.string().trim().max(2000, "A descrição deve ter no máximo 2000 caracteres."),
  estimatedAmount: z
    .string()
    .trim()
    .regex(AMOUNT_PATTERN, "Informe um valor válido, ex.: 1.250,00")
    .refine((value) => Number(toApiAmount(value)) > 0, "O valor deve ser maior que zero.")
    .refine((value) => Number(toApiAmount(value)) < 1e10, "Valor acima do limite permitido."),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestFormProps {
  request?: PurchaseRequest | null;
  saving: boolean;
  onSave: (input: PurchaseRequestInput, submit: boolean) => void;
}

export function RequestForm({ request, saving, onSave }: RequestFormProps) {
  const amountRef = useRef<TextInputHandle>(null);
  const descriptionRef = useRef<TextInputHandle>(null);

  const { control, handleSubmit } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: request?.title ?? "",
      description: request?.description ?? "",
      estimatedAmount: request ? fromApiAmount(request.estimatedAmount) : "",
    },
  });

  const save = (submit: boolean) => () =>
    void handleSubmit((values) =>
      onSave(
        {
          title: values.title,
          description: values.description || undefined,
          estimatedAmount: toApiAmount(values.estimatedAmount),
        },
        submit,
      ),
    )();

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <TextField
            label="Título"
            placeholder="Ex.: Notebooks para o time de produto"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            returnKeyType="next"
            onSubmitEditing={() => amountRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="estimatedAmount"
        render={({ field, fieldState }) => (
          <TextField
            ref={amountRef}
            label="Valor estimado (R$)"
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            icon={<Ionicons name="cash-outline" size={18} color="#9AA3B3" />}
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <TextField
            ref={descriptionRef}
            label="Descrição"
            placeholder="Detalhe o que será comprado e a justificativa (opcional)"
            multiline
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <View style={styles.actions}>
        <Button
          title="Salvar e enviar para aprovação"
          size="lg"
          loading={saving}
          icon={<Ionicons name="paper-plane-outline" size={17} color="#FFFFFF" />}
          onPress={save(true)}
        />
        <Button
          title="Salvar como rascunho"
          size="lg"
          variant="secondary"
          disabled={saving}
          onPress={save(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
