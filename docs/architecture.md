# Architecture

Phase 1 is a local learning-platform foundation. The browser shows the QuantumShield India brand and reports the live result of `GET /api/health`. Nothing is persisted.

## Runtime

```text
browser (Vite, port 5173)
    │  GET /api/health
    ▼
FastAPI (Uvicorn, port 8000)
```

- The frontend calls the API through `src/api/health.ts`. React components do not build request URLs.
- The API base URL comes from `VITE_API_BASE_URL`, with a local fallback of `http://127.0.0.1:8000`.
- CORS allows the Vite origins listed in `CORS_ORIGINS`. The default is `http://localhost:5173` and `http://127.0.0.1:5173`. Wildcard origins are rejected.
- The health route has no database, cache, or third-party call.

## Repository map

```text
frontend/     React, Vite, TypeScript, Tailwind
backend/      FastAPI application and pytest suite
docs/         Architecture notes
design-system/quantumshield-india/   Visual tokens and page rules
```

## Proposed data store

Not implemented. Introduce PostgreSQL when courses or accounts need durable storage. A relational model fits the product:

- `users` — accounts that post messages and own progress
- `courses`, `chapters`, `lessons` — ordered learning content, including cybersecurity, quantum computing, post-quantum cryptography, AI, cloud, and IoT material
- `lesson_activities` — quiz or simulator references attached to a lesson
- `progress` and `bookmarks` — per-user lesson position and saved items
- `rooms`, `messages` — technology discussion rooms and their history
- `moderation_actions` — admin removals and room restrictions

SQLite is enough for a single-machine prototype. PostgreSQL is the target once more than one application process needs the same data. Do not add either database until a feature reads or writes it.

## Proposed community chat

Not implemented. When discussion rooms are built:

- Persist every accepted message in the database above.
- Deliver live updates with a WebSocket endpoint on the API, one channel per room.
- Keep posting behind an authenticated user. Phase 1 has no authentication.
- If more than one API process is running, fan out events with Redis pub/sub. A single local process does not need Redis.

The health check must stay independent of the database and of chat.

## Explicitly excluded

The security dashboard, cryptographic inventory analyzer, and enterprise readiness reports are not part of this product. Do not restore them into this codebase.
