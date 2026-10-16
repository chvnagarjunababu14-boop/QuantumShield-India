import { useCallback, useEffect, useRef, useState } from "react";
import { fetchHealth, HealthCheckError } from "../services/health";
import type { HealthSnapshot } from "../types/health";

const UNREACHABLE_MESSAGE =
  "The backend could not be reached. Confirm the API is running, then retry.";

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function useBackendHealth() {
  const [snapshot, setSnapshot] = useState<HealthSnapshot>({ status: "loading" });
  const abortRef = useRef<AbortController | null>(null);

  const runCheck = useCallback(async (signal: AbortSignal) => {
    setSnapshot({ status: "loading" });

    try {
      const health = await fetchHealth(signal);
      if (signal.aborted) {
        return;
      }
      setSnapshot({ status: "connected", health });
    } catch (error) {
      if (signal.aborted || isAbortError(error)) {
        return;
      }

      const message = error instanceof HealthCheckError ? error.message : UNREACHABLE_MESSAGE;
      setSnapshot({ status: "disconnected", message });
    }
  }, []);

  const retry = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    void runCheck(controller.signal);
  }, [runCheck]);

  useEffect(() => {
    retry();
    return () => abortRef.current?.abort();
  }, [retry]);

  return {
    snapshot,
    retry,
    isChecking: snapshot.status === "loading",
  };
}
