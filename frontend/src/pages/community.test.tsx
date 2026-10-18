import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const mockDiscussions = [
  {
    id: "disc-1",
    author_id: "u-author-1",
    author_name: "Priya Sharma",
    topic_id: "cybersecurity",
    title: "Zero Trust Architecture in Critical Infrastructure",
    content: "How are public sector utilities adopting micro-segmentation and least-privilege identity access in modern hybrid environments?",
    reply_count: 2,
    is_hidden: false,
    created_at: "2026-10-18T10:00:00Z",
    updated_at: "2026-10-18T10:00:00Z",
  },
  {
    id: "disc-2",
    author_id: "u-author-2",
    author_name: "Aarav Patel",
    topic_id: "post-quantum-cryptography",
    title: "NIST FIPS 203 ML-KEM Migration Roadmaps",
    content: "What are the biggest latency considerations when migrating from ECDH secp256r1 to ML-KEM-768 for TLS 1.3 key exchange?",
    reply_count: 0,
    is_hidden: false,
    created_at: "2026-10-18T11:00:00Z",
    updated_at: "2026-10-18T11:00:00Z",
  },
];

const mockReplies = [
  {
    id: "rep-1",
    discussion_id: "disc-1",
    author_id: "u-reply-1",
    author_name: "Kavita Rao",
    content: "The primary challenge is legacy OT protocols like Modbus that lack native cryptographic handshake capabilities.",
    is_hidden: false,
    created_at: "2026-10-18T10:30:00Z",
    updated_at: "2026-10-18T10:30:00Z",
  },
  {
    id: "rep-2",
    discussion_id: "disc-1",
    author_id: "u-author-1",
    author_name: "Priya Sharma",
    content: "Agreed, gateway-level TLS termination has been our recommended interim mitigation.",
    is_hidden: false,
    created_at: "2026-10-18T10:45:00Z",
    updated_at: "2026-10-18T10:45:00Z",
  },
];

let currentUser: any = null;

const mockDatabaseFrom = vi.fn((table: string) => {
  if (table === "community_discussions") {
    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn((records: any[]) => ({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "disc-new-999",
              ...records[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      })),
      update: vi.fn((updates: any) => ({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                ...mockDiscussions[0],
                ...updates,
              },
              error: null,
            }),
          }),
        }),
      })),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      eq: vi.fn((col: string, val: string) => {
        if (col === "id") {
          const match = mockDiscussions.find((d) => d.id === val);
          return {
            single: vi.fn().mockResolvedValue({ data: match || null, error: null }),
          };
        }
        if (col === "topic_id") {
          const filtered = mockDiscussions.filter((d) => d.topic_id === val);
          return {
            ilike: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue({ data: filtered, error: null, count: filtered.length }),
          };
        }
        return {
          range: vi.fn().mockResolvedValue({ data: mockDiscussions, error: null, count: mockDiscussions.length }),
        };
      }),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: mockDiscussions,
        error: null,
        count: mockDiscussions.length,
      }),
    };
  }

  if (table === "community_replies") {
    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn((records: any[]) => ({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "rep-new-888",
              ...records[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      })),
      update: vi.fn((updates: any) => ({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                ...mockReplies[0],
                ...updates,
              },
              error: null,
            }),
          }),
        }),
      })),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      eq: vi.fn((_col: string, val: string) => ({
        order: vi.fn().mockResolvedValue({
          data: mockReplies.filter((r) => r.discussion_id === val),
          error: null,
        }),
      })),
      order: vi.fn().mockReturnThis(),
    };
  }

  if (table === "community_reports") {
    return {
      insert: vi.fn(() => ({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "rep-report-1" },
            error: null,
          }),
        }),
      })),
    };
  }

  // Fallback for user_roles, learner_profiles, etc.
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
});

