import { StyleSheet, Text, View } from "react-native";
import { getInitials } from "@/lib/format";
import { colors } from "@/theme";

const TONES = [
  { color: "#6558E8", background: "#EEECFF" },
  { color: "#287AC9", background: "#E5F2FF" },
  { color: "#C34F90", background: "#FFEDF6" },
  { color: "#C47B20", background: "#FFF2DF" },
  { color: "#15966A", background: "#E4F8EE" },
];

function toneFor(name: string) {
  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return TONES[hash % TONES.length];
}

interface AvatarProps {
  name: string;
  size?: number;
  solid?: boolean;
}

export function Avatar({ name, size = 40, solid = false }: AvatarProps) {
  const tone = solid ? { color: "#FFFFFF", background: colors.primary } : toneFor(name);

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size * 0.3, backgroundColor: tone.background },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.text, { color: tone.color, fontSize: size * 0.32 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", justifyContent: "center" },
  text: { fontWeight: "700" },
});
