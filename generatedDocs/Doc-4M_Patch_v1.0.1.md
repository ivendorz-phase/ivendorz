# Doc-4M Additive Patch v1.0.1 — M5 Index Correction: Organization + Membership Rows (Editorial)

> **STATUS: EXECUTED — IN FORCE.** Approved by the human owner/Architecture Board 2026-07-09
> (`ESC-IDN-4M-INDEX`, packet `governanceReviews/BOARD-PACKET-IDN-4M-INDEX_v1.0.md`; conditions:
> editorial/additive only · no semantic change · no new state names · no ownership change · index
> subordinates to frozen Doc-2 §5 — all honored). Registered in `00_AUTHORITY_MAP.md`.
> Precedent for class + mechanics: `generatedDocs/Doc-6C_Patch_v1.0.1.md`.

| Field | Value |
|---|---|
| **Patches** | `Doc-4M_FROZEN_v1.0.md` (State Machine Contracts) — FROZEN v1.0 → **v1.0.1** |
| **Class** | **Editorial index correction — additive patch.** No state, transition, workflow, business rule, ownership, or event is introduced. Rows of the M5 Transition Authority Matrix are corrected to match the canonical machines Doc-4M itself binds (Doc-2 §5.1/§5.2). No other Doc-4M section is touched. |
| **Authorized by** | Human owner/Architecture Board ruling, 2026-07-09 — `ESC-IDN-4M-INDEX` **APPROVED** (packet: `governanceReviews/BOARD-PACKET-IDN-4M-INDEX_v1.0.md`) |
| **Raised by** | RV-0150 (W2-IDN-5 Review-A) OBS-1 binding carry, 2026-07-09; builder disclosure in `governanceReviews/milestones/w2-idn-5/COMPLETION-REPORT.md` (judgment call 1) |
| **Correction procedure authority** | Doc-4M's own frozen text — :18 "On any apparent conflict with a frozen corpus source, the frozen source governs — this index is corrected, never the frozen corpus"; :34 "…the discrepancy is escalated (FLAG-AND-HALT) — this index is corrected, never the frozen corpus. The canonical state machines remain **Doc-2 §5**"; :351 "The frozen corpus governs; this index is corrected to match it, never the reverse." |
| **Frozen text** | `Doc-4M_FROZEN_v1.0.md` is NOT edited in place. This patch is the corrective overlay; on any conflict between this patch and the base M5 rows listed below, **this patch governs the row text; Doc-2 §5.1/§5.2 governs the machines** (unchanged, untouched). |

## 1. The corrections

Canonical sources, re-read verbatim for this patch (`Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md`):

- **§5.1 Organization (:469–474):** `active ──suspend [platform governance]──▶ suspended` ·
  `suspended ──reinstate──▶ active` · `active|suspended ──soft delete [Owner or admin; cascade
  §10-note]──▶ soft_deleted` · `soft_deleted ──restore [restore-conflict rule: regenerate reused
  slugs]──▶ active`. States: `active / suspended / soft_deleted` — **no pre-claim state, no
  `claimed`, no `closed`, no terminal state** (restore reopens `soft_deleted`).
- **§5.2 Membership (:480–485):** `invited ──accept──▶ pending ──verification complete──▶ active` ·
  `active ──suspend──▶ suspended ──reinstate──▶ active` · `active|suspended ──remove──▶ removed
  (terminal; audit retained)` · `invited ──expire/revoke──▶ removed`. States:
  `invited / pending / active / suspended / removed`.

### 1.1 Organization block (M5 rows :155–159)

