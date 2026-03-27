import { createTavernClient } from "@tavern/sdk";

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function resolveDefaultApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return "/api";
  }

  if (typeof window !== "undefined" && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }

  return "http://localhost:3000";
}

function normalizeApiBaseUrl(rawBaseUrl: string): string {
  if (typeof window === "undefined") {
    return rawBaseUrl.replace(/\/$/, "");
  }

  try {
    const parsed = new URL(rawBaseUrl, window.location.origin);
    if (isLoopbackHost(parsed.hostname) && isLoopbackHost(window.location.hostname)) {
      parsed.hostname = window.location.hostname;
    }
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return rawBaseUrl.replace(/\/$/, "");
  }
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const apiBaseUrl = normalizeApiBaseUrl(configuredApiBaseUrl ?? resolveDefaultApiBaseUrl());

export const apiClient = createTavernClient({
  baseUrl: apiBaseUrl,
});
