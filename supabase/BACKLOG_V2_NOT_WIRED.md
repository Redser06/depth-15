# Backlog: Supabase Multi-Tenant Backend (v2 — Not Wired)

> **Status: Candidate Design / Backlog Only (Not Wired to Runtime)**  
> The current production runtime for Depth 15 is client-side consensus execution with local state persistence and Firebase Hosting deployment ([https://depth-15.web.app](https://depth-15.web.app)).

The SQL migrations in this directory define the candidate PostgreSQL schema, Row-Level Security (RLS) policies, and database triggers for a future v2 multi-tenant cloud synchronization service.

### Rationale Consistency
- Per current product specification:
  - **Retire / Out**: 0 character minimum (no essay required).
  - **Re-rate / Challenge**: 15 character minimum (brief pub rationale).
- Any future migration applying this schema must enforce this relaxed constraint rather than the legacy 140-character essay requirement.
