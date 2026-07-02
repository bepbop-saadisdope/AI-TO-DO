# AI-Powered Todo

A staged learning build: a plain todo app that grows into a multi-user, RAG-enabled, agentic
application. See the intern spec for phase details.

**Stack:** FastAPI (backend) · React + Tailwind (frontend) · PostgreSQL + pgvector (Docker Compose).

## Status

- [ ] **Phase 1** — Plain todo app (clean layered CRUD) — *in progress*
- [ ] Phase 2 — RAG over your todos
- [ ] Phase 3 — Agents that build your day
- [ ] Phase 4 — Auth & multi-tenancy

## Branch model

- `main` — only completed, supervisor-approved phases (release/stable line).
- `phase-N` — integration branch for a phase; features land here via reviewed PRs.
- `feature/<name>` — one feature, branched off the current `phase-N`, merged in via PR.

> Setup and run instructions land with the Phase 1 `feature/scaffold-db` work.
