import { useCallback, useEffect, useRef, useState } from "react";
import { fetchHealth, HealthCheckError } from "../api/health";
import { getApiBaseUrl } from "../config";
import type { HealthResponse, HealthSnapshot } from "../types/health";

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function snapshotFromHealth(health: HealthResponse): HealthSnapshot {
  if (health.status !== "ok") {
    return {
      phase: "unavailable",
      message: `The learning service reported status "${health.status}" for ${health.service}.`,
    };
  }
  return { phase: "connected", health };
}

export function useHealthStatus(): {
  snapshot: HealthSnapshot;
  retry: () => void;
} {
  const [snapshot, setSnapshot] = useState<HealthSnapshot>({ phase: "loading" });
  const [attempt, setAttempt] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const retry = useCallback(() => {
    abortRef.current?.abort();
    setSnapshot({ phase: "loading" });
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    fetchHealth(getApiBaseUrl(), controller.signal)
      .then((health) => {
        if (controller.signal.aborted) {
          return;
        }
        setSnapshot(snapshotFromHealth(health));
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) {
          return;
        }
        const message =
          error instanceof HealthCheckError
            ? error.message
            : "The learning service could not be reached.";
        setSnapshot({ phase: "unavailable", message });
      });

    return () => {
      controller.abort();
    };
  }, [attempt]);

  return { snapshot, retry };
}
