import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "../App";

// Mock backend API health check for testing environment
vi.mock("../api/insforge", () => ({
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

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Separated Home Page and Simulator Routes", () => {
  it("visiting / renders the product landing page and its learning/simulator CTAs", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    renderAt("/");

    // 1. Marketing headline
    expect(
      screen.getByRole("heading", {
        name: "Prepare for a world beyond today’s encryption.",
        level: 1,
      }),
    ).toBeInTheDocument();

    // 2. Primary CTA: Explore Learning
    const primaryCta = screen.getByRole("link", { name: /Explore Learning/i });
    expect(primaryCta).toHaveAttribute("href", "/explore");

    // 3. Secondary CTA: Try the Quantum Simulator (links directly to /simulator)
    const secondaryCta = screen.getByRole("link", { name: /Try the Quantum Simulator/i });
    expect(secondaryCta).toHaveAttribute("href", "/simulator");

    // 4. Learning Journey steps
    expect(screen.getByText(/Step 01/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 02/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 03/i)).toBeInTheDocument();
  });

  it("visiting /simulator renders the dedicated simulator page with distinct heading and experiment controls", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    renderAt("/simulator");

    // 1. Dedicated Simulator Heading
    expect(
      screen.getByRole("heading", {
        name: "Quantum Cryptography Simulator",
        level: 1,
      }),
    ).toBeInTheDocument();

    // 2. Clear Educational Framing & Scope Notice
    expect(
      screen.getByRole("heading", { name: /Educational Framing & Scope Notice/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not perform live attacks against live systems/i),
    ).toBeInTheDocument();

    // 3. Interactive Experiment Controls section
    expect(
      screen.getByRole("heading", { name: "Laboratory Experiment Controls", level: 2 }),
    ).toBeInTheDocument();

    // 4. Scenario Selection Tabs
    expect(
      screen.getByRole("tab", { name: /Key Exchange \(ML-KEM\)/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Signatures \(ML-DSA\)/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Symmetric \(AES-256\)/i }),
    ).toBeInTheDocument();

    // 5. Parameter controls: Adversary Mode & Retention Slider
    expect(screen.getByRole("button", { name: /Classical Attacker/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Quantum Adversary \(Shor \/ Grover\)/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Data Confidentiality Horizon/i)).toBeInTheDocument();

    // 6. Must NOT render the Home page hero headline
    expect(
      screen.queryByRole("heading", {
        name: "Prepare for a world beyond today’s encryption.",
      }),
    ).not.toBeInTheDocument();
  });

  it("confirms the two routes have distinctly different primary page content and purpose", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));

    // Home route
    const { unmount: unmountHome } = renderAt("/");
    expect(
      screen.getByRole("heading", { name: "Prepare for a world beyond today’s encryption." }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Quantum Cryptography Simulator" }),
    ).not.toBeInTheDocument();
    unmountHome();

    // Simulator route
    const { unmount: unmountSimulator } = renderAt("/simulator");
    expect(
      screen.getByRole("heading", { name: "Quantum Cryptography Simulator" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Prepare for a world beyond today’s encryption." }),
    ).not.toBeInTheDocument();
    unmountSimulator();
  });

  it("the Home page's simulator preview card links to /simulator", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    renderAt("/");

    const previewSection = document.getElementById("simulator-preview");
    expect(previewSection).toBeInTheDocument();
    if (!previewSection) return;

    // The preview section must have a working action button to /simulator
    const launchBtn = within(previewSection).getByRole("link", {
      name: /Launch Interactive Simulator/i,
    });
    expect(launchBtn).toHaveAttribute("href", "/simulator");

    const textLink = within(previewSection).getByRole("link", {
      name: /Open simulator workspace/i,
    });
    expect(textLink).toHaveAttribute("href", "/simulator");
  });

  it("simulator interactions dynamically update the educational results, state, and explanations", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    renderAt("/simulator");

    // 1. Initial State: Key Exchange (ML-KEM)
    expect(
      screen.getByRole("heading", { name: "RSA-2048 / ECDH P-256" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "ML-KEM (Module-Lattice Key Encapsulation)" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Quantum Vulnerable")).toBeInTheDocument();
    expect(screen.getByText("Quantum Resilient")).toBeInTheDocument();

    // 2. Switch to Signatures (ML-DSA) Scenario
    await user.click(screen.getByRole("tab", { name: /Signatures \(ML-DSA\)/i }));
    expect(
      screen.getByRole("heading", { name: "RSA-3072 / ECDSA P-256" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "ML-DSA & SLH-DSA" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/NIST FIPS 204 \(Dilithium\)/i).length,
    ).toBeGreaterThanOrEqual(1);

    // 3. Switch to Symmetric (AES-256) Scenario
    await user.click(screen.getByRole("tab", { name: /Symmetric \(AES-256\)/i }));
    expect(
      screen.getByRole("heading", { name: "AES-128" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "AES-256" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Reduced Security")).toBeInTheDocument();
    expect(screen.getByText(/Grover's algorithm provides a quadratic speedup/i)).toBeInTheDocument();

    // 4. Toggle Adversary Model from Quantum to Classical
    await user.click(screen.getByRole("button", { name: /Classical Attacker/i }));
    expect(screen.getByText("Classical Secure")).toBeInTheDocument();
    expect(
      screen.getByText(/Practically unbreakable by classical brute force/i),
    ).toBeInTheDocument();

    // 5. Change Retention Slider
    const slider = screen.getByLabelText(/Data Confidentiality Horizon/i);
    fireEvent.change(slider, { target: { value: 40 } });
    expect(screen.getByText(/40 Years \(Expires in 2066\)/i)).toBeInTheDocument();
  });

  it("header navigation selects the correct route", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    renderAt("/");

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const simulatorLink = within(nav).getByRole("link", { name: "Simulator" });

    await user.click(simulatorLink);

    expect(
      screen.getByRole("heading", {
        name: "Quantum Cryptography Simulator",
        level: 1,
      }),
    ).toBeInTheDocument();
  });
});
