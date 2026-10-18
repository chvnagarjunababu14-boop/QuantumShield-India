import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConnectionStatus } from "./ConnectionStatus";
import type { HealthSnapshot } from "../types/health";

describe("ConnectionStatus component", () => {
  it("renders in loading phase with disabled retry button", () => {
    const snapshot: HealthSnapshot = { phase: "loading" };
    render(<ConnectionStatus snapshot={snapshot} onRetry={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Service connection" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/checking whether the learning service/i);
    expect(screen.getByRole("button", { name: /check again/i })).toBeDisabled();
    expect(screen.getByText("Checking")).toBeInTheDocument();
  });

  it("renders in connected phase with health status and service name", () => {
    const snapshot: HealthSnapshot = {
      phase: "connected",
      health: { status: "ok", service: "QuantumShield India" },
    };
    render(<ConnectionStatus snapshot={snapshot} onRetry={vi.fn()} />);

    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/connected\. status is ok/i);
    expect(screen.getByRole("definition", { name: "Status" })).toHaveTextContent("ok");
    expect(screen.getByRole("definition", { name: "Service" })).toHaveTextContent("QuantumShield India");
    expect(screen.getByRole("button", { name: /check again/i })).toBeEnabled();
  });

  it("renders in unavailable phase with alert role and error message", () => {
    const snapshot: HealthSnapshot = {
      phase: "unavailable",
      message: "The learning service could not be reached.",
    };
    render(<ConnectionStatus snapshot={snapshot} onRetry={vi.fn()} />);

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("The learning service could not be reached.");
    expect(screen.getByRole("button", { name: /check again/i })).toBeEnabled();
  });

  it("calls onRetry callback when clicking Check again button", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    const snapshot: HealthSnapshot = {
      phase: "unavailable",
      message: "Connection failed.",
    };
    render(<ConnectionStatus snapshot={snapshot} onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: /check again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
