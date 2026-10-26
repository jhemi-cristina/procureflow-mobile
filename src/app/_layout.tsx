import { useEffect } from "react";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/hooks/use-auth";
import { AppProviders } from "@/providers/app-providers";
import { colors } from "@/theme";

// Mantém a splash visível até a sessão salva no dispositivo ser lida.
SplashScreen.preventAutoHideAsync();

function SplashScreenController() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hide();
  }, [isLoading]);

  return null;
}

function RootNavigator() {
  const { user } = useAuth();
  const isSignedIn = Boolean(user);

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.foreground, fontWeight: "700" },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      {/* Telas autenticadas: inacessíveis sem sessão. */}
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="request/[id]" options={{ title: "Solicitação" }} />
        <Stack.Screen
          name="request/form"
          options={{ presentation: "modal", title: "Solicitação de compra" }}
        />
      </Stack.Protected>

      {/* Login: só aparece para quem não está autenticado. */}
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <SplashScreenController />
      <RootNavigator />
    </AppProviders>
  );
}
