import type { HealthResponse } from "../types/health";

export class HealthCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HealthCheckError";
  }
}

function healthEndpoint(baseUrl: string): URL {
  try {
    const trimmed = baseUrl.trim();
    if (!trimmed) {
      if (typeof window !== "undefined" && window.location?.origin) {
        const origin = window.location.origin.endsWith("/")
          ? window.location.origin
          : `${window.location.origin}/`;
        return new URL("api/health", origin);
      }
      throw new HealthCheckError("The API address is not a valid URL.");
    }

    const normalized = trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
    return new URL("api/health", normalized);
  } catch (error: unknown) {
    if (error instanceof HealthCheckError) {
      throw error;
    }
    throw new HealthCheckError("The API address is not a valid URL.");
  }
}

function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("status" in value) || !("service" in value)) {
    return false;
  }

  const { status, service } = value;
  return (
    typeof status === "string" &&
    status.length > 0 &&
    typeof service === "string" &&
    service.length > 0
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function fetchHealth(
  baseUrl: string,
  signal?: AbortSignal,
): Promise<HealthResponse> {
  if (signal?.aborted) {
    throw new DOMException("The operation was aborted.", "AbortError");
  }

  const endpoint = healthEndpoint(baseUrl);
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error: unknown) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new HealthCheckError("The learning service could not be reached.");
  }

  if (!response.ok) {
    throw new HealthCheckError(
      `The learning service responded with status ${response.status}.`,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new HealthCheckError("The learning service returned invalid JSON.");
  }

  if (!isHealthResponse(payload)) {
    throw new HealthCheckError(
      "The learning service returned an unexpected response.",
    );
  }

  return payload;
}
