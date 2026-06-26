# Doc-7C — Structure **Patch v0.1.1** (applies Independent Hard Review v0.1) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7C_Structure_Proposal_v0.1.md` |
| Applies | `Doc-7C_Structure_Independent_Hard_Review_v0.1.md` (1 MAJOR + 3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Proposal v0.1 **+ this patch** = freeze-ready structure |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Structure Freeze Audit → `Doc-7C_Structure_v1.0_FROZEN` |
| Discipline | Additive; nothing coined; no frozen document edited |

---

## Changes

### C-1 — closes **MAJOR-1** (API-client server-side-only)
SR5 amended (load-bearing): the **typed Doc-5 API-client executes in the Next.js server layer** — Server Components for reads, server actions / route handlers for writes. The **browser never invokes a Doc-5 contract directly, holds no service credential, and never sets the `Iv-Active-Organization` header itself**; the server attaches the **server-validated** active-org context (SR3). **Client Components trigger server actions only; they do not call Doc-5.** This is the security realization of `Doc-7A §3.3/§3.4/§3.7` (RSC read / server-actions write / wired-only).

### C-2 — closes **MINOR-1** (auth-entry area)
SR2 amended: the route topology has **three** unauthenticated-or-gated areas — **(a) Public-marketplace group** (anonymous, Doc-7D), **(b) auth-entry routes** (login/signup/password-recovery — unauthenticated; Doc-7E authors the screens, Doc-7C owns placement), and **(c) the session-gated authenticated group** (Doc-7E–7G inside the active-org boundary) — plus the **Admin group** (no active-org). You cannot hold a session while authenticating, so auth-entry is distinct from the authenticated group.

### C-3 — closes **MINOR-2** (CHK-7-040 applies to notification center)
SR9 reclassified: `CHK-7-040` (byte-equivalence non-disclosure) **APPLIES — scoped to the notification center the shell defines** (SR6; it must never surface an excluded/protected signal — `Doc-7A §8`). Per-surface byte-equivalence for the surfaces' own views remains the surfaces' obligation (still N/A for non-shell views).

### C-4 — closes **MINOR-3** (blob-direct-to-Storage)
SR8 clarified: the **blob transfers directly to/from Supabase Storage** (via a signed-URL or equivalent grant the wired contract issues); the wired contract carries the **`file_ref` only, never the binary** (`Doc-2 §9` — no blobs through DB/API; `Doc-7A R12`). The shell/client never routes a blob through a Doc-5 contract.

### C-5 — closes **NITPICK-1** (SR prefix note)
SR1 notes: `SRn` (no hyphen) = Doc-7C Shell Realization decisions, **distinct from any `SR-n` review finding id**; the `DR-7-*` prefix remains reserved for carried dependencies.

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MAJOR-1 API-client server-side-only | MAJOR | C-1: server-layer execution; browser never calls Doc-5/holds creds/sets header | **CLOSED** — security + wired boundary explicit |
| MINOR-1 auth-entry area | MINOR | C-2: three-area topology incl. unauthenticated auth-entry | **CLOSED** |
| MINOR-2 CHK-7-040 notification center | MINOR | C-3: APPLIES scoped to the shell notification center | **CLOSED** |
| MINOR-3 blob-direct-to-Storage | MINOR | C-4: blob→Storage directly; contract carries file_ref only | **CLOSED** |
| NITPICK-1 SR prefix | NIT | C-5 | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** No new finding; no anchor regressed; nothing coined. C-1 will propagate to a content-pass §5 statement (client is server-side) and an Appendix A `CHK-7-001`/`CHK-7-010` realization note.

**Next:** Structure Freeze Audit → `Doc-7C_Structure_v1.0_FROZEN` → Doc-7C content passes (the shell + data layer), through the same loop.

*End of Doc-7C Structure Patch v0.1.1 + Short Closure Check. Effective structure = Proposal v0.1 + this patch. Additive; nothing coined; no frozen document edited.*
