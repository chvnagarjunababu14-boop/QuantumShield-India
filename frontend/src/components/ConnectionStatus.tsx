import { ArrowsClockwise, Check, XCircle } from "@phosphor-icons/react";
import type { HealthSnapshot } from "../types/health";

type ConnectionStatusProps = {
  snapshot: HealthSnapshot;
  onRetry: () => void;
};

const phaseLabel = {
  loading: "Checking",
  connected: "Connected",
  unavailable: "Unavailable",
} as const;

export function ConnectionStatus({ snapshot, onRetry }: ConnectionStatusProps) {
  const isUnavailable = snapshot.phase === "unavailable";
  const message =
    snapshot.phase === "loading"
      ? "Checking whether the learning service is available."
      : snapshot.phase === "connected"
        ? `Connected. Status is ${snapshot.health.status}. Service is ${snapshot.health.service}.`
        : snapshot.message;

  return (
    <section
      aria-labelledby="connection-heading"
      aria-busy={snapshot.phase === "loading"}
      className="glass-panel rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="connection-heading" className="font-heading text-xl font-semibold">
          Service connection
        </h2>
        <p
          className={
            snapshot.phase === "connected"
              ? "inline-flex items-center gap-2 text-sm font-semibold text-ok"
              : snapshot.phase === "unavailable"
                ? "inline-flex items-center gap-2 text-sm font-semibold text-danger"
                : "inline-flex items-center gap-2 text-sm font-semibold text-muted"
          }
        >
          {snapshot.phase === "connected" ? (
            <Check size={20} weight="regular" aria-hidden="true" />
          ) : null}
          {snapshot.phase === "unavailable" ? (
            <XCircle size={20} weight="regular" aria-hidden="true" />
          ) : null}
          {phaseLabel[snapshot.phase]}
        </p>
      </div>

      <div
        className="mt-4"
        role={isUnavailable ? "alert" : "status"}
        aria-live={isUnavailable ? "assertive" : "polite"}
        aria-atomic="true"
      >
        <p className="text-base leading-relaxed">{message}</p>
        {snapshot.phase === "connected" ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt id="health-status-label" className="text-sm font-semibold text-muted">
                Status
              </dt>
              <dd aria-labelledby="health-status-label" className="text-lg font-semibold">
                {snapshot.health.status}
              </dd>
            </div>
            <div>
              <dt id="health-service-label" className="text-sm font-semibold text-muted">
                Service
              </dt>
              <dd aria-labelledby="health-service-label" className="text-lg font-semibold">
                {snapshot.health.service}
              </dd>
            </div>
          </dl>
        ) : null}
      </div>

      <button
        type="button"
        className="action-button mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-action px-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-action-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-disabled disabled:text-muted motion-reduce:transition-none"
        onClick={onRetry}
        disabled={snapshot.phase === "loading"}
      >
        <ArrowsClockwise size={20} weight="regular" aria-hidden="true" />
        Check again
      </button>
    </section>
  );
}
