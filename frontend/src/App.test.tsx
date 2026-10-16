import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

function jsonResponse(body: unknown, init?: { ok?: boolean; status?: number }) {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: async () => body,
  } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("backend connection status", () => {
  it("displays a loading state while the health request is pending", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => undefined)),
    );

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent(/checking backend connection/i);
    expect(screen.getByRole("button", { name: /retry health check/i })).toBeDisabled();
  });

  it("displays the connected state after a successful health request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ status: "ok", service: "QuantumShield India" }),
      ),
    );

    render(<App />);

    expect(await screen.findByText(/backend connected/i)).toBeInTheDocument();
    expect(screen.getByText(/reports status ok/i)).toBeInTheDocument();
  });

  it("displays the disconnected state when the health response is invalid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ status: "error", service: "other" })),
    );

    render(<App />);

    expect(await screen.findByText(/backend disconnected/i)).toBeInTheDocument();
    expect(
      screen.getByText(/did not match the expected health check format/i),
    ).toBeInTheDocument();
  });

  it("requests the health check again when Retry is pressed", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(jsonResponse({ status: "ok", service: "QuantumShield India" }));
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByText(/backend disconnected/i)).toBeInTheDocument();
    expect(screen.getByText(/could not be reached/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry health check/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText(/backend connected/i)).toBeInTheDocument();
  });
});
