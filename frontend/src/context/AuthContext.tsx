import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getInsForgeClient, isInsForgeConfigured } from "../api/insforge";
import { fetchLearnerProfile, upsertLearnerProfile } from "../api/learning";
import type { AuthUser, LearnerProfile } from "../types/learning";
import { formatAuthError } from "../utils/auth-errors";

interface AuthContextValue {
  user: AuthUser | null;
  profile: LearnerProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; requireVerification?: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<{
    success: boolean;
    requireVerification?: boolean;
    email?: string;
    error?: string;
  }>;
  verifyEmail: (
    email: string,
    otp: string,
  ) => Promise<{ success: boolean; error?: string }>;
  resendVerificationCode: (
    email: string,
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  signOut: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isInsForgeConfigured();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(configured);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadUserProfile = useCallback(async (clientUser: AuthUser) => {
    const client = getInsForgeClient();
    if (!client) return;

    try {
      const dbProfile = await fetchLearnerProfile(client, clientUser.id);
      if (dbProfile) {
        setProfile(dbProfile);
      } else {
        // If profile row doesn't exist yet, initialize it
        const fallbackName =
          clientUser.displayName || clientUser.email.split("@")[0] || "Learner";
        try {
          const newProfile = await upsertLearnerProfile(client, {
            userId: clientUser.id,
            displayName: fallbackName,
          });
          setProfile(newProfile);
        } catch {
          // If upsert fails (e.g. offline), create a local placeholder
          setProfile({
            id: clientUser.id,
            user_id: clientUser.id,
            display_name: fallbackName,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch {
      // Fallback local profile if table is empty or error
      setProfile({
        id: clientUser.id,
        user_id: clientUser.id,
        display_name:
          clientUser.displayName || clientUser.email.split("@")[0] || "Learner",
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    if (!configured) {
      return;
    }

    const client = getInsForgeClient();
    if (!client) {
      return;
    }

    let isMounted = true;

    async function initSession() {
      try {
        const { data, error: userError } = await client!.auth.getCurrentUser();
        if (!isMounted) return;

        if (userError || !data?.user) {
          setUser(null);
          setProfile(null);
        } else {
          const rawUser = data.user;
          const authUser: AuthUser = {
            id: rawUser.id,
            email: rawUser.email,
            emailVerified: rawUser.emailVerified ?? false,
            displayName: (rawUser.profile?.name as string | undefined) ?? null,
          };
          setUser(authUser);
          await loadUserProfile(authUser);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setError(
            formatAuthError(err, "Failed to restore authentication session."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    // Subscribe to auth state changes
    const unsubscribe = client.auth.onAuthStateChange(async (event) => {
      if (!isMounted) return;

      if (event === "signedOut") {
        setUser(null);
        setProfile(null);
      } else {
        await initSession();
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [configured, loadUserProfile]);

  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; requireVerification?: boolean; error?: string }> => {
      setError(null);
      const client = getInsForgeClient();
      if (!client) {
        const msg =
          "InsForge backend is not configured. Please check environment variables.";
        setError(msg);
        return { success: false, error: msg };
      }

      try {
        const trimmedEmail = email.trim();
        const { data, error: signInError } =
          await client.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });

        if (signInError) {
          const rawErr = (signInError.error || "").toUpperCase();
          const rawMsg = signInError.message || "";
          const isPendingVerification =
            rawErr === "AUTH_NEED_VERIFICATION" ||
            /verify|verification|not verified/i.test(rawMsg);

          if (isPendingVerification) {
            const msg =
              "Your email address is not verified yet. Please enter the verification code sent to your email.";
            setError(msg);
            return { success: false, requireVerification: true, error: msg };
          }

          const msg = formatAuthError(signInError, "Invalid email or password.");
          setError(msg);
          return { success: false, error: msg };
        }

        if (!data?.user) {
          const msg = "Invalid email or password.";
          setError(msg);
          return { success: false, error: msg };
        }

        const rawUser = data.user;
        const authUser: AuthUser = {
          id: rawUser.id,
          email: rawUser.email,
          emailVerified: rawUser.emailVerified ?? false,
          displayName: (rawUser.profile?.name as string | undefined) ?? null,
        };
        setUser(authUser);
        await loadUserProfile(authUser);
        return { success: true };
      } catch (err) {
        const msg = formatAuthError(err, "Authentication failed.");
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [loadUserProfile],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string,
    ): Promise<{
      success: boolean;
      requireVerification?: boolean;
      email?: string;
      error?: string;
    }> => {
      setError(null);
      const client = getInsForgeClient();
      if (!client) {
        const msg =
          "InsForge backend is not configured. Please check environment variables.";
        setError(msg);
        return { success: false, error: msg };
      }

      try {
        const trimmedEmail = email.trim();
        const { data, error: signUpError } = await client.auth.signUp({
          email: trimmedEmail,
          password,
          name: displayName?.trim() || undefined,
        });

        if (signUpError) {
          const msg = formatAuthError(
            signUpError,
            "Unable to create account. Please check your details and try again.",
          );
          setError(msg);
          return { success: false, error: msg };
        }

        // InsForge requires email verification
        if (
          data?.requireEmailVerification ||
          (data?.user && !data.accessToken)
        ) {
          return {
            success: true,
            requireVerification: true,
            email: trimmedEmail,
          };
        }

        if (!data?.user) {
          const msg =
            "Unable to complete registration. Please try again in a few moments.";
          setError(msg);
          return { success: false, error: msg };
        }

        // In environments where verification is disabled and session is established immediately:
        const rawUser = data.user;
        const authUser: AuthUser = {
          id: rawUser.id,
          email: rawUser.email,
          emailVerified: rawUser.emailVerified ?? false,
          displayName:
            displayName?.trim() ||
            ((rawUser.profile?.name as string | undefined) ?? null),
        };
        setUser(authUser);

        try {
          const newProfile = await upsertLearnerProfile(client, {
            userId: authUser.id,
            displayName:
              displayName?.trim() ||
              authUser.email.split("@")[0] ||
              "Learner",
          });
          setProfile(newProfile);
        } catch {
          setProfile({
            id: authUser.id,
            user_id: authUser.id,
            display_name:
              displayName?.trim() ||
              authUser.email.split("@")[0] ||
              "Learner",
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        return { success: true, requireVerification: false };
      } catch (err) {
        const msg = formatAuthError(
          err,
          "Unable to create account. Please check your details and try again.",
        );
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [],
  );

  const verifyEmail = useCallback(
    async (
      email: string,
      otp: string,
    ): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      const client = getInsForgeClient();
      if (!client) {
        const msg =
          "InsForge backend is not configured. Please check environment variables.";
        setError(msg);
        return { success: false, error: msg };
      }

      try {
        const trimmedEmail = email.trim();
        const trimmedOtp = otp.trim();

        const { data, error: verifyError } = await client.auth.verifyEmail({
          email: trimmedEmail,
          otp: trimmedOtp,
        });

        if (verifyError || !data?.user) {
          const msg = formatAuthError(
            verifyError,
            "The verification code is invalid or has expired. Please check your code or request a new one.",
          );
          setError(msg);
          return { success: false, error: msg };
        }

        const rawUser = data.user;
        const authUser: AuthUser = {
          id: rawUser.id,
          email: rawUser.email,
          emailVerified: rawUser.emailVerified ?? true,
          displayName: (rawUser.profile?.name as string | undefined) ?? null,
        };
        setUser(authUser);
        await loadUserProfile(authUser);
        return { success: true };
      } catch (err) {
        const msg = formatAuthError(
          err,
          "The verification code is invalid or has expired. Please check your code or request a new one.",
        );
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [loadUserProfile],
  );

  const resendVerificationCode = useCallback(
    async (
      email: string,
    ): Promise<{ success: boolean; message?: string; error?: string }> => {
      setError(null);
      const client = getInsForgeClient();
      if (!client) {
        const msg =
          "InsForge backend is not configured. Please check environment variables.";
        return { success: false, error: msg };
      }

      try {
        const trimmedEmail = email.trim();
        const { data, error: resendError } =
          await client.auth.resendVerificationEmail({
            email: trimmedEmail,
          });

        if (resendError) {
          const msg = formatAuthError(
            resendError,
            "Unable to resend verification code. Please wait a moment before trying again.",
          );
          return { success: false, error: msg };
        }

        return {
          success: true,
          message:
            data?.message ||
            "A new 6-digit verification code has been sent to your email.",
        };
      } catch (err) {
        const msg = formatAuthError(
          err,
          "Unable to resend verification code. Please wait a moment before trying again.",
        );
        return { success: false, error: msg };
      }
    },
    [],
  );

  const signOut = useCallback(async (): Promise<void> => {
    setError(null);
    const client = getInsForgeClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {
        // Clear local state regardless of server logout response
      }
    }
    setUser(null);
    setProfile(null);
  }, []);

  const updateDisplayName = useCallback(
    async (displayName: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      if (!user) {
        return { success: false, error: "Must be signed in to update profile" };
      }
      const client = getInsForgeClient();
      if (!client) {
        return { success: false, error: "InsForge backend is not configured" };
      }

      try {
        const updated = await upsertLearnerProfile(client, {
          userId: user.id,
          displayName: displayName.trim(),
        });
        setProfile(updated);
        setUser((prev) =>
          prev ? { ...prev, displayName: displayName.trim() } : null,
        );
        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update profile";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [user],
  );

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (user) {
      await loadUserProfile(user);
    }
  }, [user, loadUserProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isLoading,
      isConfigured: configured,
      error,
      signIn,
      signUp,
      verifyEmail,
      resendVerificationCode,
      signOut,
      updateDisplayName,
      refreshProfile,
      clearError,
    }),
    [
      user,
      profile,
      isLoading,
      configured,
      error,
      signIn,
      signUp,
      verifyEmail,
      resendVerificationCode,
      signOut,
      updateDisplayName,
      refreshProfile,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, type AuthContextValue };
