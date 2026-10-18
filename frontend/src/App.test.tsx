import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("./api/insforge", () => ({
  isInsForgeConfigured: vi.fn(() => true),
  getInsForgeClient: vi.fn(() => ({
    auth: {
      getCurrentUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => () => {}),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    database: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
  })),
}));

import App from "./App";

function renderApp() {
  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("renders the homepage introducing the platform without the service connection card", () => {
    renderApp();

    expect(
      screen.getByRole("heading", {
        name: "Prepare for a world beyond today’s encryption.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /understand quantum computing, cybersecurity and post-quantum cryptography/i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /service connection/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Check again" })).not.toBeInTheDocument();
    expect(screen.queryByText("Connected")).not.toBeInTheDocument();
  });

  it("routes /dashboard cleanly to the learner dashboard", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: /Sign in to access your learning dashboard/i }),
    ).toBeInTheDocument();
  });

  it("routes /simulator to the dedicated Quantum Cryptography Simulator page", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    render(
      <MemoryRouter initialEntries={["/simulator"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Quantum Cryptography Simulator",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Laboratory Experiment Controls",
      }),
    ).toBeInTheDocument();
  });

  it("routes /awareness to explore page", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    render(
      <MemoryRouter initialEntries={["/awareness"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "Explore lessons" }),
    ).toBeInTheDocument();
  });
});

