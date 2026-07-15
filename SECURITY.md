# Security Notes

This is a **staged learning project** run locally. This file tracks the security decisions we
make as we build, and — importantly — the things that are **intentionally not production-ready
yet** so they don't get forgotten. Security is the through-line of this project: Phase 4 exists
specifically to teach why auth and data isolation must be designed in early.

> Scope: local development only. Nothing here is hardened for public deployment yet. See
> [Harden before production](#harden-before-production).

## Current posture (in place)

| Area | What we do | Where |
|---|---|---|
| Secrets | `.env` is git-ignored; only `.env.example` with placeholder creds is committed | `.gitignore`, `backend/.env.example` |
| SQL injection | All DB access via SQLAlchemy ORM (parameterized) — no string-built SQL | `backend/app/...` |
| Input validation | Pydantic validates every request body server-side; bad input → 422, never a 500 | `backend/app/todos/schemas.py` |
| CORS | `allow_origins` pinned to the dev origin, not `*` | `backend/app/core/config.py` |
| Config | All config from env vars, never hard-coded | `backend/app/core/config.py` |

## Deliberate not-for-prod choices (learning trade-offs)

These are fine for local dev but **must change before any real deployment**:

- **Default DB credentials** are `todo` / `todo` (`docker-compose.yml`). Trivial by design; rotate + use secrets management in prod.
- **`create_all()` on startup** instead of migrations. We switch to Alembic in Phase 4 when schema changes first hurt.
- **No authentication yet.** The whole app is single-user until Phase 4 — every endpoint is currently open. This is on purpose (the spec wants us to feel the retrofit).
- **CORS `allow_credentials=True`** with a dev origin — revisit when auth + real origins exist.
- **Verbose teaching comments** in code — slimmed before the `phase-1 → main` supervisor PR.

## Per-phase security roadmap

- **Phase 1 (CRUD):** server-side validation; don't leak internals in error responses (no stack traces to clients); least-privilege DB user.
- **Phase 2 (RAG):** treat retrieved todo text as **untrusted input** — guard against **prompt injection**; instruct the model to answer only from provided context; never let retrieved content act as instructions.
- **Phase 3 (Agents):** guardrails *are* the security work — validate tool arguments, cap iterations, **require confirmation for destructive actions**, and apply **path-traversal protection / sandboxing** on any file-writing tool (an agent that writes files is a real attack surface).
- **Phase 4 (Auth & multi-tenancy):**
  - Password hashing with bcrypt/argon2 — **never** plaintext or fast hashes.
  - JWT handled correctly (signed, expiring, verified server-side).
  - **Per-user data isolation / no IDOR** — broken object-level authorization is the #1 API risk. Every todo, vector, and agent action scoped to the authenticated user.
  - Reject unauthenticated / cross-user access with 401/403.
  - Rate limiting per user.

## Harden before production

A running checklist (grows as we go):

- [ ] Replace default DB credentials; use a secrets manager (not `.env` on disk).
- [ ] Use Alembic migrations, not `create_all()`.
- [ ] Add authentication + per-user authorization on every endpoint (Phase 4).
- [ ] Lock CORS to real production origins.
- [ ] Serve over HTTPS/TLS; set secure headers.
- [ ] Ensure no secrets or PII in logs.
- [ ] Add rate limiting and request size limits.
- [ ] Dependency scanning / keep dependencies patched.
- [ ] Generic error responses to clients; detailed errors only in server logs.

## Reporting

This is a private learning repo. If you spot a security issue in the code during review, raise
it in the relevant pull request.
