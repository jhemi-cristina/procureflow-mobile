import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { focusManager } from "@tanstack/react-query";

/**
 * No React Native não existe o evento de foco da janela do navegador.
 * Este hook avisa o React Query quando o app volta para o primeiro plano,
 * para que dados desatualizados sejam buscados novamente.
 */
export function useAppStateFocus() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });
    return () => subscription.remove();
  }, []);
}