| Base row (unedited) | Was | **Is (per this patch)** | Defect class |
|---|---|---|---|
| :155 | `per Doc-2 §5.1 (pre-claim state)` → `claimed` — User (Owner completes org claim) | **Row withdrawn.** Doc-2 §5.1 defines no pre-claim state and no `claimed` state; the claim lifecycle belongs to the Vendor Profile machine (§5.3) and "applies **only to marketplace vendor profiles**" (§5.3 guards, PATCH-02) — never to Organization | Phantom transition |
| :156 | `claimed` → `active` — System (claim verification complete) | **Row withdrawn** (same basis) | Phantom transition |
| :157 | `active` → `suspended` — Admin (compliance/payment gate) | **Unchanged** (conformant; §5.1 `suspend [platform governance]`) | — |
| :158 | `suspended` → `active` — Admin (suspension lifted) | **Unchanged** (conformant; §5.1 `reinstate`) | — |
| :159 | `active` / `suspended` → **`closed`** — User (Owner transfer + delete) / Admin | `active` / `suspended` → **`soft_deleted`** — User (Owner) / Admin (soft delete; cascade per §5.1 guards / §10 note) — Doc-2 §5.1; Doc-4C (FROZEN) | State label exists nowhere in §5.1 (canonical: `soft_deleted`) |
| *(new row)* | *(absent)* | `soft_deleted` → `active` — per Doc-2 §5.1 (restore [restore-conflict rule: regenerate reused slugs]) — Doc-2 §5.1; Doc-4C (FROZEN) | Omitted edge (§5.1 :473) |

### 1.2 Membership block (M5 rows :161–164)

| Base row (unedited) | Was | **Is (per this patch)** | Defect class |
|---|---|---|---|
| :161 | `invited` → `active` — User (invite accepted) | **Replaced by two rows:** ① `invited` → `pending` — User (invite accepted) — Doc-2 §5.2; Doc-4C (FROZEN) · ② `pending` → `active` — System (account-verification-complete signal, DC-4) — Doc-2 §5.2; Doc-4C §C6 (FROZEN) | Collapsed edge — the canonical `pending` state (:481) vanishes from the index |
| :162 | `active` → `suspended` — Admin / Owner (role gate) | **Unchanged** (conformant) | — |
| :163 | `suspended` → `active` — Admin / Owner (suspension lifted) | **Unchanged** (conformant) | — |
| :164 | `active` / `suspended` → `removed` — Owner / Admin (member removal) | **Unchanged** (conformant; terminal, audit retained) | — |
| *(new row)* | *(absent)* | `invited` → `removed` — per Doc-2 §5.2 (expire/revoke; the expiry leg is realized as the Doc-4C §C6 System invite-expiry sweep) — Doc-2 §5.2; Doc-4C §C6 (FROZEN) | Omitted edge (§5.2 :484) |

Trigger-authority cells of conformant rows are untouched. New/corrected cells that the source does
not attribute to a named actor use pointer form (`per Doc-2 §5.x (…)`) — this patch attributes
nothing the corpus does not.

## 2. What does NOT change

- **Doc-2 §5.1/§5.2 are untouched and remain the sole canonical machines** (Doc-4M :13/:34). This
  patch corrects index rows, never machines.
- **M4 State Authority Matrix is unaffected** — its Organization (:117) and Membership (:134) rows
  are already pointer-only ("per Doc-2 §5.1 / §5.2").
- Every other M5 block (Delegation Grant, Vendor Profile, RFQ, …) stands unchanged. The two sibling
  M5 divergences already registered elsewhere (`ESC-7G-LEAD-MACHINE` vendor-lead row,
  `ESC-JRN-TKT-MACHINE` support-ticket rows) are **out of scope** — each is registered as
  frozen-vs-frozen corpus-reconciliation with its own channel and its own unadjudicated
  which-source-governs question; nothing here prejudges them.
- No schema, DDL, code, contract, event, audit action, or POLICY key is affected. `W2-IDN-5`
  shipped per Doc-2 §5 verbatim (RV-0150 re-derived both matrices edge-by-edge; the collapsed
  `invited → active` edge is suite-pinned false) — **zero implementation impact**.

## 3. Effect

Doc-4M advances v1.0 → v1.0.1 (Authority-Map row updated; registered like `Doc-6C_Patch_v1.0.1`).
The next reader of M5's Organization/Membership blocks sees the canonical Doc-2 §5.1/§5.2 edge sets.
`ESC-IDN-4M-INDEX` flips RESOLVED with the ruling reference.

---
*Additive patch; the frozen base file is never edited in place. Approved by the human owner
per CLAUDE.md §7/§8 and Doc-4M :18/:34/:351's own correction procedure (ruling 2026-07-09).
Registered in `generatedDocs/00_AUTHORITY_MAP.md`.*
