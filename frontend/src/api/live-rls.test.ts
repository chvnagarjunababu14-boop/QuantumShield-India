import { describe, expect, it } from "vitest";
import { createClient } from "@insforge/sdk";
import { getInsForgeConfig } from "./insforge";

describe("Live InsForge Row-Level Security (RLS) & Access Controls", () => {
  const config = getInsForgeConfig() || {
    baseUrl: "https://qmy8ne8b.us-east.insforge.app",
    anonKey: "",
  };

  const client = createClient({
    baseUrl: config.baseUrl,
    anonKey: config.anonKey,
  });

  it("denies anonymous access to private learner profiles", async () => {
    const { data, error } = await client.database
      .from("learner_profiles")
      .select("*");

    // Anonymous role has REVOKE ALL and RLS using auth.uid()
    // It must return an error (code 42501 permission denied) or empty data
    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBe(true);
  });

  it("denies anonymous access to private lesson progress", async () => {
    const { data, error } = await client.database
      .from("lesson_progress")
      .select("*");

    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBe(true);
  });

  it("denies anonymous access to private bookmarks", async () => {
    const { data, error } = await client.database
      .from("bookmarks")
      .select("*");

    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBe(true);
  });

  it("denies anonymous access to private quiz results", async () => {
    const { data, error } = await client.database
      .from("quiz_results")
      .select("*");

    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBe(true);
  });

  it("denies anonymous access to private community reports", async () => {
    const { data, error } = await client.database
      .from("community_reports")
      .select("*");

    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBe(true);
  });

  it("denies anonymous access to administrative user roles", async () => {
    const { data, error } = await client.database
      .from("user_roles")
      .select("*");

    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBe(true);
  });

  it("allows anonymous reading of public community discussions", async () => {
    const { data, error } = await client.database
      .from("community_discussions")
      .select("*");

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("blocks anonymous insertion of discussions via RLS WITH CHECK", async () => {
    const { error } = await client.database
      .from("community_discussions")
      .insert([
        {
          author_id: "00000000-0000-0000-0000-000000000000",
          author_name: "Attacker",
          topic_id: "cybersecurity",
          title: "Malicious Injection",
          content: "Testing RLS restriction on unauthorized insert",
        },
      ]);

    // Must be rejected by RLS or auth check
    expect(error).not.toBeNull();
  });

  it("blocks anonymous insertion of reports via RLS WITH CHECK", async () => {
    const { error } = await client.database
      .from("community_reports")
      .insert([
        {
          target_type: "discussion",
          target_id: "00000000-0000-0000-0000-000000000000",
          reporter_id: "00000000-0000-0000-0000-000000000000",
          reason: "Spam report test",
        },
      ]);

    expect(error).not.toBeNull();
  });
});
