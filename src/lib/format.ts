const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatCurrency(value: string | number) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  return currencyFormatter.format(amount);
}

/** Formato curto ("R$ 84,2 mil") implementado à mão: `notation: "compact"` não é garantido no Hermes. */
export function formatCompactCurrency(value: number) {
  const units = [
    { limit: 1e9, suffix: "bi" },
    { limit: 1e6, suffix: "mi" },
    { limit: 1e3, suffix: "mil" },
  ];
  const unit = units.find(({ limit }) => Math.abs(value) >= limit);
  if (!unit) return formatCurrency(value);

  const scaled = (value / unit.limit).toFixed(1).replace(".", ",").replace(",0", "");
  return `R$ ${scaled} ${unit.suffix}`;
}

export function formatDate(value: string | Date) {
  return dateFormatter.format(new Date(value)).replace(/\./g, "");
}

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(new Date(value)).replace(/\./g, "");
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** Converte "1.250,50" ou "1250.50" para o formato aceito pela API ("1250.50"). */
export function toApiAmount(value: string) {
  const normalized = value.trim().replace(/\s|R\$/g, "");
  const decimal = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized;
  return Number(decimal).toFixed(2);
}

/** Converte "1250.50" (API) para "1250,50" (input do formulário). */
export function fromApiAmount(value: string) {
  return Number(value).toFixed(2).replace(".", ",");
}

export function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
