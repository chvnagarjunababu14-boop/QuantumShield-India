<<<<<<< HEAD
# QuantumShield India

An educational cybersecurity and **post-quantum readiness** platform, built as a 24-hour hackathon MVP.

- **For individuals:** an interactive quantum threat simulator and a cybersecurity awareness quiz.
- **For organisations:** upload a CSV describing where cryptography is used, get a transparent, rule-based classification of which dependencies need quantum-risk review, and generate a printable Quantum-Safe Readiness Report.

> **Important:** QuantumShield India assesses only the CSV you provide. It is **not** a network scanner or a complete infrastructure assessment, is **not** a certified security tool, and does **not** guarantee that anything is quantum-safe. It makes no prediction of when a cryptographically relevant quantum computer will exist. All bundled sample data is fictional.

---

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4, Recharts, React Router |
| Backend  | Python 3.12, FastAPI, Pydantic v2, Uvicorn |
| Storage  | In-memory (seeded from a fictional sample CSV; nothing written to disk) |
| Tests    | pytest + FastAPI TestClient |

No registration, API keys, paid services or external network calls are required.

## Project structure

```
QuantaIndia/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app and routes
│   │   ├── risk_engine.py     # Rule-based quantum risk engine (independently testable)
│   │   ├── csv_parser.py      # Safe CSV parsing and validation
│   │   ├── models.py          # Pydantic models and input normalisation
│   │   ├── report.py          # Readiness report builder and migration checklist
│   │   ├── store.py           # Thread-safe in-memory inventory store
│   │   └── data/sample_inventory.csv   # Fictional sample inventory
│   ├── tests/                 # Engine and API tests
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/             # Dashboard, Inventory, Simulator, Quiz, Report, About
    │   ├── components/        # Layout/sidebar, UI primitives, FindingCard
    │   ├── data/quiz.ts       # Quiz questions and recommendations
    │   ├── api.ts             # Fetch-based API client
    │   └── types.ts           # Shared TypeScript types
    └── package.json
```

## Setup and running

Prerequisites: **Python 3.11+** and **Node.js 20+** (developed with Python 3.12 and Node 24).

### 1. Backend (FastAPI, port 8000)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Health check: <http://127.0.0.1:8000/api/health>
- Interactive API docs (Swagger UI): <http://127.0.0.1:8000/docs>

CORS is restricted to `http://localhost:5173` and `http://127.0.0.1:5173`. Override with a comma-separated `FRONTEND_ORIGINS` environment variable if needed.

### 2. Frontend (Vite, port 5173)

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The frontend calls the API at `http://127.0.0.1:8000` by default; to change this, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

### Production build

```powershell
cd frontend
npm run build      # type-checks and outputs to frontend/dist
npm run preview    # serves the build on http://localhost:4173 (add that origin to FRONTEND_ORIGINS)
```

### Running tests

```powershell
cd backend
.\.venv\Scripts\python -m pytest -v
```

## Pages

1. **Dashboard** - totals, dependencies requiring review, high-priority findings, indicative migration readiness, charts (algorithm status, priority, algorithm family, migration status) and top recommended actions.
2. **Cryptographic Inventory** - CSV upload (drag-and-drop), validation errors per line and column, imported records table, filterable findings with explanations, sample CSV download, restore sample.
3. **Quantum Threat Simulator** - five interactive steps: public-key crypto today, a toy period-finding walkthrough illustrating Shor's algorithm, "harvest now, decrypt later", Grover's algorithm and symmetric key sizes, and post-quantum/hybrid key exchange. Includes a conventional-versus-PQC comparison table. All computation is ordinary arithmetic on tiny numbers; no quantum computer is simulated and no real encryption is attacked.
4. **Awareness Quiz** - 12 questions on phishing, passwords, MFA, data privacy, encryption and quantum risk, with per-question explanations, per-topic scores and personalised recommendations. Kept entirely in the browser and separate from the enterprise risk score.
5. **Readiness Report** - inventory summary, recommended next actions, findings grouped by priority with reasons, and a migration planning checklist. **Print / Save as PDF** uses the browser's print dialog with a print-friendly stylesheet.
6. **About / Methodology** - what the tool is and is not, full classification rules, scoring weights, and privacy notes.

## API

