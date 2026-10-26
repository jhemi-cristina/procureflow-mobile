/** Design tokens compartilhados por todo o app (mesma identidade visual do ProcureFlow Web). */
export const colors = {
  background: "#F7F8FA",
  surface: "#FFFFFF",
  surfaceMuted: "#FAFBFC",
  foreground: "#172033",
  foregroundSoft: "#465168",
  muted: "#788397",
  mutedLight: "#9AA3B3",
  border: "#E8EBF1",
  borderSoft: "#F0F2F6",

  primary: "#5549E8",
  primaryPressed: "#4438D8",
  primarySoft: "#F0EFFF",
  primaryBorder: "#E2E0FF",
  primaryText: "#5147DC",

  success: "#15966A",
  successSoft: "#E8F8F0",
  warning: "#B77917",
  warningSoft: "#FFF6E5",
  danger: "#CF4B5A",
  dangerSoft: "#FFF0F1",
  info: "#3285DC",
  infoSoft: "#E7F3FF",
  neutral: "#4778CB",
  neutralSoft: "#EDF4FF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.8, color: colors.foreground },
  heading: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3, color: colors.foreground },
  body: { fontSize: 14, color: colors.foreground },
  caption: { fontSize: 12, color: colors.muted },
  label: { fontSize: 13, fontWeight: "600", color: "#37374F" },
} as const;

export const shadow = {
  card: {
    shadowColor: "#172033",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
} as const;
