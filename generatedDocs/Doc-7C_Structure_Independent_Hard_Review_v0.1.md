# Doc-7C — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7C_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · conformance to frozen `Doc-7A`/`Doc-7B` |
| Verdict | **NOT YET FREEZE-READY** — 1 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Structure Patch → short closure check → Structure Freeze Audit |

---

## Anchors verified CORRECT

- SR3 active-org contracts (`Iv-Active-Organization` server-validated `Doc-4A §5.3`/`Doc-5A §7`; `get_active_context`/`list_my_organizations`/`switch_active_organization` `Doc-5C §C8`) — CORRECT.
- SR4 stack (Supabase Auth authn-only — CLAUDE.md §2; `src/server/` auth/context/authz/guards — `REPOSITORY_STRUCTURE.md` 214–218) — CORRECT.
- SR6 notification center **defined in Doc-7C** composing Doc-7B primitives — conforms to frozen `Doc-7A` allocation table + `Doc-7B BR5`. CORRECT.
- SR5 envelope/error/pagination/idempotency anchors (`Doc-5A §5.6/§6.2/§8`; `Doc-7A §5.6`) + wired-only (`Doc-7A §3.7`) — CORRECT.
- SR3 Hybrid surface-set + Admin no-org (`Doc-7A §4.2/§4.4`) — CORRECT.

0 BLOCKER. The shell spine is faithful. One security-load-bearing ambiguity + three refinements + one nit.

### MAJOR-1 — SR5 does not state the typed API-client is **server-side-only**
SR5 says "the client attaches the `Iv-Active-Organization` header and a stable idempotency key." Read literally, this could place the API-client (and credentials) in the **browser**, which would contradict `Doc-7A §3.3/§3.4` (RSC read path / server-actions write path) and §3.7, and would be a security defect (browser holding service credentials / calling Doc-5 contracts directly, where the active-org header could be tampered).
**Required fix:** SR5 state explicitly that the **typed Doc-5 API-client executes in the Next.js server layer** (Server Components for reads, server actions / route handlers for writes); the **browser never invokes a Doc-5 contract directly, holds no service credential, and never sets the `Iv-Active-Organization` header itself** — the server attaches the **server-validated** context (SR3). Client Components trigger server actions; they do not call Doc-5.

### MINOR-1 — SR2 route-group topology omits the unauthenticated auth-entry area
SR2 maps an "anonymous (Public) group" and an "authenticated group," but **auth-entry routes** (login / signup / password-recovery — part of Doc-7E's auth flows) are **unauthenticated yet not Public-marketplace** — you cannot hold a session while logging in.
**Required fix:** SR2 add a third unauthenticated area — the **auth-entry routes** (login/signup/recovery) — distinct from both the Public-marketplace group and the session-gated authenticated group. (Doc-7E authors the screens; Doc-7C owns the route-group placement.)

### MINOR-2 — SR9 marks `CHK-7-040` N/A while the shell defines a non-disclosure-bound notification center
SR9 marks `CHK-7-040` (byte-equivalence non-disclosure) N/A as "per-surface," but SR6's **notification center is defined here and is non-disclosure-bound** (`Doc-7A §8` — it must never surface an excluded/protected signal). The shell therefore carries a real `CHK-7-040` obligation for the notification center.
**Required fix:** SR9 move `CHK-7-040` to **APPLIES (scoped to the notification center the shell defines)**; per-surface byte-equivalence for the surfaces' own views remains theirs.

### MINOR-3 — SR8 "contract-mediated Storage path" risks implying blobs flow through contracts
SR8 says file upload/download is "contract-mediated." Blobs must **not** flow through the DB/API (`Doc-2 §9` — no blobs; the API carries only references). The standard realization: the blob goes **directly to Supabase Storage** (e.g. via a signed-URL grant the contract issues), and the **contract carries only the `file_ref`**, never the binary.
**Required fix:** SR8 clarify — the **blob transfers directly to/from Supabase Storage** (signed-URL or equivalent grant); the wired contract carries the **`file_ref` only, never the binary** (`Doc-2 §9`; `Doc-7A R12`).

### NITPICK-1 — `SR` prefix vs the `SR-1` finding-id used elsewhere
The R-set prefix `SR1…SR10` (no hyphen) is distinct from the hyphenated finding-id `SR-1` seen in some Doc-5 reviews, but the resemblance invites confusion.
**Required fix:** note in SR1 that `SRn` (no hyphen) are Doc-7C realization decisions, distinct from any `SR-n` review finding id — or adopt an unambiguous prefix.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MAJOR-1 API-client server-side-only | MAJOR | Structure Patch — state server-side execution |
| MINOR-1 auth-entry unauthenticated area | MINOR | Structure Patch — add to SR2 |
| MINOR-2 CHK-7-040 applies to notification center | MINOR | Structure Patch — SR9 reclassify |
| MINOR-3 SR8 blob-direct-to-Storage | MINOR | Structure Patch — clarify file_ref-only |
| NITPICK-1 SR prefix note | NIT | Structure Patch — note |

**Gate:** freeze only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 1 MAJOR + 3 MINOR open → **Structure Patch required**, then short closure check, then Structure Freeze Audit.

*End of Doc-7C Structure Independent Hard Review. Nothing coined; no frozen document edited. The MAJOR is a security-load-bearing realization defect (the data layer must be server-side; the browser never calls Doc-5 directly).*
