# QuantumShield India

QuantumShield India is an educational platform for understanding quantum-related cryptographic risk and preparing for post-quantum cryptography (PQC) migration.

Phase 1 is the local foundation: a React dashboard that checks a FastAPI health endpoint. It does not analyze cryptographic assets, score readiness, or run quantum simulations.

This project is not a government service, not an official certification, and it does not guarantee quantum safety.

## Current implementation status

Implemented in Phase 1:

- Dark, responsive landing page with branding, navigation, a platform overview, and a footer.
- Planned-capability cards for Cryptographic Inventory, Quantum Threat Simulator, PQC Readiness Assessment, and Cybersecurity Awareness. These are previews only.
- `GET /api/health` and `GET /` on the API.
- A live connection panel with loading, connected, and disconnected states, plus a Retry control.
- Backend tests (pytest) and frontend tests (Vitest).

Not implemented yet: inventory upload, asset classification, risk scoring, databases, reports, accounts, threat simulation, PQC algorithms, quizzes, and external integrations.

## Technology stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Lucide React, Vitest, React Testing Library
- Backend: Python 3.12, FastAPI, Pydantic, Uvicorn, pytest, HTTPX2 (used by FastAPI's TestClient)

The landing page is one screen with in-page navigation, so React Router is not included.

## Prerequisites

- Windows with PowerShell
- Node.js 20 or newer (this project was developed with Node.js 24)
- Python 3.12 or newer
- Git

If PowerShell blocks `npm.ps1`, use `npm.cmd`. Do not change the execution policy to work around that. The same applies to virtual-environment activation scripts: call `backend\.venv\Scripts\python.exe` directly.

## Setup

From the repository root:

```powershell
cd C:\Users\chvna\OneDrive\Desktop\Projects\QuantaIndia
```

### Backend

```powershell
py -3.12 -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

### Frontend

```powershell
cd frontend
npm.cmd install
```

## Run the backend

From the `backend` directory:

```powershell
cd C:\Users\chvna\OneDrive\Desktop\Projects\QuantaIndia\backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

- Service information: http://127.0.0.1:8000/
- Health check: http://127.0.0.1:8000/api/health
- Interactive API docs: http://127.0.0.1:8000/docs

Stop the process with Ctrl+C.

## Run the frontend

In a second terminal, from the `frontend` directory:

```powershell
cd C:\Users\chvna\OneDrive\Desktop\Projects\QuantaIndia\frontend
npm.cmd run dev
```

Open http://127.0.0.1:5173 . The dashboard calls the API on port 8000. Start the backend first if you want the status panel to show Connected.

## Tests

Backend, from the `backend` directory:

```powershell
.\.venv\Scripts\python.exe -m pytest
```

Frontend, from the `frontend` directory:

```powershell
npm.cmd test
```

Frontend tests mock `fetch`. They do not need the API process or a network connection.

## Production frontend build

From the `frontend` directory:

```powershell
npm.cmd run build
```

The compiled files are written to `frontend/dist`. Preview them locally with:

```powershell
npm.cmd run preview
```

## Environment variables

Copy the examples if you want to override the defaults. Do not commit `.env` files.

Frontend (`frontend/.env`, copied from `frontend/.env.example`):

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Vite only exposes variables that start with `VITE_`. Restart `npm.cmd run dev` after changing this value. If the variable is omitted, the app uses `http://127.0.0.1:8000`.

Backend (process environment, documented in `backend/.env.example`):

```powershell
$env:CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
```

`CORS_ORIGINS` is a comma-separated list of allowed browser origins. The default already allows the Vite dev server. The API does not load a `.env` file by itself.

No API keys or other secrets are used in Phase 1.

## Known limitations

- The health check only reports that the API process can answer. It does not measure cryptographic readiness.
- Planned feature cards do not open tools. Those tools are not built yet.
- There is no persistence, authentication, or deployment configuration.
- Display fonts are requested from Google Fonts and fall back to Segoe UI when that request is unavailable.
- The API keeps its state in memory only for the life of the process, and Phase 1 stores no application data.
