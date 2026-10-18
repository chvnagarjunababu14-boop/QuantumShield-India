const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";

export function resolveApiBaseUrl(configured: string | undefined): string {
  if (typeof configured !== "string") {
    return LOCAL_API_BASE_URL;
  }

  const trimmed = configured.trim().replace(/\/+$/, "");
  return trimmed === "" ? LOCAL_API_BASE_URL : trimmed;
}

export function getApiBaseUrl(): string {
  return resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
}
