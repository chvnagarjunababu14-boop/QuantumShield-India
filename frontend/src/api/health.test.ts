import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveApiBaseUrl } from "../config";
import { fetchHealth, HealthCheckError } from "./health";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("resolveApiBaseUrl", () => {
  it("falls back to the local API when the value is missing or blank", () => {
    expect(resolveApiBaseUrl(undefined)).toBe("http://127.0.0.1:8000");
    expect(resolveApiBaseUrl("   ")).toBe("http://127.0.0.1:8000");
  });

  it("removes a trailing slash from a configured URL", () => {
    expect(resolveApiBaseUrl("http://localhost:8000/")).toBe("http://localhost:8000");
  });
});

describe("fetchHealth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the health payload from a successful response", async () => {
    const payload = { status: "ok", service: "QuantumShield India" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(payload)));

    await expect(fetchHealth("http://127.0.0.1:8000")).resolves.toEqual(payload);
  });

  it("rejects a response that is missing required fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ status: "ok" })),
    );

    await expect(fetchHealth("http://127.0.0.1:8000")).rejects.toBeInstanceOf(
      HealthCheckError,
    );
  });

  it("rejects numeric fields and non-object payloads", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: 1, service: "QuantumShield India" }))
      .mockResolvedValueOnce(jsonResponse(["ok"]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchHealth("http://127.0.0.1:8000")).rejects.toThrow(
      /unexpected response/i,
    );
    await expect(fetchHealth("http://127.0.0.1:8000")).rejects.toThrow(
      /unexpected response/i,
    );
  });

  it("rejects invalid JSON and unsuccessful HTTP statuses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("not-json", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ status: "ok", service: "x" }, 503));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchHealth("http://127.0.0.1:8000")).rejects.toThrow(/invalid JSON/i);
    await expect(fetchHealth("http://127.0.0.1:8000")).rejects.toThrow(/status 503/i);
  });

  it("maps network failures and rejects an invalid API address", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(fetchHealth("http://127.0.0.1:8000")).rejects.toThrow(
      /could not be reached/i,
    );
    await expect(fetchHealth("not a url")).rejects.toThrow(/not a valid URL/i);
  });

  it("requests the health route with no cached response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ status: "ok", service: "QuantumShield India" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchHealth("http://127.0.0.1:8000/");

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://127.0.0.1:8000/api/health"),
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
  });
});
