import { LoaderCircle, RefreshCw, ShieldCheck, ShieldOff } from "lucide-react";
import { healthEndpoint } from "../services/health";
import type { HealthSnapshot } from "../types/health";

interface ConnectionStatusProps {
  snapshot: HealthSnapshot;
  onRetry: () => void;
  isChecking: boolean;
}

export function ConnectionStatus({ snapshot, onRetry, isChecking }: ConnectionStatusProps) {
  return (
    <section
      id="system-status"
      aria-labelledby="status-heading"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
    >
      <div className="rounded-2xl border border-line bg-navy-900/80 p-6 sm:p-8">
        <h2 id="status-heading" className="font-display text-2xl font-semibold tracking-tight text-white">
          Backend connection
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          This dashboard asks the local QuantumShield API whether it is running. The status below
          comes from that response. It is not assumed to be online.
        </p>
        <p className="mt-2 text-sm text-muted">
          Endpoint: <span className="font-semibold text-mist">{healthEndpoint()}</span>
        </p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="status" aria-live="polite" aria-busy={isChecking} className="flex items-start gap-3">
            <StatusIcon snapshot={snapshot} />
            <div>
              <StatusCopy snapshot={snapshot} />
            </div>
          </div>

          <button
            type="button"
            onClick={onRetry}
            disabled={isChecking}
            aria-busy={isChecking}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-navy-950 px-4 text-sm font-semibold text-mist hover:border-cyan-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            Retry health check
          </button>
        </div>
      </div>
    </section>
  );
}

function StatusIcon({ snapshot }: { snapshot: HealthSnapshot }) {
  if (snapshot.status === "connected") {
    return <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-300" aria-hidden="true" />;
  }
  if (snapshot.status === "disconnected") {
    return <ShieldOff className="mt-0.5 h-6 w-6 shrink-0 text-rose-300" aria-hidden="true" />;
  }
  return <LoaderCircle className="mt-0.5 h-6 w-6 shrink-0 animate-spin text-blue-accent" aria-hidden="true" />;
}

function StatusCopy({ snapshot }: { snapshot: HealthSnapshot }) {
  if (snapshot.status === "loading") {
    return (
      <>
        <p className="font-semibold text-white">Checking backend connection</p>
        <p className="mt-1 text-sm text-muted">Waiting for the health check to finish.</p>
      </>
    );
  }

  if (snapshot.status === "connected") {
    return (
      <>
        <p className="font-semibold text-white">Backend connected</p>
        <p className="mt-1 text-sm text-muted">
          {snapshot.health.service} reports status {snapshot.health.status}.
        </p>
      </>
    );
  }

  return (
    <>
      <p className="font-semibold text-white">Backend disconnected</p>
      <p className="mt-1 text-sm text-rose-200">{snapshot.message}</p>
    </>
  );
}
