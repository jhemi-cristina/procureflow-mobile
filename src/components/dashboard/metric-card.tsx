import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, radius, shadow } from "@/theme";

const TONES = {
  violet: { color: "#6457E8", background: "#EEECFF" },
  amber: { color: "#D58B18", background: "#FFF5DF" },
  green: { color: colors.success, background: "#E4F8EE" },
  blue: { color: colors.info, background: colors.infoSoft },
};

interface MetricCardProps {
  title: string;
  value: string;
  footnote: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  tone: keyof typeof TONES;
}

export function MetricCard({ title, value, footnote, icon, tone }: MetricCardProps) {
  const palette = TONES[tone];

  return (
    <View style={styles.card} accessible accessibilityLabel={`${title}: ${value}. ${footnote}`}>
      <View style={[styles.icon, { backgroundColor: palette.background }]}>
        <Ionicons name={icon} size={18} color={palette.color} />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.footnote} numberOfLines={2}>
        {footnote}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  title: { marginTop: 12, fontSize: 12, fontWeight: "500", color: "#7D889B" },
  value: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: colors.foreground,
  },
  footnote: { marginTop: 6, fontSize: 11, color: "#929BAD" },
});
