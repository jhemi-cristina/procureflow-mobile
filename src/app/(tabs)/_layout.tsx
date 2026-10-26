import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/hooks/use-auth";
import { useApprovalQueue } from "@/hooks/use-purchase-requests";
import { canDecide } from "@/lib/purchase-requests";
import { colors } from "@/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IconName, focusedName: IconName) {
  function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? focusedName : name} size={size} color={color as string} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const { user } = useAuth();
  const isApprover = canDecide(user?.role);
  const { data: queue = [] } = useApprovalQueue();

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
        name="approvals"
        options={{
          title: "Aprovações",
          tabBarIcon: tabIcon("checkmark-done-circle-outline", "checkmark-done-circle"),
          tabBarBadge: queue.length > 0 ? queue.length : undefined,
          href: isApprover ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarIcon: tabIcon("person-circle-outline", "person-circle") }}
      />
    </Tabs>
  );
}
