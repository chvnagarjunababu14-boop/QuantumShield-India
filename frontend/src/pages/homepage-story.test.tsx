import { render, screen, within } from "@testing-library/react";
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

describe("QuantumShield India — Homepage Story & Roadmaps", () => {
  it("renders 'Why learn quantum technology now?' with urgency, HNDL risk, and scientific guardrails", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    renderAt("/");

    // Section heading
    const whyNowHeading = screen.getByRole("heading", {
      name: "Why learn quantum technology now?",
      level: 2,
    });
    expect(whyNowHeading).toBeInTheDocument();

    // Context on emerging technology & public-key threat
    expect(
      screen.getByText(/transform scientific research, optimization, materials discovery/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/threaten widely used public-key cryptography, including RSA and elliptic-curve cryptography/i),
    ).toBeInTheDocument();

    // Long migration lead times
    expect(
      screen.getByRole("heading", { name: "Long Migration Lead Times", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/organizations need substantial time to discover where cryptography is used/i),
    ).toBeInTheDocument();

    // "Harvest Now, Decrypt Later" (HNDL)
    expect(
      screen.getByRole("heading", { name: /“Harvest Now, Decrypt Later”/i, level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/adversaries may intercept and retain encrypted information today in the hope of decrypting it/i),
    ).toBeInTheDocument();

    // Scientific accuracy note (guardrail: does not break modern RSA/ECC today, no definitive date)
    expect(screen.getByText(/A Note on Scientific Precision/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Today’s quantum computers operate in the noisy intermediate-scale regime and cannot break modern RSA or ECC at practical scale/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/reputable scientists do not predict a definitive date when that capability will arrive/i),
    ).toBeInTheDocument();
  });

  it("renders the 4-stage visual sequence from quantum advances to quantum-safe migration", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    renderAt("/");

    const sequenceList = screen.getByRole("list", {
      name: "Quantum security transition sequence",
    });
    expect(sequenceList).toBeInTheDocument();

    // 01. Quantum advances
    expect(within(sequenceList).getByRole("heading", { name: "Quantum advances", level: 4 })).toBeInTheDocument();
    // 02. Cryptographic risk
    expect(within(sequenceList).getByRole("heading", { name: "Cryptographic risk", level: 4 })).toBeInTheDocument();
    // 03. Preparation
    expect(within(sequenceList).getByRole("heading", { name: "Preparation", level: 4 })).toBeInTheDocument();
    // 04. Quantum-safe migration
    expect(within(sequenceList).getByRole("heading", { name: "Quantum-safe migration", level: 4 })).toBeInTheDocument();
  });

  it("renders 'Why are we learning this?' with 3 audience pathways and 4 real platform features", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    renderAt("/");

    // Section heading
    expect(
      screen.getByRole("heading", {
        name: "Why are we learning this?",
        level: 2,
      }),
    ).toBeInTheDocument();

    // Three audience pathways
    expect(
      screen.getByRole("heading", { name: "Students and learners", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Developers and security practitioners", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Organizations and technology teams", level: 3 }),
    ).toBeInTheDocument();

    // Direct connections to four real platform features
    expect(
      screen.getByRole("heading", { name: "Six foundational lessons", level: 4 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Interactive lesson experiments", level: 4 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "The quantum cryptography simulator", level: 4 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Knowledge checks & learning progress", level: 4 }),
    ).toBeInTheDocument();
  });

  it("renders India's journey toward quantum-safe security with DST milestones and CII vs Enterprise distinctions", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    renderAt("/");

    // Section Heading
    expect(
      screen.getByRole("heading", {
        name: "India’s journey toward quantum-safe security",
        level: 2,
      }),
    ).toBeInTheDocument();

    // Explicit clarification quote
    expect(
      screen.getByText(
        /“2033 is the roadmap milestone for regular enterprises\. Critical information infrastructure follows an earlier timeline, with full migration targeted by the end of 2029\.”/i,
      ),
    ).toBeInTheDocument();

    // Timeline stages
    const timelineList = screen.getByRole("list", {
      name: "India quantum-safe migration timeline",
    });
    expect(timelineList).toBeInTheDocument();

    // Stage 1 (2027–2028): Build the foundations
    const stage1Heading = within(timelineList).getByRole("heading", { name: "Build the foundations", level: 4 });
    const stage1 = stage1Heading.closest("li");
    expect(stage1).toBeInTheDocument();
    expect(within(stage1!).getByText("2027–2028")).toBeInTheDocument();
    expect(within(stage1!).getByText(/By end of 2027/i)).toBeInTheDocument();
    expect(within(stage1!).getByText(/By end of 2028/i)).toBeInTheDocument();

    // Stage 2 (2028–2030): Migrate high-priority systems
    const stage2Heading = within(timelineList).getByRole("heading", { name: "Migrate high-priority systems", level: 4 });
    const stage2 = stage2Heading.closest("li");
    expect(stage2).toBeInTheDocument();
    expect(within(stage2!).getByText("2028–2030")).toBeInTheDocument();
    expect(within(stage2!).getByText(/By end of 2028/i)).toBeInTheDocument();
    expect(within(stage2!).getByText(/By end of 2030/i)).toBeInTheDocument();

    // Stage 3 (2029–2033): Complete the planned migration
    const stage3Heading = within(timelineList).getByRole("heading", { name: "Complete the planned migration", level: 4 });
    const stage3 = stage3Heading.closest("li");
    expect(stage3).toBeInTheDocument();
    expect(within(stage3!).getByText("2029–2033")).toBeInTheDocument();
    expect(within(stage3!).getByText(/Target: 31 Dec 2029/i)).toBeInTheDocument();
    expect(within(stage3!).getByText(/Target: 31 Dec 2033/i)).toBeInTheDocument();

    // Official Source link with safe attributes
    const roadmapLink = screen.getByRole("link", { name: /Read the official roadmap/i });
    expect(roadmapLink).toHaveAttribute(
      "href",
      "https://dst.gov.in/sites/default/files/Quantum-Safe-Ecosystem-in-India.pdf",
    );
    expect(roadmapLink).toHaveAttribute("target", "_blank");
    expect(roadmapLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the closing CTA section with 'The transition starts with understanding.' and working links", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    renderAt("/");

    const ctaHeading = screen.getByRole("heading", {
      name: "The transition starts with understanding.",
      level: 2,
    });
    expect(ctaHeading).toBeInTheDocument();

    expect(
      screen.getByText(
        "Explore the concepts, experiment with cryptographic ideas, and learn why preparing for quantum-safe security matters today.",
      ),
    ).toBeInTheDocument();

    const ctaSection = ctaHeading.closest("section");
    expect(ctaSection).toBeInTheDocument();

    // CTA buttons within the section
    const startLearningLink = within(ctaSection!).getByRole("link", { name: "Start Learning" });
    expect(startLearningLink).toHaveAttribute("href", "/explore");

    const trySimulatorLink = within(ctaSection!).getByRole("link", { name: "Try the Simulator" });
    expect(trySimulatorLink).toHaveAttribute("href", "/simulator");

    // Confirms Service connection health-status card is not rendered on the homepage
    expect(screen.queryByRole("heading", { name: /service connection/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /check again/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Connected")).not.toBeInTheDocument();
  });

  it("confirms / and /simulator remain cleanly separated", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => undefined)));
    
    // Visit /
    renderAt("/");
    expect(screen.getByRole("heading", { name: "Prepare for a world beyond today’s encryption.", level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Laboratory Experiment Controls", level: 2 })).not.toBeInTheDocument();

    // Visit /simulator
    renderAt("/simulator");
    expect(screen.getByRole("heading", { name: "Quantum Cryptography Simulator", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Laboratory Experiment Controls", level: 2 })).toBeInTheDocument();
  });
});
