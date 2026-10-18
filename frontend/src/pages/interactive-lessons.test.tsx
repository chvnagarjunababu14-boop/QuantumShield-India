import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Interactive Visual Learning Experience — All Six Lessons", () => {
  it("renders Lesson 1: Cybersecurity Fundamentals with hero image and CIA visualizer", async () => {
    const user = userEvent.setup();
    renderAt("/lessons/cybersecurity-fundamentals");

    // Header, Hero Image & Learning Objectives
    expect(
      screen.getByRole("heading", { name: "Cybersecurity fundamentals" }),
    ).toBeInTheDocument();

    const heroImg = screen.getByRole("img", {
      name: /Cybersecurity fundamentals illustration/i,
    });
    expect(heroImg).toHaveAttribute(
      "src",
      "/images/lessons/01-cybersecurity-fundamentals.webp",
    );
    expect(
      screen.getByRole("heading", { name: /What You'll Learn/i }),
    ).toBeInTheDocument();

    // Interactive Lab: CIA Triad Visualizer
    expect(
      screen.getByRole("heading", { name: /CIA Triad & Risk Mechanics/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /^Confidentiality$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /^Integrity$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /^Availability$/i }),
    ).toBeInTheDocument();

    // Switch to Integrity tab
    await user.click(screen.getByRole("tab", { name: /^Integrity$/i }));
    expect(
      screen.getByText(/Data and system behavior have not been altered without authorization\./i),
    ).toBeInTheDocument();

    // Test Incident Taxonomy tab
    await user.click(
      screen.getByRole("tab", { name: /Threat vs Vulnerability vs Incident/i }),
    );
    expect(
      screen.getByText(/A vulnerability is a weakness\. A threat is someone or something that could exploit it\./i),
    ).toBeInTheDocument();

    // Real-World Scenario
    expect(
      screen.getByRole("heading", {
        name: /Scenario: The Urgent Payroll Account Change/i,
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", {
        name: /Integrity is attacked/i,
      }),
    );
    expect(
      screen.getByText(/Integrity protects data accuracy and unauthorized modification/i),
    ).toBeInTheDocument();

    // Key Takeaways
    expect(
      screen.getByRole("heading", { name: /Summary of Key Insights/i }),
    ).toBeInTheDocument();
  });

  it("renders Lesson 2: Quantum Computing Fundamentals with Bit vs Qubit visualizer", async () => {
    const user = userEvent.setup();
    renderAt("/lessons/quantum-computing-fundamentals");

    expect(
      screen.getByRole("heading", { name: "Quantum computing fundamentals" }),
    ).toBeInTheDocument();

    const heroImg = screen.getByRole("img", {
      name: /Quantum computing visual/i,
    });
    expect(heroImg).toHaveAttribute(
      "src",
      "/images/lessons/02-quantum-computing-fundamentals.webp",
    );

    // Interactive Lab: Bit vs Qubit Simulator
    expect(
      screen.getByRole("heading", { name: "Interactive Bit vs Qubit Simulator" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Set Bit to 1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Measure Qubit/i })).toBeInTheDocument();

    // Measure the qubit
    await user.click(screen.getByRole("button", { name: /Measure Qubit/i }));

    // Real-World Scenario
    expect(
      screen.getByRole("heading", {
        name: /Scenario: The 'Quantum Laptop' Commercial Claim/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders Lesson 3: Quantum Computing and Cryptography with Threat Matrix & HNDL Timeline", async () => {
    renderAt("/lessons/quantum-computing-and-cryptography");

    expect(
      screen.getByRole("heading", {
        name: "Why quantum computing matters to cryptography",
      }),
    ).toBeInTheDocument();

    const heroImg = screen.getByRole("img", {
      name: /Cryptographic impact visual/i,
    });
    expect(heroImg).toHaveAttribute(
      "src",
      "/images/lessons/03-quantum-cryptography.webp",
    );

    // Interactive Lab: Threat Matrix
    expect(
      screen.getByRole("heading", {
        name: "Quantum Cryptanalysis & Algorithm Exposure",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Shor's Algorithm/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Grover's Algorithm/i).length).toBeGreaterThan(0);

    // Harvest Now Decrypt Later Timeline slider
    expect(
      screen.getByLabelText("Data retention years slider"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/1\. Interception Today/i),
    ).toBeInTheDocument();

    // Scenario
    expect(
      screen.getByRole("heading", {
        name: /Scenario: Long-Term Sovereign Satellite Archive/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders Lesson 4: Post-Quantum Cryptography with PQC Algorithm Explorer & Roadmap", async () => {
    const user = userEvent.setup();
    renderAt("/lessons/post-quantum-cryptography");

    expect(
      screen.getByRole("heading", { name: "Post-quantum cryptography" }),
    ).toBeInTheDocument();

    const heroImg = screen.getByRole("img", {
      name: /Post-quantum cryptography visual/i,
    });
    expect(heroImg).toHaveAttribute(
      "src",
      "/images/lessons/04-post-quantum-cryptography.webp",
    );

    // Interactive Lab: PQC Standards Explorer
    expect(
      screen.getByRole("heading", {
        name: "Interactive Post-Quantum Algorithm Matrix",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /ML-KEM/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /ML-DSA/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /SLH-DSA/i })).toBeInTheDocument();

    // Check ML-DSA details
    await user.click(screen.getByRole("tab", { name: /ML-DSA/i }));
    expect(
      screen.getByRole("heading", { name: /ML-DSA — NIST FIPS 204/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Original Research Name: CRYSTALS-Dilithium/i),
    ).toBeInTheDocument();

    // Migration Sequence
    expect(
      screen.getByRole("heading", { name: /Interactive PQC Migration Sequence/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Discovery & Inventory/i }),
    ).toBeInTheDocument();
  });

  it("renders Lesson 5: Artificial Intelligence with Architecture Pipeline & Prompt Injection Lab", async () => {
    const user = userEvent.setup();
    renderAt("/lessons/artificial-intelligence");

    expect(
      screen.getByRole("heading", {
        name: "Artificial intelligence and machine learning",
      }),
    ).toBeInTheDocument();

    const heroImg = screen.getByRole("img", {
      name: /Artificial intelligence visual/i,
    });
    expect(heroImg).toHaveAttribute(
      "src",
      "/images/lessons/05-ai-and-machine-learning.webp",
    );

    // Interactive Lab
    expect(
      screen.getByRole("heading", {
        name: "Interactive AI Architecture & Validation Sandbox",
      }),
    ).toBeInTheDocument();

    // Test prompt selection in sandbox
    expect(
      screen.getByRole("heading", {
        name: /Interactive Experiment: Testing Untrusted Model Outputs/i,
      }),
    ).toBeInTheDocument();

    // Click the Benign Query prompt button
    await user.click(
      screen.getByRole("button", { name: /Benign Query/i }),
    );
    expect(
      screen.getByText(/System Safe: Output Filtered & Verified/i),
    ).toBeInTheDocument();
  });

  it("renders Lesson 6: Cloud and IoT Security with Architecture Layers & Shared Responsibility Matrix", async () => {
    const user = userEvent.setup();
    renderAt("/lessons/cloud-and-iot-security");

    expect(
      screen.getByRole("heading", {
        name: "Cloud computing and IoT security",
      }),
    ).toBeInTheDocument();

    const heroImg = screen.getByRole("img", {
      name: /Cloud and IoT security visual/i,
    });
    expect(heroImg).toHaveAttribute(
      "src",
      "/images/lessons/06-cloud-and-iot-security.webp",
    );

    // Interactive Lab
    expect(
      screen.getByRole("heading", {
        name: "Interactive Architecture & Attack Surface Explorer",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /1\. Edge IoT Devices/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /2\. Gateway & Network/i })).toBeInTheDocument();

    // Check Cloud Shared Responsibility Model matrix
    expect(
      screen.getByRole("heading", { name: /Interactive Shared Responsibility Matrix/i }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("tab", { name: /PaaS/i }),
    );
    expect(
      screen.getByText(/Provider manages runtime updates automatically\./i),
    ).toBeInTheDocument();
  });
});
