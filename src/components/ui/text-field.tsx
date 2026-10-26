import { useState, type ComponentRef, type ReactNode, type Ref } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radius, typography } from "@/theme";

export type TextInputHandle = ComponentRef<typeof TextInput>;

interface TextFieldProps extends Omit<TextInputProps, "ref"> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  ref?: Ref<TextInputHandle>;
}

export function TextField({
  label,
  error,
  hint,
  icon,
  trailing,
  multiline,
  onFocus,
  onBlur,
  style,
  ref,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={typography.label}>{label}</Text>
      <View
        style={[
          styles.control,
          multiline && styles.multiline,
          focused && styles.focused,
          error && styles.invalid,
        ]}
      >
        {icon}
        <TextInput
          ref={ref}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          placeholderTextColor="#A9ADBF"
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {trailing}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : (
        hint && <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  control: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E3E5EE",
    borderRadius: radius.md,
  },
  multiline: { alignItems: "flex-start", minHeight: 110, paddingVertical: 12 },
  focused: { borderColor: colors.primary },
  invalid: { borderColor: colors.danger },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.foreground },
  inputMultiline: { minHeight: 86, paddingVertical: 0 },
  error: { fontSize: 12, color: colors.danger },
  hint: { fontSize: 12, color: colors.muted },
});
