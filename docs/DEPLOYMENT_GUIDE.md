# QuantumShield India — Production Deployment Guide

**Version:** 1.0.0  
**Target Environment:** Production Readiness (Phase 6)  
**Applicability:** Cloud / Static Hosting + Containerized or Serverless Backend + InsForge BaaS

---

## 1. Required Environment Variables & Secrets Separation

QuantumShield India enforces strict separation between public client variables and confidential server-only secrets.

### Frontend Environment Variables (`frontend/.env` or Host Environment)

These variables are bundled at build time via Vite (`import.meta.env`) and are **publicly readable in client web browsers**.

| Variable | Required | Scope | Description & Guidelines |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Optional | Browser Client | Base URL of the FastAPI backend (e.g. `https://api.quantumshield.in`). If frontend and backend share the same domain (e.g. via reverse proxy at `/api/`), this can be left blank. |
| `VITE_INSFORGE_BASE_URL` | **Yes** | Browser Client | The public URL of the InsForge project (e.g. `https://qmy8ne8b.us-east.insforge.app`). |
| `VITE_INSFORGE_ANON_KEY` | **Yes** | Browser Client | The public anonymous key starting with `anon_...`. Governed strictly by PostgreSQL Row-Level Security (RLS). |

> [!CAUTION]
> **NEVER** set `VITE_INSFORGE_ANON_KEY` or any `VITE_*` variable to the InsForge administrative key (`ik_...`), database passwords, or private service tokens. Client bundles can be inspected by anyone using browser developer tools.

### Backend Environment Variables (`backend/.env` or Host Environment)

These variables are read exclusively by the Python process runtime.

| Variable | Required | Scope | Description & Guidelines |
| :--- | :---: | :--- | :--- |
| `CORS_ORIGINS` | **Yes** | Server Runtime | Comma-separated list of permitted production frontend browser origins (e.g. `https://quantumshield.in,https://www.quantumshield.in`). Wildcards (`*`) are strictly prohibited and will be rejected at startup. |
| `PORT` | Optional | Server Runtime | Port for Uvicorn to bind (defaults to `8000` or assigned by platform like Cloud Run / Render). |

### Infrastructure / Administrative Secrets (Server-Side Only)

| Secret | Scope | Storage Location | Purpose |
| :--- | :--- | :--- | :--- |
| InsForge Admin API Key (`ik_...`) | CLI / CI/CD pipeline | `.insforge/project.json` or CI Secrets | Used only for schema migrations and administrative database maintenance. Never deployed to production web hosts or client environments. |

---

## 2. Frontend Build & Hosting Requirements

### Build Specifications
- **Node.js Runtime:** 20.x or 22.x LTS
- **Build Tool:** Vite 8.x + TypeScript 5.8+ + Tailwind CSS v4
- **Build Command:** `npm run build` (runs `tsc -b && vite build`)
- **Output Directory:** `frontend/dist/`

### Hosting Compatibility Options