vi.mock("../api/insforge", () => ({
  isInsForgeConfigured: vi.fn(() => true),
  getInsForgeClient: vi.fn(() => ({
    auth: {
      getCurrentUser: vi.fn().mockImplementation(() =>
        Promise.resolve({ data: { user: currentUser }, error: null }),
      ),
      onAuthStateChange: vi.fn(() => () => {}),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerificationEmail: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    database: {
      from: mockDatabaseFrom,
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

describe("Global Learning Community Integration Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = null;
  });

  it("renders community page for anonymous visitors with topics and discussions feed", async () => {
    renderAt("/community");

    expect(
      await screen.findByRole("heading", { name: /Collaborative Engineering Forum/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign in to post/i })).toBeInTheDocument();

    // Verify topic filter rooms are rendered
    expect(screen.getByRole("button", { name: "All Topics" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cybersecurity" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Post-Quantum Cryptography" })).toBeInTheDocument();

    // Verify discussions are shown
    expect(
      await screen.findByText(/Zero Trust Architecture in Critical Infrastructure/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/NIST FIPS 203 ML-KEM Migration Roadmaps/i),
    ).toBeInTheDocument();
  });

  it("filters discussions when selecting a topic room", async () => {
    const user = userEvent.setup();
    renderAt("/community");

    expect(
      await screen.findByText(/Zero Trust Architecture in Critical Infrastructure/i),
    ).toBeInTheDocument();

    // Click on Post-Quantum Cryptography room
    await user.click(screen.getByRole("button", { name: "Post-Quantum Cryptography" }));

    await waitFor(() => {
      expect(
        screen.getByText(/Room: Post-Quantum Cryptography/i),
      ).toBeInTheDocument();
    });
  });

  it("allows authenticated learners to open composer and post a new discussion", async () => {
    const user = userEvent.setup();
    currentUser = {
      id: "u-author-1",
      email: "priya@example.com",
      displayName: "Priya Sharma",
      emailVerified: true,
    };

    renderAt("/community");

    const startBtn = await screen.findByRole("button", { name: /\+ Start Discussion/i });
    expect(startBtn).toBeInTheDocument();

    await user.click(startBtn);

    // Composer dialog appears
    expect(
      await screen.findByRole("heading", { name: /Start a discussion/i }),
    ).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Discussion title/i);
    const contentInput = screen.getByLabelText(/^Content/i);

    await user.type(titleInput, "Evaluating Falcon and Dilithium in IoT");
    await user.type(
      contentInput,
      "What memory constraints are most significant when verifying SLH-DSA signatures on constrained ARM Cortex-M4 microcontrollers?",
    );

    await user.click(screen.getByRole("button", { name: "Post discussion" }));

    // Discussion should be added
    expect(
      await screen.findByText("Evaluating Falcon and Dilithium in IoT"),
    ).toBeInTheDocument();
  });

  it("enforces validation limits in discussion composer", async () => {
    const user = userEvent.setup();
    currentUser = {
      id: "u-author-1",
      email: "priya@example.com",
      displayName: "Priya Sharma",
      emailVerified: true,
    };

    renderAt("/community");

    const startBtn = await screen.findByRole("button", { name: /\+ Start Discussion/i });
    await user.click(startBtn);

    const titleInput = screen.getByLabelText(/Discussion title/i);
    const contentInput = screen.getByLabelText(/^Content/i);

    // Too short title (< 3 chars)
    await user.type(titleInput, "ab");
    await user.type(contentInput, "Sufficiently long description over 10 chars");
    await user.click(screen.getByRole("button", { name: "Post discussion" }));

    expect(
      await screen.findByText(/Discussion title must be at least 3 characters long\./i),
    ).toBeInTheDocument();
  });

  it("opens discussion detail page and displays replies in chronological order", async () => {
    renderAt("/community/discussions/disc-1");

    expect(
      await screen.findByRole("heading", { name: "Zero Trust Architecture in Critical Infrastructure" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Replies \(2\)/i)).toBeInTheDocument();

    expect(
      screen.getByText(/The primary challenge is legacy OT protocols/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Agreed, gateway-level TLS termination/i),
    ).toBeInTheDocument();

    // Anonymous visitor sees sign-in prompt
    expect(screen.getByText(/Sign in to reply/i)).toBeInTheDocument();
  });

  it("allows authenticated user to submit a reply", async () => {
    const user = userEvent.setup();
    currentUser = {
      id: "u-reply-author",
      email: "learner@example.com",
      displayName: "Kiran",
      emailVerified: true,
    };

    renderAt("/community/discussions/disc-1");

    expect(
      await screen.findByRole("heading", { name: "Zero Trust Architecture in Critical Infrastructure" }),
    ).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Share a thoughtful response/i);
    await user.type(
      textarea,
      "We implemented zero trust network access (ZTNA) with mTLS identity certificates for edge gateways.",
    );

    await user.click(screen.getByRole("button", { name: "Post reply" }));

    expect(
      await screen.findByText(
        "We implemented zero trust network access (ZTNA) with mTLS identity certificates for edge gateways.",
      ),
    ).toBeInTheDocument();
  });

  it("allows author to delete discussion with confirmation dialog", async () => {
    const user = userEvent.setup();
    currentUser = {
      id: "u-author-1",
      email: "priya@example.com",
      displayName: "Priya Sharma",
      emailVerified: true,
    };

    renderAt("/community/discussions/disc-1");

    const deleteBtn = await screen.findByRole("button", { name: "Delete discussion" });
    await user.click(deleteBtn);

    // Modal confirmation dialog
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete this discussion and all its replies\?/i),
    ).toBeInTheDocument();

    // Cancel deletion
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("allows user to report discussion with reason", async () => {
    const user = userEvent.setup();
    currentUser = {
      id: "u-reporter-99",
      email: "reporter@example.com",
      displayName: "Deepak",
      emailVerified: true,
    };

    renderAt("/community/discussions/disc-1");

    const reportBtn = await screen.findByRole("button", { name: "Report discussion" });
    await user.click(reportBtn);

    // Modal report dialog
    expect(screen.getByRole("heading", { name: /Report Discussion/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit report" }));

    expect(
      await screen.findByText(/Your report has been submitted for moderation review/i),
    ).toBeInTheDocument();
  });
});
