import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IconName, focusedName: IconName) {
  function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? focusedName : name} size={size} color={color as string} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedLight,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.surface },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Início", tabBarIcon: tabIcon("grid-outline", "grid") }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Solicitações",
          tabBarIcon: tabIcon("document-text-outline", "document-text"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarIcon: tabIcon("person-circle-outline", "person-circle") }}
      />
    </Tabs>
  );
}
