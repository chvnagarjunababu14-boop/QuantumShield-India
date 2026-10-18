# QuantumShield India

QuantumShield India is a public learning platform for cybersecurity, quantum computing, and other emerging technologies. People will be able to study structured lessons and discuss them with a global community.

Phase 2 adds the learning site on top of that foundation: a home page, an explore page with search and filters, six sample lessons, one sample quiz, and a community page that describes the planned discussion rooms. The site still calls `GET /api/health` and shows whether that service is reachable. Accounts, saved progress, the quantum-threat simulator, and live chat are not built yet.

## Technology

- Frontend: React 19, Vite, TypeScript (strict), Tailwind CSS, React Router, Vitest, React Testing Library
- Backend: Python 3.12, FastAPI, Pydantic, Uvicorn, pytest

Fonts are installed with the frontend packages. The app does not call a font host or any paid API.

## Prerequisites

- Windows PowerShell
- Node.js 24 (developed with Node.js 24.19)
- Python 3.12
- Git

If PowerShell blocks `npm.ps1`, run `npm.cmd` instead. Do not change the execution policy. Call the virtual environment with `backend\.venv\Scripts\python.exe` rather than its activation script.

## Setup

From the repository root:

```powershell
cd C:\Users\chvna\OneDrive\Desktop\Projects\QuantaIndia
```

Backend:

```powershell
py -3.12 -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Frontend:

```powershell
cd frontend
npm.cmd install
```

## Run the API

```powershell
cd C:\Users\chvna\OneDrive\Desktop\Projects\QuantaIndia\backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Health check: http://127.0.0.1:8000/api/health

Interactive docs: http://127.0.0.1:8000/docs

Stop the process with Ctrl+C.

## Run the site

In a second terminal:

```powershell
cd C:\Users\chvna\OneDrive\Desktop\Projects\QuantaIndia\frontend
npm.cmd run dev
```

Open http://127.0.0.1:5173. Start the API first if the connection panel should show Connected.

## Tests and production build

Backend, from `backend`:

```powershell
.\.venv\Scripts\python.exe -m pytest
```

Frontend, from `frontend`:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Frontend tests stub `fetch`. They do not need the API process.

## Configuration

Copy the examples when you want to override a default. Do not commit `.env` files.

`frontend/.env` (from `frontend/.env.example`):

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Vite only exposes variables that start with `VITE_`. Restart the dev server after changing this value. If it is omitted, the site uses `http://127.0.0.1:8000`.

`backend/.env` (from `backend/.env.example`):

```text
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

The API reads that file from the `backend` directory when it is present, and otherwise uses the same default. `CORS_ORIGINS` is a comma-separated list. A wildcard origin is rejected. No secrets are used in Phase 1.

## Further reading

- `docs/architecture.md` — current boundary, and the database and chat design proposed for later phases
- `design-system/quantumshield-india/MASTER.md` — visual tokens

## Known limits

- The health check only reports that the API process answered. It does not measure learning progress.
- There is no database, authentication, or deployment configuration.
- Lessons and the quiz are sample content in the frontend. They are not saved to an account.
- The quantum-threat simulator is described inside one lesson and does not run.
- The community page describes future rooms. It does not host messages.
