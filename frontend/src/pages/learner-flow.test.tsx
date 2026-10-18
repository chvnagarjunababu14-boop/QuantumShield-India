import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "../App";

vi.mock("../api/insforge", () => ({
  isInsForgeConfigured: vi.fn(() => true),
  getInsForgeClient: vi.fn(() => ({
    auth: {
      getCurrentUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => () => {}),
      signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: { message: "Invalid email or password." } }),
      signUp: vi.fn().mockResolvedValue({ data: null, error: { message: "Unable to create account." } }),
      verifyEmail: vi.fn().mockResolvedValue({ data: null, error: { message: "Invalid code." } }),
      resendVerificationEmail: vi.fn().mockResolvedValue({ data: { success: true, message: "Code sent." }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    database: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
  })),
  resetInsForgeClient: vi.fn(),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Learner experience and authentication flows", () => {
  it("allows signed-out users to read public lessons without restrictions", () => {
    renderAt("/lessons/post-quantum-cryptography");

    expect(screen.getByRole("heading", { name: "Post-quantum cryptography" })).toBeInTheDocument();
    expect(
      screen.getByText(/Public sample lesson · Open without an account./i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Sign in to save progress & bookmarks/i }),
    ).toBeInTheDocument();
  });

  it("prompts signed-out users to sign in when accessing the learning dashboard", async () => {
    renderAt("/learning");

    expect(
      await screen.findByRole("heading", { name: /Sign in to access your learning dashboard/i }),
    ).toBeInTheDocument();
    const main = screen.getByRole("main");
    expect(within(main).getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/auth?mode=signin",
    );
    expect(within(main).getByRole("link", { name: "Create Account" })).toHaveAttribute(
      "href",
      "/auth?mode=signup",
    );
  });

  it("renders the accessible authentication page with sign-in and sign-up tabs", async () => {
    const user = userEvent.setup();
    renderAt("/auth");

    expect(screen.getByRole("heading", { name: /Sign in to your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    // Switch to create account tab
    await user.click(screen.getByRole("tab", { name: "Create Account" }));
    expect(screen.getByRole("heading", { name: /Create your learner account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Display name/i)).toBeInTheDocument();
  });

  it("shows accessible validation error when submitting empty fields", async () => {
    const user = userEvent.setup();
    renderAt("/auth");

    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Please enter your email address/i);
  });
});
