import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const healthyPayload = { status: "ok", service: "QuantumShield India" };

describe("App", () => {
  it("explains the learning platform and starts in a loading state", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));

    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Learn cybersecurity and emerging technology together.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/public place to study cybersecurity/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/checking whether the learning service/i);
    expect(screen.getByRole("button", { name: "Check again" })).toBeDisabled();
  });

  it("shows the health payload returned by the service", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(healthyPayload)));

    render(<App />);

    expect(await screen.findByRole("definition", { name: "Status" })).toHaveTextContent("ok");
    expect(screen.getByRole("definition", { name: "Service" })).toHaveTextContent(
      "QuantumShield India",
    );
    expect(screen.getByRole("status")).toHaveTextContent(/connected/i);
  });

  it("shows an alert when the payload is malformed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("not-json", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        }),
      ),
    );

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid JSON/i);
  });

  it("shows an alert when the reported status is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ status: "starting", service: "QuantumShield India" }),
      ),
    );

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/starting/i);
  });

  it("retries a failed check and then shows the live payload", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(jsonResponse(healthyPayload));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not be reached/i);
    await user.click(screen.getByRole("button", { name: "Check again" }));

    expect(await screen.findByRole("definition", { name: "Status" })).toHaveTextContent("ok");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
