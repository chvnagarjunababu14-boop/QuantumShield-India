/**
 * Maps InsForge API errors, SDK errors, and network issues into user-friendly,
 * actionable error messages without exposing raw secrets, tokens, or stack traces.
 */
export function formatAuthError(
  err: unknown,
  fallbackMessage = "An error occurred during authentication.",
): string {
  if (!err) {
    return fallbackMessage;
  }

  const errObj = typeof err === "object" ? (err as Record<string, unknown>) : null;
  const rawMessage =
    typeof err === "string"
      ? err
      : typeof errObj?.message === "string"
        ? errObj.message
        : "";
  const rawCode =
    typeof errObj?.error === "string" ? errObj.error.toUpperCase() : "";
  const statusCode =
    typeof errObj?.statusCode === "number" ? errObj.statusCode : undefined;

  // Rate limiting / Too Many Requests
  if (
    statusCode === 429 ||
    rawCode === "RATE_LIMITED" ||
    rawCode === "TOO_MANY_REQUESTS" ||
    /rate limit|too many requests|throttl/i.test(rawMessage)
  ) {
    return "Too many requests. Please wait a moment before trying again.";
  }

  // Duplicate / existing email
  if (
    rawCode === "AUTH_EMAIL_EXISTS" ||
    rawCode === "ALREADY_EXISTS" ||
    /already exists|already registered|user already exists|duplicate key/i.test(
      rawMessage,
    )
  ) {
    return "An account with this email address already exists. Please sign in instead.";
  }

  // Invalid or expired OTP verification code
  if (
    (/otp|code|token/i.test(rawMessage) &&
      /invalid|expired|mismatch|incorrect|failed/i.test(rawMessage)) ||
    /invalid otp|invalid code|expired code/i.test(rawMessage)
  ) {
    return "The verification code is invalid or has expired. Please check your code or request a new one.";
  }

  // Email verification required / pending
  if (
    rawCode === "AUTH_NEED_VERIFICATION" ||
    /verify your email|email not verified|verification required|unverified/i.test(
      rawMessage,
    )
  ) {
    return "Your email address is not verified yet. Please enter the verification code sent to your email.";
  }

  // Password requirements / weak password
  if (
    rawCode === "AUTH_WEAK_PASSWORD" ||
    /weak password|password is too short|password must be at least/i.test(
      rawMessage,
    )
  ) {
    return "Password must be at least 6 characters long.";
  }

  // Invalid email format
  if (
    rawCode === "AUTH_INVALID_EMAIL" ||
    (/email/i.test(rawMessage) && /invalid|malformed|format/i.test(rawMessage))
  ) {
    return "Please enter a valid email address.";
  }

  // Invalid credentials during sign-in
  if (
    rawCode === "AUTH_INVALID_CREDENTIALS" ||
    /invalid credentials|invalid email or password|wrong password/i.test(
      rawMessage,
    )
  ) {
    return "Invalid email or password.";
  }

  // Server error (5xx)
  if (
    (statusCode !== undefined && statusCode >= 500) ||
    rawCode === "INTERNAL_ERROR" ||
    rawCode === "SERVER_ERROR"
  ) {
    return "The authentication server encountered an error. Please try again in a few moments.";
  }

  // Network or connection failure
  if (
    rawCode === "REQUEST_TIMEOUT" ||
    /network|failed to fetch|abort|timeout|offline|cors/i.test(rawMessage)
  ) {
    return "Unable to connect to the authentication service. Please check your network connection and try again.";
  }

  // Guard against leaking stack traces, JSON, or SQL errors
  if (
    rawMessage &&
    !rawMessage.includes("at ") &&
    !rawMessage.includes("SELECT ") &&
    !rawMessage.includes("INSERT ") &&
    !rawMessage.includes('{"') &&
    rawMessage.length < 150
  ) {
    return rawMessage;
  }

  return fallbackMessage;
}
