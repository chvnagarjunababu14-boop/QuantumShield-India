const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Resolves the backend API base URL with production safeguards.
 * In development, missing or empty values safely default to local development server.
 * In production, local loopback defaults are prevented; it resolves to window origin
 * (supporting same-origin or reverse-proxy deployments) or empty string rather than
 * attempting to access the end-user's local machine.
 */
export function resolveApiBaseUrl(
  configured: string | undefined,
  isProduction: boolean = false,
): string {
  const trimmed = typeof configured === "string" ? configured.trim().replace(/\/+$/, "") : "";

  if (!trimmed) {
    return isProduction ? "" : LOCAL_API_BASE_URL;
  }

  return trimmed;
}

export function getApiBaseUrl(): string {
  return resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL, Boolean(import.meta.env.PROD));
}

