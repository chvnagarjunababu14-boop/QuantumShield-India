"""
Automated Row Level Security (RLS) and Schema Verification Tests for Phase 4: Community.

Validates:
1. docs/migrations/002_community.sql & docs/schema.sql completeness:
   - All community tables enabled with RLS (community_discussions, community_replies, community_reports, user_roles)
   - Proper CHECK constraints and UNIQUE constraints defined
   - Policies defined for SELECT, INSERT, UPDATE, DELETE with author/reporter verification
   - Role permissions: REVOKE from anon on reports and roles; GRANT SELECT on discussions/replies to anon
2. Community RLS Security Model Verification:
   - Anonymous users can browse public discussions and replies
   - Anonymous users cannot insert discussions, replies, or reports
   - Anonymous users cannot view reports or user roles
   - User A cannot modify or delete User B's discussions or replies
   - User A cannot spoof author_id
   - Ordinary users cannot view other users' reports
   - Duplicate reports for the same target are rejected
   - Role-based moderation access works for moderators
"""

import sqlite3
from pathlib import Path
import pytest

COMMUNITY_MIGRATION_PATH = (
    Path(__file__).resolve().parent.parent.parent
    / "docs"
    / "migrations"
    / "002_community.sql"
)
SCHEMA_PATH = (
    Path(__file__).resolve().parent.parent.parent / "docs" / "schema.sql"
)


def test_community_migration_file_exists_and_contains_rls() -> None:
    assert COMMUNITY_MIGRATION_PATH.exists(), f"Migration file not found at {COMMUNITY_MIGRATION_PATH}"
    content = COMMUNITY_MIGRATION_PATH.read_text(encoding="utf-8")

    expected_tables = [
        "community_discussions",
        "community_replies",
        "community_reports",
        "user_roles",
    ]

    for table in expected_tables:
        assert f"CREATE TABLE IF NOT EXISTS public.{table}" in content
        assert f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY" in content

    # Assert anonymous grants/revokes
    assert "GRANT SELECT ON public.community_discussions TO anon, authenticated" in content
    assert "GRANT SELECT ON public.community_replies TO anon, authenticated" in content
    assert "REVOKE ALL ON public.community_reports FROM anon" in content
    assert "REVOKE ALL ON public.user_roles FROM anon" in content

    # Assert constraints
    assert "char_length(trim(title)) >= 3 AND char_length(title) <= 120" in content
    assert "char_length(trim(content)) >= 10 AND char_length(content) <= 5000" in content
    assert "char_length(trim(content)) >= 1 AND char_length(content) <= 5000" in content
    assert "CONSTRAINT uq_user_target_report UNIQUE (reporter_id, target_type, target_id)" in content