#### Option A: Managed Static Platforms (Vercel, Netlify, Cloudflare Pages)
- **Vercel:** Configuration already provided in [frontend/vercel.json](file:///c:/Users/chvna/OneDrive/Desktop/Projects/QuantaIndia/frontend/vercel.json).
- **Netlify / Cloudflare Pages:** SPA redirect rule already provided in [frontend/public/_redirects](file:///c:/Users/chvna/OneDrive/Desktop/Projects/QuantaIndia/frontend/public/_redirects) (automatically copied to `dist/_redirects`).

#### Option B: Self-Hosted Static Server (Nginx)
When self-hosting `frontend/dist` via Nginx, ensure SPA route fallback is enabled:
```nginx
server {
    listen 80;
    server_name quantumshield.in;
    root /var/www/quantumshield/dist;
    index index.html;

    # Static assets with long-term cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA Fallback: route all non-file requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy backend health check (optional same-origin setup)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 3. Backend Hosting & Startup Requirements

### Runtime Specifications
- **Python Runtime:** 3.12+
- **Framework:** FastAPI 0.143+
- **ASGI Server:** Uvicorn 0.54+
- **Dependencies:** Pinned in [backend/requirements.txt](file:///c:/Users/chvna/OneDrive/Desktop/Projects/QuantaIndia/backend/requirements.txt). Install via `pip install -r requirements.txt`.

### Production Startup Command

```bash
# Standard Production Multi-Worker Startup
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --proxy-headers --forwarded-allow-ips='*'
```

### Systemd Service Configuration (for Linux VMs)
```ini
[Unit]
Description=QuantumShield India FastAPI Service
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/quantumshield/backend
Environment="PATH=/opt/quantumshield/backend/.venv/bin"
EnvironmentFile=/opt/quantumshield/backend/.env
ExecStart=/opt/quantumshield/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Containerized Deployment (Dockerfile snippet)
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

---

## 4. InsForge Authentication, Origins & Redirect Configuration

1. **Dashboard Configuration:**
   - Log in to your InsForge Project Console (`https://<project-id>.insforge.app`).
   - Navigate to **Settings → Security & CORS**.
   - Add your production domain(s) to **Allowed Web Origins** (e.g. `https://quantumshield.in`).

2. **Authentication Settings:**
   - **Email OTP Verification:** Ensure Email OTP is enabled under **Auth → Providers → Email**.
   - **Redirect URLs:** If OAuth or Magic Links are activated in the future, set **Allowed Redirect URLs** to `https://quantumshield.in/auth` and `https://quantumshield.in/dashboard`.

3. **Rate Limiting & Security:**
   - Enable brute-force protection and rate limiting on `/auth/v1/verify` and `/auth/v1/signup`.

---

## 5. Safe Database Migration Procedure & RLS Verification

### Migration Execution Sequence
Database migrations must be executed sequentially using the InsForge CLI or PostgreSQL administrative console:

```bash
# Verify connection to InsForge
npx @insforge/cli db query "SELECT version();"

# 1. Apply baseline learner data schema and RLS (profiles, progress, bookmarks, quiz results)
npx @insforge/cli db query "$(cat docs/migrations/001_learner_data.sql)"

# 2. Apply community discussions, replies, reports, and trigger functions
npx @insforge/cli db query "$(cat docs/migrations/002_community.sql)"

# 3. Apply security hardening: non-recursive definer functions & anonymous grant restriction
npx @insforge/cli db query "$(cat docs/migrations/003_security_hardening.sql)"
```

### Post-Migration Verification Queries

Execute these verification checks to confirm policies are active:

```sql
-- 1. Verify RLS is enabled on all tables:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Expected: rowsecurity = true for all 8 tables

-- 2. Verify anonymous grants:
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'anon' AND table_schema = 'public'
ORDER BY table_name, privilege_type;
-- Expected: Strictly SELECT on community_discussions and community_replies; no write privileges.

-- 3. Verify security definer functions have fixed search_path:
SELECT proname, prosecdef, proconfig
FROM pg_proc
WHERE proname IN ('is_admin', 'is_moderator_or_admin');
-- Expected: prosecdef = true, proconfig = {search_path=public}
```

---

## 6. SPA Route Fallback & API Connectivity Verification

### SPA Direct Route Loading
Ensure that when visitors directly load or refresh deep client-side routes, the server serves `index.html` (HTTP 200) instead of a 404:
- `/explore` (Lesson catalogue & search)
- `/topics` (Platform curriculum topics)
- `/simulator` (Quantum threat simulator)
- `/community` (Learner discussion forum)
- `/learning` (Authenticated learner dashboard)
- `/auth` (Sign-in and OTP verification)
- `/lessons/03-quantum-cryptography` (Deep lesson link)

### API Connectivity
The frontend detects backend availability via `/api/health`.
- If `VITE_API_BASE_URL` is set, calls target `${VITE_API_BASE_URL}/api/health`.
- If `VITE_API_BASE_URL` is blank or omitted, calls target `/api/health` on the current origin.
- The health endpoint emits `Cache-Control: no-store` and standard security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).

---

## 7. Health-Check & Smoke-Test Commands

Run these automated curl commands against your deployed endpoints:

```bash
# 1. Backend Health Check
curl -s -i https://api.quantumshield.in/api/health
# Expected:
# HTTP/1.1 200 OK
# x-content-type-options: nosniff
# x-frame-options: DENY
# cache-control: no-store, no-cache, must-revalidate
# {"status":"ok","service":"QuantumShield India"}

# 2. CORS Preflight Test
curl -s -i -X OPTIONS https://api.quantumshield.in/api/health \
  -H "Origin: https://quantumshield.in" \
  -H "Access-Control-Request-Method: GET"
# Expected:
# access-control-allow-origin: https://quantumshield.in

# 3. Disallowed Origin Rejection Test
curl -s -i -X OPTIONS https://api.quantumshield.in/api/health \
  -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: GET"
# Expected: No access-control-allow-origin header returned

# 4. Frontend SPA Fallback Test
curl -s -o /dev/null -w "%{http_code}\n" https://quantumshield.in/simulator
# Expected: 200

# 5. Lesson Asset Availability
curl -s -o /dev/null -w "%{http_code}\n" https://quantumshield.in/images/lessons/01-cybersecurity-fundamentals.webp
# Expected: 200
```

---

## 8. Rollback Procedure

If a deployment blocker or critical issue is discovered post-release:

1. **Frontend Rollback:**
   - On managed hosts (Vercel/Netlify/Cloudflare), use the dashboard or CLI to instantly redeploy the previous successful deployment (`vercel rollback` or Netlify instant rollback).
   - On static servers, swap the document root symlink back to the previous release folder.

2. **Backend Rollback:**
   - Roll back container image tag or VM code checkout to the previous verified commit.
   - Restart the backend service: `sudo systemctl restart quantumshield-backend`.

3. **Database Guardrails:**
   - Migrations `001`, `002`, and `003` are additive and backwards-compatible with existing client versions.
   - Do not drop tables or execute destructive DDL during emergency rollbacks. If a policy needs adjusting, apply a targeted `CREATE OR REPLACE FUNCTION` or policy patch.

---

## 9. Post-Deployment Verification Checklist

Before opening the platform to public users, complete this checklist:

- [ ] Frontend loads over HTTPS with a valid TLS certificate.
- [ ] Direct refresh on deep routes (`/explore`, `/simulator`, `/topics`, `/lessons/01-cybersecurity-fundamentals`) renders without 404s.
- [ ] Backend `/api/health` responds with HTTP 200, valid JSON, and security headers.
- [ ] CORS headers are present for the production origin and absent for untrusted origins.
- [ ] All six lesson illustrations load cleanly under `/images/lessons/*.webp`.
- [ ] New user registration triggers email OTP delivery.
- [ ] OTP verification successfully activates the learner profile.
- [ ] Completed lesson progress and bookmarks persist across page reloads.
- [ ] Community discussions feed renders and accepts new posts from authenticated learners.
- [ ] Anonymous users can read public discussions but cannot create posts, bookmarks, or progress records.
- [ ] Simulator at `/simulator` functions dynamically without errors.
- [ ] No administrative API keys (`ik_...`) or database passwords are visible in browser network requests or bundle sources.
