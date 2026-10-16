# Architecture

Phase 1 is a local dashboard and a small HTTP API. The browser never assumes the API is healthy. It asks `GET /api/health` and renders the result.

## Frontend-to-backend communication

```text
Browser (Vite, port 5173)
  └─ fetch GET {VITE_API_BASE_URL}/api/health
       └─ FastAPI (Uvicorn, port 8000)
            └─ JSON { "status": "ok", "service": "QuantumShield India" }
```

The frontend reads the API base URL from `VITE_API_BASE_URL`. When that variable is missing, the client uses `http://127.0.0.1:8000`. The value is trimmed and a trailing slash is removed before `/api/health` is appended.

`frontend/src/services/health.ts` owns the request. UI components receive a snapshot from `useBackendHealth` and do not call `fetch` themselves. A response is treated as connected only when HTTP status is successful and the JSON body is exactly:

```json
{
  "status": "ok",
  "service": "QuantumShield India"
}
```

Network failures, non-success HTTP statuses, unreadable bodies, and any other JSON shape become a disconnected state with a short message. Stack traces are not shown. While a check is in flight the Retry control is disabled, and starting a new check aborts the previous request.

The API allows browser calls from `http://localhost:5173` and `http://127.0.0.1:5173`. Override that list with the `CORS_ORIGINS` environment variable (comma-separated origins). No secrets are required for Phase 1.

## API

| Method | Path | Success code | Body |
| --- | --- | --- | --- |
| `GET` | `/` | 200 | Service name, version, phase, and description |
| `GET` | `/api/health` | 200 | `status` and `service` |

`GET /` example:

```json
{
  "name": "QuantumShield India",
  "version": "0.1.0",
  "phase": "1",
  "description": "Quantum-safe cybersecurity awareness and cryptographic readiness platform. Phase 1 provides the application foundation and API health check."
}
```

`GET /api/health` example:

```json
{
  "status": "ok",
  "service": "QuantumShield India"
}
```

Unknown paths return FastAPI's standard 404 response. Unexpected server errors return HTTP 500 with `{"detail": "An unexpected error occurred."}` and do not include the exception text.

Interactive schema is available at `http://127.0.0.1:8000/docs` while the API process is running.

## Directory responsibilities

| Path | Responsibility |
| --- | --- |
| `frontend/src/components` | Header, hero, planned-capability cards, connection panel, footer |
| `frontend/src/pages` | Landing page composition |
| `frontend/src/services` | HTTP client for the health check |
| `frontend/src/types` | Response and UI state types |
| `frontend/src/hooks` | Health-check state, cancellation, and retry |
| `backend/app` | FastAPI application and response models |
| `backend/tests` | API contract tests using `TestClient` |
| `docs` | Architecture notes |
| `data` | Reserved for future local datasets. Empty in Phase 1 |

React Router is not used. The landing page is a single document with in-page links, because Phase 1 has no additional screens.

## How later modules should connect

Later phases should add a backend module and a matching frontend page or section, then expose a new route under `/api`. They should keep these boundaries:

- Put request and response models next to the feature that owns them.
- Call the API only through `frontend/src/services`, with types in `frontend/src/types`.
- Reuse the same base URL and error-handling approach as the health client.
- Leave `GET /api/health` as a process liveness check. Do not overload it with inventory, scoring, or simulation results.
- Keep planned cards marked as planned until the feature actually works.

Phase 1 deliberately has no database, authentication, file upload, cryptographic implementation, or external service client. Those should arrive as separate modules rather than being folded into the foundation app.
