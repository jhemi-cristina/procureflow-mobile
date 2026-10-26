const API_URL = process.env.EXPO_PUBLIC_API_URL;

const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
};

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

async function extractErrorMessage(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = body?.message;

  if (Array.isArray(message)) return message.join(", ");
  return message ?? `Erro na API: ${response.status}`;
}

export async function apiRequest<T>(
  path: string,
  { token, body, headers, ...init }: ApiRequestOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new ApiError("Configure EXPO_PUBLIC_API_URL no arquivo .env.local.", 0);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    throw new ApiError(
      timedOut
        ? `A API não respondeu a tempo (${API_URL}). Verifique se o servidor está acessível.`
        : `Não foi possível conectar à API em ${API_URL}. Verifique se o servidor está rodando e se o dispositivo está na mesma rede.`,
      0,
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (response.status === 401 && token) unauthorizedHandler?.();
    throw new ApiError(await extractErrorMessage(response), response.status);
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export function getErrorMessage(error: unknown, fallback = "Algo deu errado. Tente novamente.") {
  return error instanceof Error ? error.message : fallback;
}

export const apiBaseUrl = API_URL ?? "não configurada";
