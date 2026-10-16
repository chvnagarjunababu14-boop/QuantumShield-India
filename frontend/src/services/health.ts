import type { HealthResponse } from "../types/health";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
const EXPECTED_SERVICE = "QuantumShield India";

export class HealthCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HealthCheckError";
  }
}

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return (configured || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export function healthEndpoint(): string {
  return `${getApiBaseUrl()}/api/health`;
}

function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return record.status === "ok" && record.service === EXPECTED_SERVICE;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  let response: Response;

  try {
    response = await fetch(healthEndpoint(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new HealthCheckError(
      "The backend could not be reached. Confirm the API is running, then retry.",
    );
  }

  if (!response.ok) {
    throw new HealthCheckError(
      `The backend health check failed (HTTP ${response.status}).`,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new HealthCheckError("The backend returned a response that could not be read.");
  }

  if (!isHealthResponse(payload)) {
    throw new HealthCheckError(
      "The backend response did not match the expected health check format.",
    );
  }

  return payload;
}
