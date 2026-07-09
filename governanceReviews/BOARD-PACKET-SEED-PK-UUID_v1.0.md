# BOARD PACKET — Seed-Row Primary Keys: UUIDv4 vs UUIDv7 (Platform Ruling)

**Status:** ✅ CLOSED — owner ruled **Option A**, 2026-07-10 (decision record below)
**Raised:** RV-0147 (W2-IDN-2 catalog seed review, 2026-07-09) — flagged as a platform-ruling
candidate; Board directed a decision packet 2026-07-09 ("architecture-affecting — long-term
persistence implications").
**Author:** AI Engineering Orchestrator (Backend-Lead hat), 2026-07-09

## 1. The question

The frozen ID rule (Doc-6A §3.1, M0 ID service) is **UUIDv7 for platform-generated entity IDs**
(time-ordered, index-friendly). **Migration-time seed rows** (the 43-slug permission catalog +
4 system bundles + 103 mappings, seeded at W2-IDN-2) were seeded with **deterministic,
hand-authored UUIDs** inside SQL migrations — they cannot call the M0 ID service (it does not
run inside a migration) and MUST be deterministic (idempotent re-execution, identical across
environments).

The open platform question: **what UUID discipline governs migration-time seed PKs**, now and
for every future catalog seed (POLICY keys at W2-IDN-7, future module catalogs)?

## 2. Facts (verified at RV-0147)

- Seed determinism is non-negotiable: the seed re-executes idempotently (`ON CONFLICT` guarded)
  and must produce identical rows in every environment — random v4 at execution time is ruled
  out by the frozen seed mechanics either way; the choice is about the FORMAT of the
  pre-authored constants.
- v7's ordering benefit is per-insert-time locality — meaningless for a fixed catalog of ≤~150
  rows written once.
- The realized catalog seed's constants are **format-v4 literals** (hand-authored). They are
  live in `identity` since `f2bbcfa`; three independent reviews passed the seed content.
- Changing ALREADY-SEEDED PKs would require a destructive re-key (FK re-point + audit
  discontinuity) — Invariant 8 makes retroactive re-keying effectively prohibited; any ruling
  realistically applies **forward-only**.

## 3. Options (neutral)

**Option A — Ratify the status quo: deterministic pre-authored UUIDs (v4 format) for
migration-time seeds; UUIDv7 remains the law for runtime-generated IDs.**
One sentence added to the platform conventions (additive Doc-6A note or a recorded convention);
zero code change; the v4/v7 distinction becomes the marker separating "seeded constant" from
"runtime-generated".

**Option B — Require v7-FORMAT constants for future seeds** (pre-authored with a fixed
timestamp component); existing seeds stand (forward-only).
Cosmetic uniformity of format; the timestamp bits would be fabricated constants (a v7 that
encodes a fake time), which weakens v7's semantic honesty; needs a documented convention for
choosing the fixed timestamp.

**Option C — Namespace/deterministic UUIDv5 for future seeds** (name-hashed from the natural
key, e.g. `uuid5(ns, 'identity.permission.can_submit_quote')`); existing seeds stand.
Strongest determinism story (PK derivable from the natural key forever, no authored constant to
typo); introduces a third UUID discipline to document; hash-derived PKs carry no ordering.

## 4. Decision requested

Rule A, B, or C (all forward-only; no re-keying of live rows under any option). On ruling: the
convention is recorded (additive note on the appropriate channel), W2-IDN-7's POLICY-seed packet
carries it, and the registry/queue item closes.

---

## DECISION RECORD — 2026-07-10

**Ruling (owner/Architecture Board): Option A.** Retain **deterministic, pre-authored UUID v4
constants** for migration-time seed rows. **No migration, no re-keying.** UUIDv7 (Doc-6A §3.1,
M0 ID service) remains the law for all runtime-generated entity IDs.

**Standing convention (recorded by this line, forward-binding):** migration-time catalog seeds
use hand-authored, deterministic, format-v4 UUID constants; the v4/v7 format distinction is the
recognized marker separating "seeded constant" from "runtime-generated". Every future
catalog-seed packet (starting **W2-IDN-7**, the 7 `identity.*` POLICY keys) carries this
convention by pointer to this record.

**Instruments:** this record (the convention home — no corpus patch needed; Doc-6A untouched) ·
tracker W2-IDN-7 carry note · the existing W2-IDN-2 seed stands as-is (already three-times
review-verified).

**PACKET CLOSED.**
