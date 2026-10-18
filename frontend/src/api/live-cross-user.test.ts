import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { createClient, type InsForgeClient } from "@insforge/sdk";
import { getInsForgeConfig } from "./insforge";
import { execSync } from "child_process";

describe("Live Two-Account Cross-User Authorization & RLS Enforcement", () => {
  const config = getInsForgeConfig() || {
    baseUrl: "https://qmy8ne8b.us-east.insforge.app",
    anonKey: "anon_75603278890b03afe43bbd7cd24a660184c945f173ae224fc703efda9ac2514e",
  };

  const timestamp = Date.now();
  const emailA = `audit_live_a_${timestamp}@quantumshield.test`;
  const emailB = `audit_live_b_${timestamp}@quantumshield.test`;
  const testPassword = "AuditLivePassword2026!";

  let clientA: InsForgeClient;
  let clientB: InsForgeClient;
  let anonClient: InsForgeClient;
  let userAId: string;
  let userBId: string;

  let testDiscId: string;
  let testReplyId: string;

  function runSql(sql: string) {
    execSync(`npx @insforge/cli db query ${JSON.stringify(sql)}`, {
      cwd: "c:\\Users\\chvna\\OneDrive\\Desktop\\Projects\\QuantaIndia",
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  }

  beforeAll(async () => {
    anonClient = createClient({
      baseUrl: config.baseUrl,
      anonKey: config.anonKey,
    });

    // 1. Register Account A & Account B via live InsForge SDK
    await anonClient.auth.signUp({
      email: emailA,
      password: testPassword,
      name: "Live Auditor A",
    });

    await anonClient.auth.signUp({
      email: emailB,
      password: testPassword,
      name: "Live Auditor B",
    });

    // 2. Set email_verified = true via supported administrative SQL
    runSql(`UPDATE auth.users SET email_verified = true WHERE email IN ('${emailA}', '${emailB}');`);

    // 3. Authenticate both accounts with live sessions
    clientA = createClient({ baseUrl: config.baseUrl, anonKey: config.anonKey });
    const authA = await clientA.auth.signInWithPassword({ email: emailA, password: testPassword });
    expect(authA.error).toBeNull();
    expect(authA.data?.user).toBeDefined();
    userAId = authA.data!.user!.id;

    clientB = createClient({ baseUrl: config.baseUrl, anonKey: config.anonKey });
    const authB = await clientB.auth.signInWithPassword({ email: emailB, password: testPassword });
    expect(authB.error).toBeNull();
    expect(authB.data?.user).toBeDefined();
    userBId = authB.data!.user!.id;
  }, 30000);

  afterAll(async () => {
    // Clean up all disposable test records created during test
    if (userAId) {
      if (testReplyId) {
        await clientA.database.from("community_replies").delete().eq("id", testReplyId);
      }
      if (testDiscId) {
        await clientA.database.from("community_reports").delete().eq("target_id", testDiscId);
        await clientA.database.from("community_discussions").delete().eq("id", testDiscId);
      }
      await clientA.database.from("quiz_results").delete().eq("user_id", userAId);
      await clientA.database.from("lesson_progress").delete().eq("user_id", userAId);
      await clientA.database.from("bookmarks").delete().eq("user_id", userAId);
      await clientA.database.from("learner_profiles").delete().eq("user_id", userAId);
    }
    if (userBId) {
      await clientB.database.from("learner_profiles").delete().eq("user_id", userBId);
    }
    try {
      runSql(`DELETE FROM auth.users WHERE email IN ('${emailA}', '${emailB}');`);
    } catch {
      // ignore cleanup error if users already removed
    }
  }, 30000);

  it("Account A can create and access its own learner profile", async () => {
    const { data, error } = await clientA.database
      .from("learner_profiles")
      .insert([{ user_id: userAId, display_name: "Auditor A" }])
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.user_id).toBe(userAId);

    // Account A can read its own profile
    const readA = await clientA.database.from("learner_profiles").select("*").eq("user_id", userAId);
    expect(readA.error).toBeNull();
    expect(readA.data).toHaveLength(1);
    expect(readA.data![0].user_id).toBe(userAId);
  });

  it("Account B cannot read Account A's private learner profile", async () => {
    const { data } = await clientB.database
      .from("learner_profiles")
      .select("*")
      .eq("user_id", userAId);

    // RLS filters out Account A's profile from Account B's query
    expect(data).toHaveLength(0);
  });

  it("Account A can create bookmarks; Account B cannot read, update, or delete them", async () => {
    // Account A creates bookmark
    const { data: bA, error: bAErr } = await clientA.database
      .from("bookmarks")
      .insert([{ user_id: userAId, lesson_slug: "quantum-intro-audit" }])
      .select()
      .single();

    expect(bAErr).toBeNull();
    expect(bA?.lesson_slug).toBe("quantum-intro-audit");

    // Account B cannot read Account A's bookmarks
    const readByB = await clientB.database.from("bookmarks").select("*").eq("user_id", userAId);
    expect(readByB.data).toHaveLength(0);

    // Account B cannot update Account A's bookmark
    const updateByB = await clientB.database
      .from("bookmarks")
      .update({ lesson_slug: "hacked" })
      .eq("user_id", userAId)
      .select();
    expect(updateByB.data).toHaveLength(0);

    // Account B cannot delete Account A's bookmark
    const deleteByB = await clientB.database
      .from("bookmarks")
      .delete()
      .eq("user_id", userAId)
      .select();
    expect(deleteByB.data).toHaveLength(0);

    // Verify bookmark is still intact for Account A
    const verifyA = await clientA.database.from("bookmarks").select("*").eq("user_id", userAId);
    expect(verifyA.data).toHaveLength(1);
    expect(verifyA.data![0].lesson_slug).toBe("quantum-intro-audit");
  });

  it("Account B cannot insert records pretending to be Account A (user_id spoofing blocked)", async () => {
    const { error } = await clientB.database.from("bookmarks").insert([{
      user_id: userAId,
      lesson_slug: "spoofed-lesson",
    }]);

    // WITH CHECK (auth.uid() = user_id) must reject the insert
    expect(error).not.toBeNull();
  });

  it("enforces cross-user isolation on lesson progress and quiz results", async () => {
    // Account A records lesson progress and quiz result
    const lpRes = await clientA.database.from("lesson_progress").insert([{
      user_id: userAId,
      lesson_slug: "lesson-pqc-live",
      completed: true,
    }]).select().single();
    expect(lpRes.error).toBeNull();

    const qrRes = await clientA.database.from("quiz_results").insert([{
      user_id: userAId,
      quiz_id: "quiz-pqc-live",
      score: 9,
      total_score: 10,
    }]).select().single();
    expect(qrRes.error).toBeNull();

    // Account B cannot read Account A's progress
    const readLpByB = await clientB.database.from("lesson_progress").select("*").eq("user_id", userAId);
    expect(readLpByB.data).toHaveLength(0);

    // Account B cannot update or delete Account A's progress
    const updateLpByB = await clientB.database.from("lesson_progress").update({ completed: false }).eq("user_id", userAId).select();
    expect(updateLpByB.data).toHaveLength(0);

    const deleteLpByB = await clientB.database.from("lesson_progress").delete().eq("user_id", userAId).select();
    expect(deleteLpByB.data).toHaveLength(0);

    // Account B cannot read Account A's quiz results
    const readQrByB = await clientB.database.from("quiz_results").select("*").eq("user_id", userAId);
    expect(readQrByB.data).toHaveLength(0);
  });

  it("enforces discussion and reply ownership (author can edit/delete; non-author cannot)", async () => {
    // Account A creates a discussion
    const discRes = await clientA.database.from("community_discussions").insert([{
      author_id: userAId,
      author_name: "Auditor A",
      topic_id: "cybersecurity",
      title: "Live Audit Discussion",
      content: "Testing live author ownership permissions.",
    }]).select().single();

    expect(discRes.error).toBeNull();
    testDiscId = discRes.data!.id;

    // Public/Anon can read the discussion
    const anonRead = await anonClient.database.from("community_discussions").select("*").eq("id", testDiscId);
    expect(anonRead.data).toHaveLength(1);

    // Account B cannot update Account A's discussion
    const updateByB = await clientB.database
      .from("community_discussions")
      .update({ title: "Hacked by Account B" })
      .eq("id", testDiscId)
      .select();
    expect(updateByB.data).toHaveLength(0);

    // Account B cannot delete Account A's discussion
    const deleteByB = await clientB.database
      .from("community_discussions")
      .delete()
      .eq("id", testDiscId)
      .select();
    expect(deleteByB.data).toHaveLength(0);

    // Account A can legitimately update its own discussion
    const updateByA = await clientA.database
      .from("community_discussions")
      .update({ title: "Updated by Author A" })
      .eq("id", testDiscId)
      .select()
      .single();
    expect(updateByA.error).toBeNull();
    expect(updateByA.data?.title).toBe("Updated by Author A");

    // Account A creates a reply
    const replyRes = await clientA.database.from("community_replies").insert([{
      discussion_id: testDiscId,
      author_id: userAId,
      author_name: "Auditor A",
      content: "Reply by Auditor A.",
    }]).select().single();
    expect(replyRes.error).toBeNull();
    testReplyId = replyRes.data!.id;

    // Account B cannot update Account A's reply
    const updateReplyByB = await clientB.database
      .from("community_replies")
      .update({ content: "Hacked reply" })
      .eq("id", testReplyId)
      .select();
    expect(updateReplyByB.data).toHaveLength(0);

    // Account B cannot delete Account A's reply
    const deleteReplyByB = await clientB.database
      .from("community_replies")
      .delete()
      .eq("id", testReplyId)
      .select();
    expect(deleteReplyByB.data).toHaveLength(0);
  });

  it("enforces report isolation and prevents privilege escalation", async () => {
    // Account A submits a report
    const repRes = await clientA.database.from("community_reports").insert([{
      target_type: "discussion",
      target_id: testDiscId,
      reporter_id: userAId,
      reason: "Live audit test report",
    }]).select().single();

    expect(repRes.error).toBeNull();

    // Account B cannot view Account A's report
    const readReportsByB = await clientB.database
      .from("community_reports")
      .select("*")
      .eq("reporter_id", userAId);
    expect(readReportsByB.data).toHaveLength(0);

    // Privilege escalation prevention: Account B cannot self-assign roles in user_roles
    const roleTamper = await clientB.database.from("user_roles").insert([{
      user_id: userBId,
      role: "admin",
    }]);
    expect(roleTamper.error).not.toBeNull();
  });
});
