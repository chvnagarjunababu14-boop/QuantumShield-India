import { createClient, type InsForgeClient } from "@insforge/sdk";

let cachedClient: InsForgeClient | null = null;

export function getInsForgeConfig(): { baseUrl: string; anonKey: string } | null {
  const baseUrl = (
    import.meta.env.VITE_INSFORGE_BASE_URL ||
    import.meta.env.VITE_INSFORGE_URL ||
    ""
  ).trim().replace(/\/+$/, "");

  const anonKey = (import.meta.env.VITE_INSFORGE_ANON_KEY || "").trim();

  if (!baseUrl || !anonKey) {
    return null;
  }

  return { baseUrl, anonKey };
}

export function isInsForgeConfigured(): boolean {
  return getInsForgeConfig() !== null;
}

export function getInsForgeClient(): InsForgeClient | null {
  const config = getInsForgeConfig();
  if (!config) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient({
      baseUrl: config.baseUrl,
      anonKey: config.anonKey,
    });
  }

  return cachedClient;
}

/**
 * Resets cached client instance (primarily for tests).
 */
export function resetInsForgeClient(): void {
  cachedClient = null;
}