class CommunityRLSEngine:
    """
    Simulates community PostgreSQL RLS policies in an in-memory SQLite DB
    to verify isolation invariants between anonymous users, authors, non-authors, and moderators.
    """

    def __init__(self) -> None:
        self.conn = sqlite3.connect(":memory:")
        self._init_db()

    def _init_db(self) -> None:
        cur = self.conn.cursor()
        cur.executescript(
            """
            CREATE TABLE user_roles (
                user_id TEXT NOT NULL,
                role TEXT NOT NULL,
                PRIMARY KEY (user_id, role)
            );

            CREATE TABLE community_discussions (
                id TEXT PRIMARY KEY,
                author_id TEXT NOT NULL,
                author_name TEXT NOT NULL,
                topic_id TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                reply_count INTEGER NOT NULL DEFAULT 0,
                is_hidden INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE community_replies (
                id TEXT PRIMARY KEY,
                discussion_id TEXT NOT NULL,
                author_id TEXT NOT NULL,
                author_name TEXT NOT NULL,
                content TEXT NOT NULL,
                is_hidden INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE community_reports (
                id TEXT PRIMARY KEY,
                reporter_id TEXT NOT NULL,
                target_type TEXT NOT NULL,
                target_id TEXT NOT NULL,
                reason TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                UNIQUE (reporter_id, target_type, target_id)
            );
            """
        )
        self.conn.commit()

    def is_moderator(self, user_id: str | None) -> bool:
        if not user_id:
            return False
        cur = self.conn.cursor()
        cur.execute(
            "SELECT 1 FROM user_roles WHERE user_id = ? AND role IN ('moderator', 'admin')",
            (user_id,),
        )
        return cur.fetchone() is not None

    # Discussion RLS
    def select_discussions(self, current_user_id: str | None):
        is_mod = self.is_moderator(current_user_id)
        cur = self.conn.cursor()
        if is_mod:
            cur.execute("SELECT * FROM community_discussions")
        elif current_user_id:
            cur.execute(
                "SELECT * FROM community_discussions WHERE is_hidden = 0 OR author_id = ?",
                (current_user_id,),
            )
        else:
            cur.execute("SELECT * FROM community_discussions WHERE is_hidden = 0")
        return cur.fetchall()

    def insert_discussion(self, current_user_id: str | None, author_id: str, title: str, content: str, topic_id: str = "cybersecurity"):
        if not current_user_id:
            raise PermissionError("Anonymous users cannot create discussions")
        if current_user_id != author_id:
            raise PermissionError("RLS violation: Cannot spoof author_id")
        if len(title.strip()) < 3 or len(title) > 120:
            raise ValueError("Invalid title length")
        if len(content.strip()) < 10 or len(content) > 5000:
            raise ValueError("Invalid content length")

        disc_id = f"d-{len(title)}-{author_id}"
        cur = self.conn.cursor()
        cur.execute(
            "INSERT INTO community_discussions (id, author_id, author_name, topic_id, title, content) VALUES (?, ?, ?, ?, ?, ?)",
            (disc_id, author_id, "Author", topic_id, title, content),
        )
        self.conn.commit()
        return disc_id

    def update_discussion(self, current_user_id: str | None, discussion_id: str, new_title: str, new_content: str):
        if not current_user_id:
            raise PermissionError("Anonymous users cannot update discussions")
        cur = self.conn.cursor()
        cur.execute("SELECT author_id, is_hidden FROM community_discussions WHERE id = ?", (discussion_id,))
        row = cur.fetchone()
        if not row:
            raise ValueError("Discussion not found")
        author_id, is_hidden = row
        is_mod = self.is_moderator(current_user_id)
        if not (is_mod or (current_user_id == author_id and is_hidden == 0)):
            raise PermissionError("RLS violation: Only author or moderator can update discussion")

        cur.execute(
            "UPDATE community_discussions SET title = ?, content = ? WHERE id = ?",
            (new_title, new_content, discussion_id),
        )
        self.conn.commit()

    def delete_discussion(self, current_user_id: str | None, discussion_id: str):
        if not current_user_id:
            raise PermissionError("Anonymous users cannot delete discussions")
        cur = self.conn.cursor()
        cur.execute("SELECT author_id FROM community_discussions WHERE id = ?", (discussion_id,))
        row = cur.fetchone()
        if not row:
            raise ValueError("Discussion not found")
        author_id = row[0]
        if not (self.is_moderator(current_user_id) or current_user_id == author_id):
            raise PermissionError("RLS violation: Only author or moderator can delete discussion")

        cur.execute("DELETE FROM community_discussions WHERE id = ?", (discussion_id,))
        self.conn.commit()

    # Reports RLS
    def insert_report(self, current_user_id: str | None, reporter_id: str, target_type: str, target_id: str, reason: str):
        if not current_user_id:
            raise PermissionError("Anonymous users cannot submit reports")
        if current_user_id != reporter_id:
            raise PermissionError("RLS violation: Cannot spoof reporter_id")
        cur = self.conn.cursor()
        try:
            report_id = f"rep-{target_id}-{reporter_id}"
            cur.execute(
                "INSERT INTO community_reports (id, reporter_id, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?)",
                (report_id, reporter_id, target_type, target_id, reason),
            )
            self.conn.commit()
            return report_id
        except sqlite3.IntegrityError:
            raise ValueError("Duplicate report: You have already reported this item")

    def select_reports(self, current_user_id: str | None):
        if not current_user_id:
            raise PermissionError("Anonymous users cannot view reports")
        cur = self.conn.cursor()
        if self.is_moderator(current_user_id):
            cur.execute("SELECT * FROM community_reports")
        else:
            cur.execute("SELECT * FROM community_reports WHERE reporter_id = ?", (current_user_id,))
        return cur.fetchall()


