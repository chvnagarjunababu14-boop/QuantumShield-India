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

interface AuthContextValue {
  user: AuthUser | null;
  profile: LearnerProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
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
        const fallbackName = clientUser.displayName || clientUser.email.split("@")[0] || "Learner";
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
        display_name: clientUser.displayName || clientUser.email.split("@")[0] || "Learner",
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
          setError(err instanceof Error ? err.message : "Failed to restore session");
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
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      const client = getInsForgeClient();
      if (!client) {
        const msg = "InsForge backend is not configured. Please check environment variables.";
        setError(msg);
        return { success: false, error: msg };
      }

      try {
        const { data, error: signInError } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError || !data?.user) {
          const msg = signInError?.message || "Invalid email or password.";
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
        const msg = err instanceof Error ? err.message : "Authentication failed.";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [loadUserProfile],
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      const client = getInsForgeClient();
      if (!client) {
        const msg = "InsForge backend is not configured. Please check environment variables.";
        setError(msg);
        return { success: false, error: msg };
      }

      try {
        const { data, error: signUpError } = await client.auth.signUp({
          email: email.trim(),
          password,
          name: displayName?.trim() || undefined,
        });

        if (signUpError || !data?.user) {
          const msg = signUpError?.message || "Registration failed.";
          setError(msg);
          return { success: false, error: msg };
        }

        const rawUser = data.user;
        const authUser: AuthUser = {
          id: rawUser.id,
          email: rawUser.email,
          emailVerified: rawUser.emailVerified ?? false,
          displayName: displayName?.trim() || ((rawUser.profile?.name as string | undefined) ?? null),
        };
        setUser(authUser);

        // Create learner profile record in database
        try {
          const newProfile = await upsertLearnerProfile(client, {
            userId: authUser.id,
            displayName: displayName?.trim() || authUser.email.split("@")[0] || "Learner",
          });
          setProfile(newProfile);
        } catch {
          // Fallback if table insert fails
          setProfile({
            id: authUser.id,
            user_id: authUser.id,
            display_name: displayName?.trim() || authUser.email.split("@")[0] || "Learner",
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Registration failed.";
        setError(msg);
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
        setUser((prev) => (prev ? { ...prev, displayName: displayName.trim() } : null));
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
      signOut,
      updateDisplayName,
      refreshProfile,
      clearError,
    }),
    [user, profile, isLoading, configured, error, signIn, signUp, signOut, updateDisplayName, refreshProfile, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, type AuthContextValue };

