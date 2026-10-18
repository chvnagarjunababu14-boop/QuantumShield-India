# QuantumShield India — Architecture & Production Specification

QuantumShield India is a national educational platform and collaborative engineering community dedicated to advancing cybersecurity, quantum computing, post-quantum cryptography (PQC), artificial intelligence, cloud infrastructure, and IoT security.

---

## 1. Runtime & System Topography

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                Client Browser                                    │
│  React 19 + TypeScript + Vite + Tailwind CSS v4 + Lexend / Source Sans 3 Fonts   │
└──────────────────────┬───────────────────────────────────┬───────────────────────┘
                       │                                   │
                       │ GET /api/health                   │ InsForge SDK (Auth, PostgREST)
                       ▼                                   ▼
          ┌─────────────────────────┐         ┌─────────────────────────────────┐
          │  FastAPI Health Engine  │         │  InsForge BaaS (PostgreSQL 16)  │
          │  Python 3.12 / Uvicorn  │         │  - Row-Level Security (RLS)     │
          │  Port 8000 (CORS Gated) │         │  - Email OTP Verification       │
          └─────────────────────────┘         │  - Security Definer Auth RPCs   │
                                              └─────────────────────────────────┘
```

- **Frontend Client**: SPA hosted on static CDN (Vercel, Netlify, Cloudflare Pages, or static Nginx) with direct-URL routing rules (`_redirects` / `vercel.json`).
- **Backend API**: Stateless FastAPI service providing decoupled service health status (`/api/health`) without database dependencies.
- **Database & Authentication**: InsForge-managed PostgreSQL with built-in email OTP authentication and Row-Level Security (RLS).

---

## 2. Security Architecture & Access Control

### Key Separation & Safe Environment Configuration
- **Public Client Key (`VITE_INSFORGE_ANON_KEY`)**: Starts with `anon_...`. Used strictly in browser environments. Enforces PostgreSQL Row-Level Security policies.
- **Project Admin Key (`API_KEY`)**: Starts with `ik_...`. Kept confidential in `.insforge/project.json` or secure backend runtime environments. Never exposed in frontend builds or client environment files.

### Row-Level Security (RLS) Model
All 8 public tables enforce Row-Level Security:

1. **`learner_profiles`**: `REVOKE ALL FROM anon`. Authenticated learners can only read, insert, and update their own profile (`auth.uid() = user_id`).
2. **`lesson_progress`**: `REVOKE ALL FROM anon`. Authenticated learners can only view, record, or clear their own completion records.
3. **`bookmarks`**: `REVOKE ALL FROM anon`. Authenticated learners can only view, add, or delete their own bookmarks.
4. **`quiz_results`**: `REVOKE ALL FROM anon`. Authenticated learners can only view and submit their own quiz scores.
5. **`community_discussions`**: `GRANT SELECT TO anon, authenticated`. Anyone can read unhidden discussions (`is_hidden = false`). Only authenticated authors can insert, edit, or delete their own posts. Deletions and edits by moderators are permitted via `public.is_moderator_or_admin()`.
6. **`community_replies`**: `GRANT SELECT TO anon, authenticated`. Public chronological viewing for active replies; author-only update/delete with moderator oversight.
7. **`community_reports`**: `REVOKE ALL FROM anon`. Reporters can view only their own submitted reports; moderators can view and update pending reports.
8. **`user_roles`**: `REVOKE ALL FROM anon`. Authenticated users can read only their own assigned roles or administrators can view all roles via recursion-free `public.is_admin()`.

### Security Definer Helpers
To prevent PostgreSQL RLS infinite recursion and allow unauthenticated public views without exposing administrative tables, the database utilizes:
- `public.is_moderator_or_admin()`: Resolves whether `auth.uid()` has the `moderator` or `admin` role without recursive table scans.
- `public.is_admin()`: Resolves whether `auth.uid()` has administrative privileges.

---

## 3. Database Migration Sequence

For a clean deployment in any new environment, execute migrations in sequence:

```bash
# 1. Phase 3: Learner profiles, progress, bookmarks, quiz results
npx @insforge/cli db import docs/migrations/001_learner_data.sql

# 2. Phase 4: Community discussions, replies, reports, roles, and reply count triggers
npx @insforge/cli db import docs/migrations/002_community.sql

# 3. Phase 5: Security hardening, recursion-free security definer functions, and public permissions
npx @insforge/cli db import docs/migrations/003_security_hardening.sql
```

---

## 4. Administrative Setup & Moderator Provisioning

Moderator and administrator roles are strictly provisioned server-side via trusted database commands:

```sql
-- Grant moderator privileges to a verified learner:
INSERT INTO public.user_roles (user_id, role)
VALUES ('<target-user-uuid>', 'moderator')
ON CONFLICT (user_id, role) DO NOTHING;

-- Grant administrator privileges:
INSERT INTO public.user_roles (user_id, role)
VALUES ('<target-user-uuid>', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 5. Environment Variables

### Frontend (`frontend/.env` or deployment settings)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of FastAPI health service | `https://api.quantumshield.in` |
| `VITE_INSFORGE_BASE_URL` | Base URL of InsForge project | `https://qmy8ne8b.us-east.insforge.app` |
| `VITE_INSFORGE_ANON_KEY` | Public anonymous key (**never** project admin key) | `anon_7560327889...` |

### Backend (`backend/.env` or deployment settings)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `https://quantumshield.in,https://app.quantumshield.in` |