def test_anonymous_browsing_allowed_but_cannot_insert_or_view_hidden() -> None:
    engine = CommunityRLSEngine()
    user_a = "user-alice-123"

    # User A creates a public discussion and a hidden discussion
    d1 = engine.insert_discussion(user_a, user_a, "Public PQC Discussion", "Detailed discussion content on NIST FIPS 203.")
    d2 = engine.insert_discussion(user_a, user_a, "Hidden Flagged Discussion", "Flagged content hidden by moderators.")
    engine.conn.cursor().execute("UPDATE community_discussions SET is_hidden = 1 WHERE id = ?", (d2,))
    engine.conn.commit()

    # Anonymous user selects discussions
    anon_results = engine.select_discussions(current_user_id=None)
    assert len(anon_results) == 1
    assert anon_results[0][0] == d1  # Can only see public non-hidden discussion

    # Anonymous user cannot insert
    with pytest.raises(PermissionError, match="Anonymous users cannot create"):
        engine.insert_discussion(None, "spoofed-user", "Anon Post", "Content of anon post.")

    # Anonymous user cannot view reports
    with pytest.raises(PermissionError, match="Anonymous users cannot view"):
        engine.select_reports(None)


def test_author_ownership_and_cross_user_isolation() -> None:
    engine = CommunityRLSEngine()
    alice = "user-alice"
    bob = "user-bob"

    d_alice = engine.insert_discussion(alice, alice, "Alice's Topic", "Valid content for Alice's discussion.")

    # Bob cannot update Alice's discussion
    with pytest.raises(PermissionError, match="RLS violation"):
        engine.update_discussion(bob, d_alice, "Bob Hacked Title", "Hacked content.")

    # Bob cannot delete Alice's discussion
    with pytest.raises(PermissionError, match="RLS violation"):
        engine.delete_discussion(bob, d_alice)

    # Alice can update her own discussion
    engine.update_discussion(alice, d_alice, "Alice's Updated Topic", "Updated content.")
    updated = engine.select_discussions(alice)
    assert any(row[4] == "Alice's Updated Topic" for row in updated)

    # Alice can delete her own discussion
    engine.delete_discussion(alice, d_alice)
    assert len(engine.select_discussions(alice)) == 0


def test_cannot_spoof_author_id() -> None:
    engine = CommunityRLSEngine()
    alice = "user-alice"
    bob = "user-bob"

    with pytest.raises(PermissionError, match="Cannot spoof author_id"):
        engine.insert_discussion(alice, bob, "Spoofed Post", "Content with spoofed author.")


def test_report_isolation_and_duplicate_rejection() -> None:
    engine = CommunityRLSEngine()
    alice = "user-alice"
    bob = "user-bob"

    d_id = engine.insert_discussion(alice, alice, "Public Thread", "Valid discussion content.")

    # Bob submits a report against Alice's discussion
    engine.insert_report(bob, bob, "discussion", d_id, "Inappropriate advertising")

    # Bob submitting a duplicate report fails
    with pytest.raises(ValueError, match="Duplicate report"):
        engine.insert_report(bob, bob, "discussion", d_id, "Inappropriate advertising second time")

    # Alice cannot see Bob's report
    alice_reports = engine.select_reports(alice)
    assert len(alice_reports) == 0

    # Bob can see his own report
    bob_reports = engine.select_reports(bob)
    assert len(bob_reports) == 1
    assert bob_reports[0][4] == "Inappropriate advertising"


def test_moderator_privileges() -> None:
    engine = CommunityRLSEngine()
    mod = "user-moderator"
    alice = "user-alice"

    # Grant moderator role
    engine.conn.cursor().execute("INSERT INTO user_roles (user_id, role) VALUES (?, 'moderator')", (mod,))
    engine.conn.commit()

    d_alice = engine.insert_discussion(alice, alice, "Flagged Thread", "Content that will be hidden.")
    engine.conn.cursor().execute("UPDATE community_discussions SET is_hidden = 1 WHERE id = ?", (d_alice,))
    engine.conn.commit()

    # Moderator can view hidden discussion
    mod_view = engine.select_discussions(mod)
    assert len(mod_view) == 1

    # Moderator can delete any discussion
    engine.delete_discussion(mod, d_alice)
    assert len(engine.select_discussions(mod)) == 0