All responses are JSON unless noted. Errors use the shape `{"detail": {"message": str, "errors": [{"row": int|null, "field": str|null, "message": str}]}}`.

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/health` | Service status and version. |
| GET  | `/api/dashboard` | Summary metrics, distributions, readiness, and top findings for the current inventory. |
| GET  | `/api/inventory` | Current records and their findings, plus source (`sample` or `upload`). |
| POST | `/api/inventory/upload` | `multipart/form-data` with a `file` field (CSV). Replaces the current inventory. Returns records, findings, `imported_count`, `rejected_count`, row `errors` and `warnings`. |
| POST | `/api/inventory/reset` | Restores the fictional sample inventory. |
| GET  | `/api/inventory/sample-csv` | Downloads the sample CSV (`text/csv`). |
| POST | `/api/assessment` | Body `{"records": [...]}` assesses records statelessly (nothing is stored). Empty body re-assesses the current inventory. |
| GET  | `/api/report` | Full readiness report: summary, findings grouped by priority, next actions, checklist and disclaimer. |

### Upload status codes

| Status | When |
|--------|------|
| 200 | At least one valid row imported (invalid rows are reported in `errors` and skipped). |
| 400 | Empty file. |
| 413 | File larger than 1 MB or more than 2,000 data rows. |
| 415 | Not a `.csv` file name, disallowed content type, binary content, or undecodable text. |
| 422 | Missing/duplicate required columns, header with no data rows, malformed CSV, or no valid rows. |

### Example: stateless assessment

```bash
curl -X POST http://127.0.0.1:8000/api/assessment \
  -H "Content-Type: application/json" \
  -d '{"records":[{"system_name":"Demo","algorithm":"RSA-2048","purpose":"TLS key exchange","data_sensitivity":"high","confidentiality_years":10,"business_criticality":"critical","migration_status":"not_started"}]}'
