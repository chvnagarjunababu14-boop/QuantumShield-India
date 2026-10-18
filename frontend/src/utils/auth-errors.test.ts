import { describe, expect, it } from "vitest";
import { formatAuthError } from "./auth-errors";

describe("formatAuthError", () => {
  it("handles duplicate/existing email errors", () => {
    expect(
      formatAuthError({ error: "AUTH_EMAIL_EXISTS", message: "User already exists" }),
    ).toBe("An account with this email address already exists. Please sign in instead.");

    expect(
      formatAuthError({ message: "email address is already registered" }),
    ).toBe("An account with this email address already exists. Please sign in instead.");
  });

  it("handles invalid or expired OTP code errors", () => {
    expect(
      formatAuthError({ message: "Invalid OTP code provided" }),
    ).toBe("The verification code is invalid or has expired. Please check your code or request a new one.");

    expect(
      formatAuthError({ message: "Verification token has expired" }),
    ).toBe("The verification code is invalid or has expired. Please check your code or request a new one.");
  });

  it("handles pending verification errors", () => {
    expect(
      formatAuthError({ error: "AUTH_NEED_VERIFICATION", message: "Email not verified" }),
    ).toBe("Your email address is not verified yet. Please enter the verification code sent to your email.");
  });

  it("handles rate limiting errors", () => {
    expect(
      formatAuthError({ statusCode: 429, error: "RATE_LIMITED", message: "Too many requests" }),
    ).toBe("Too many requests. Please wait a moment before trying again.");
  });

  it("handles password requirement errors", () => {
    expect(
      formatAuthError({ error: "AUTH_WEAK_PASSWORD", message: "Password must be at least 6 characters" }),
    ).toBe("Password must be at least 6 characters long.");
  });

  it("handles invalid email format", () => {
    expect(
      formatAuthError({ error: "AUTH_INVALID_EMAIL", message: "Invalid email format" }),
    ).toBe("Please enter a valid email address.");
  });

  it("handles invalid credentials", () => {
    expect(
      formatAuthError({ error: "AUTH_INVALID_CREDENTIALS", message: "Invalid credentials" }),
    ).toBe("Invalid email or password.");
  });

  it("handles server and network errors without exposing internals", () => {
    expect(
      formatAuthError({ statusCode: 500, message: "Internal server error" }),
    ).toBe("The authentication server encountered an error. Please try again in a few moments.");

    expect(
      formatAuthError({ message: "Failed to fetch" }),
    ).toBe("Unable to connect to the authentication service. Please check your network connection and try again.");
  });

  it("redacts sensitive SQL queries or raw stack traces", () => {
    const rawSqlLeak = {
      message: "SELECT * FROM users WHERE id = 123; at pg_client.ts:42",
    };
    expect(formatAuthError(rawSqlLeak, "Custom fallback.")).toBe("Custom fallback.");
  });
});
