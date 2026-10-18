import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const mockSignUp = vi.fn();
const mockVerifyEmail = vi.fn();
const mockResendVerificationEmail = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock("../api/insforge", () => ({
  isInsForgeConfigured: vi.fn(() => true),
  getInsForgeClient: vi.fn(() => ({
    auth: {
      getCurrentUser: mockGetCurrentUser,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      verifyEmail: mockVerifyEmail,
      resendVerificationEmail: mockResendVerificationEmail,
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

describe("InsForge Registration and Email OTP Verification Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ data: { user: null }, error: null });
    mockOnAuthStateChange.mockReturnValue(() => {});
  });

  it("handles successful signup that requires email verification and shows OTP screen", async () => {
    const user = userEvent.setup();
    mockSignUp.mockResolvedValueOnce({
      data: {
        accessToken: null,
        requireEmailVerification: true,
        user: {
          id: "u-123",
          email: "priya@example.com",
          emailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile: { name: "Priya Sharma" },
        },
      },
      error: null,
    });

    renderAt("/auth?mode=signup");

    expect(screen.getByRole("heading", { name: /Create your learner account/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Display name/i), "Priya Sharma");
    await user.type(screen.getByLabelText(/Email address/i), "priya@example.com");
    await user.type(screen.getByLabelText(/^Password/i), "SecurePassword123!");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    // Should transition to step 2 verification
    expect(
      await screen.findByRole("heading", { name: /Verify your email address/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/priya@example.com/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/6-digit verification code/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Verify email/i })).toBeInTheDocument();
  });

  it("successfully verifies the 6-digit OTP code and establishes learner session", async () => {
    const user = userEvent.setup();
    mockVerifyEmail.mockResolvedValueOnce({
      data: {
        accessToken: "valid-jwt-token",
        user: {
          id: "u-123",
          email: "priya@example.com",
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile: { name: "Priya Sharma" },
        },
      },
      error: null,
    });

    renderAt("/auth?mode=verify&email=priya@example.com");

    expect(screen.getByRole("heading", { name: /Verify your email address/i })).toBeInTheDocument();
    const codeInput = screen.getByLabelText(/6-digit verification code/i);

    // Verify button is disabled until 6 digits entered
    const verifyButton = screen.getByRole("button", { name: /Verify email/i });
    expect(verifyButton).toBeDisabled();

    await user.type(codeInput, "849201");
    expect(codeInput).toHaveValue("849201");
    expect(verifyButton).toBeEnabled();

    await user.click(verifyButton);

    expect(mockVerifyEmail).toHaveBeenCalledWith({
      email: "priya@example.com",
      otp: "849201",
    });

    // Success feedback is displayed
    expect(
      await screen.findByText(/Email verified successfully!/i),
    ).toBeInTheDocument();
  });

  it("displays actionable error message for invalid or expired OTP code", async () => {
    const user = userEvent.setup();
    mockVerifyEmail.mockResolvedValueOnce({
      data: null,
      error: {
        statusCode: 400,
        error: "INVALID_INPUT",
        message: "Invalid or expired OTP code",
      },
    });

    renderAt("/auth?mode=verify&email=priya@example.com");

    const codeInput = screen.getByLabelText(/6-digit verification code/i);
    await user.type(codeInput, "000000");
    await user.click(screen.getByRole("button", { name: /Verify email/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      /The verification code is invalid or has expired\. Please check your code or request a new one\./i,
    );
  });

  it("handles resending verification code with cooldown state", async () => {
    const user = userEvent.setup();
    mockResendVerificationEmail.mockResolvedValueOnce({
      data: {
        success: true,
        message: "A new 6-digit verification code has been sent to your email.",
      },
      error: null,
    });

    renderAt("/auth?mode=verify&email=priya@example.com");

    const resendButton = screen.getByRole("button", { name: /Resend verification code/i });
    await user.click(resendButton);

    expect(mockResendVerificationEmail).toHaveBeenCalledWith({
      email: "priya@example.com",
    });

    // Expect status announcement and countdown cooldown
    expect(
      await screen.findByText(/A new 6-digit verification code has been sent to your email/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Resend code in 60s/i })).toBeDisabled();
  });

  it("handles rate limiting when requesting too many verification codes", async () => {
    const user = userEvent.setup();
    mockResendVerificationEmail.mockResolvedValueOnce({
      data: null,
      error: {
        statusCode: 429,
        error: "RATE_LIMITED",
        message: "Too many requests",
      },
    });

    renderAt("/auth?mode=verify&email=priya@example.com");

    const resendButton = screen.getByRole("button", { name: /Resend verification code/i });
    await user.click(resendButton);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      /Too many requests\. Please wait a moment before trying again\./i,
    );
  });

  it("shows specific message when registering with an existing account email", async () => {
    const user = userEvent.setup();
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: {
        statusCode: 409,
        error: "AUTH_EMAIL_EXISTS",
        message: "Email already registered",
      },
    });

    renderAt("/auth?mode=signup");

    await user.type(screen.getByLabelText(/Email address/i), "existing@example.com");
    await user.type(screen.getByLabelText(/^Password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      /An account with this email address already exists\. Please sign in instead\./i,
    );
  });

  it("redirects unverified user to verification screen when attempting sign-in", async () => {
    const user = userEvent.setup();
    mockSignInWithPassword.mockResolvedValueOnce({
      data: null,
      error: {
        statusCode: 403,
        error: "AUTH_NEED_VERIFICATION",
        message: "Email address is not verified",
      },
    });

    renderAt("/auth?mode=signin");

    await user.type(screen.getByLabelText(/Email address/i), "unverified@example.com");
    await user.type(screen.getByLabelText(/^Password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    // Should transition to verification screen with warning
    expect(
      await screen.findByRole("heading", { name: /Verify your email address/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/unverified@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Your email address is not verified yet\. Please enter the verification code/i),
    ).toBeInTheDocument();
  });

  it("allows navigating back to sign-in or changing email address", async () => {
    const user = userEvent.setup();
    renderAt("/auth?mode=verify&email=mistake@example.com");

    // Click change email address
    await user.click(screen.getByRole("button", { name: /Change email address/i }));
    expect(screen.getByRole("heading", { name: /Create your learner account/i })).toBeInTheDocument();

    // Click sign-in tab
    await user.click(screen.getByRole("tab", { name: "Sign In" }));
    expect(screen.getByRole("heading", { name: /Sign in to your account/i })).toBeInTheDocument();
  });
});
