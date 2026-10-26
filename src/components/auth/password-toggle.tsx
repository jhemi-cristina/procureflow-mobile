import { Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme";

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={visible ? "Ocultar senha" : "Mostrar senha"}
      hitSlop={10}
    >
      <Ionicons
        name={visible ? "eye-off-outline" : "eye-outline"}
        size={20}
        color={colors.mutedLight}
      />
    </Pressable>
  );
}