```

## CSV format

Download the sample from the Inventory page or `GET /api/inventory/sample-csv` (source: `backend/app/data/sample_inventory.csv`, 22 fictional rows across 11 fictional systems).

| Column | Required | Accepted values |
|--------|----------|-----------------|
| `system_name` | yes | Text, max 120 characters |
| `algorithm` | yes (column) | e.g. `RSA-2048`, `ECDSA-P256`, `X25519`, `AES-256-GCM`, `SHA-256`, `ML-KEM-768`. A blank value is accepted and marked **needs review**. |
| `purpose` | yes | Free text, e.g. `TLS key exchange`, `Code signing`, `Database encryption at rest` |
| `key_size` | optional | Whole number of bits, or blank |
| `data_sensitivity` | yes | `low`, `medium`, `high`, `critical` (also `public`, `internal`, `confidential`, `restricted`) |
| `confidentiality_years` | yes | Number of years (0-100); `0` if not applicable |
| `business_criticality` | yes | `low`, `medium`, `high`, `critical` |
| `migration_status` | yes | `not_started`, `planned`, `in_progress`, `completed`, `unknown` (spaces/hyphens accepted) |

Common header aliases are accepted (e.g. `System`, `Cryptographic Algorithm`, `Key Length`, `Required Confidentiality Period (years)`, `Criticality`). A UTF-8 byte-order mark is handled. Unrecognised columns are ignored with a warning.

**Do not upload passwords, private keys, credentials or real confidential data.** Only metadata about algorithm usage is needed.

## Risk methodology (summary)

The engine (`backend/app/risk_engine.py`) separates two questions:

1. **Algorithm-level quantum status** - depends only on the algorithm and key size:
   - **Quantum-vulnerable:** RSA, elliptic-curve (ECDSA/ECDH/X25519/Ed25519), finite-field DH/DSA - broken by Shor's algorithm on a sufficiently capable fault-tolerant quantum computer. RSA below 2048 bits is additionally flagged as classically weak.
   - **Reduced margin:** AES-128 or AES with unknown key size, SHA-224 - Grover gives at most a quadratic speed-up.
   - **Low concern:** AES-256, ChaCha20, SHA-256+, SHA-3, HMAC-SHA-2, bcrypt/Argon2/scrypt/PBKDF2.
   - **Classically weak:** MD5, SHA-1, DES, 3DES, RC4, Blowfish - a present-day issue, independent of quantum.
   - **Quantum-resistant design:** ML-KEM, ML-DSA, SLH-DSA, FN-DSA/Falcon, XMSS/LMS, and hybrids such as X25519MLKEM768.
   - **Needs review:** blank, unknown, proprietary or unrecognised algorithms - never automatically declared vulnerable.
2. **System-level review priority (0-100)** - base score from the algorithm status plus weights for data sensitivity, business criticality, migration status and (for encryption/key exchange) the required confidentiality period, reflecting "harvest now, decrypt later". Low-concern and quantum-resistant algorithms are capped so context alone cannot escalate them. Bands: Critical ≥ 80, High ≥ 60, Medium ≥ 40, Low ≥ 20, otherwise Informational.

Every finding includes the algorithm, purpose, algorithm family, quantum status, priority, score, explanation, reasons and a recommended action. Full weights are shown on the About / Methodology page.

**Readiness %** = share of dependencies that are either not a significant quantum concern at algorithm level or whose migration is recorded as completed. It is indicative only.

## Security measures

- Uploads are limited to `.csv` names and text content types, with a 1 MB limit (enforced on the server, pre-checked in the browser) and 2,000 rows.
- Files are decoded as text and parsed with Python's `csv` module; nothing is evaluated or executed. Control characters are stripped and field lengths are limited.
- Uploaded text is rendered by React as text (never as HTML), so markup in a CSV cannot execute.
- No secrets or API keys are in the code. CORS is limited to the local frontend origin, and only `GET`/`POST` with a `Content-Type` header are allowed.
- Data is kept only in process memory and is discarded on restart. Quiz answers never leave the browser.

## Test results

Results from the final verification run:

- **Backend unit and API tests:** 83 passed (`pytest`). They cover:
  - RSA, elliptic-curve and finite-field DH/DSA classified as quantum-vulnerable, with RSA-1024 also flagged as classically weak.
  - AES-256 and ChaCha20 as low concern; AES-128 and AES with an unknown key size as reduced margin. Symmetric algorithms are never classified as vulnerable.
  - SHA-2, SHA-3, HMAC and bcrypt assessed separately from public-key crypto; SHA-1 and MD5 as classically weak.
  - Unknown, blank and proprietary algorithms marked as needs review, never as vulnerable.
  - ML-KEM, ML-DSA and SLH-DSA as post-quantum, and X25519MLKEM768 as hybrid.
  - Purpose detection, and context changing the system priority without changing the algorithm status.
  - CSV uploads that are valid, use header aliases, include a BOM, are partially invalid, empty, header-only, missing columns, contain only invalid rows, have too many values per row, use an unsupported extension or content type, contain binary data, or are too large.
  - Markup passed through as inert text, failed uploads leaving the existing inventory unchanged, and inventory reset.
  - Stateless assessment, request validation errors, and the CORS allow/deny behaviour.
- **Frontend production build:** `npm run build` succeeds (TypeScript type-check and Vite build), with pages code-split.
- **Live checks with both servers running:**
  - The health endpoint returned 200.
  - Uploads returned the expected status codes: valid 200, malformed 422, missing columns 422, empty 400, `.txt` 415.
  - The CORS preflight from `localhost:5173` was allowed.
  - In the browser:
    - The dashboard loaded live data and rendered its charts.
    - An inventory upload through the file input imported 3 rows and reported 1 rejected row with line and column errors. An HTML/JS payload in the CSV showed as plain text and did not execute.
    - The simulator steps worked, including correct period-finding factorisations (15 = 3 × 5, 21 = 7 × 3).
    - All 12 quiz questions showed feedback, and the results page gave a score and per-topic recommendations.
    - The report rendered all four sections and the print button.

## Known limitations

- **Not a scanner:** results depend entirely on the accuracy and completeness of the uploaded CSV.
- **Heuristic rules:** algorithm detection is name-based. Composite strings (e.g. full TLS cipher-suite names) are classified by their dominant public-key component, and unusual naming may be marked as "needs review".
- **Simple scoring:** weights are deliberately transparent and untuned; organisations should adapt them to their own risk framework.
- **In-memory, single-tenant storage:** one shared inventory per backend process, lost on restart; not suitable for multi-user deployment without adding persistence and authentication.
- **Educational simulator:** the period-finding demo uses ordinary arithmetic on tiny numbers, and the growth chart is illustrative, not a time estimate.
- **Print to PDF** relies on the browser's print dialog; layout can vary slightly between browsers.
- **Optional enhancement not implemented:** a genuine ML-KEM demonstration using a maintained library (e.g. liboqs bindings) was left out of scope for this version.
=======
# quantumshield-india
>>>>>>> 5f6daeb4d4342c80d7bae4cec4fd79de6b947f22
