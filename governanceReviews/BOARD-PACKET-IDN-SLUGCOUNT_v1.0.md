# Board Packet — `ESC-IDN-SLUGCOUNT` · Permission-Slug Count Mismatch (W2-IDN-2 Flag-and-Halt)

**Date:** 2026-07-09 · **Raised by:** Agent M1 (W2-IDN-2 activation, suspended at `c21c38f`) ·
**Drafted by:** AI Engineering Orchestrator · **Decision:** HUMAN OWNER/BOARD (frozen-vs-frozen —
CLAUDE.md §11 Flag-and-Halt; §7: only a human-approved additive patch may touch rank 0).
**Status: OPEN — no option pre-selected.** Registration implies NO acceptance.

## 1. The conflict (both sources cited)

| Source | Claim |
|---|---|
| **Doc-2 §7** (FROZEN, rank 0 — base text v1.0.2 lines 609–647, current through the v1.0.5 patch chain) | **Enumerates 43 distinct permission slugs: 36 tenant + 7 staff.** (Verified by two independent methods: manual 29-row table walk; exhaustive `` `can_...` `` regex extraction — 37 raw hits incl. 1 legitimate duplicate `can_manage_vendor_profile` cited across two rows.) |
| **Doc-6C §5.1** (FROZEN — Pass-2 line 169) + **Doc-6C Pass-3 Appendix-A CHK-6-062** + `backend_execution_playbook.md` §5 | **Assert "45 slugs — 38 tenant + 7 staff."** None enumerates the 38; all three cite Doc-2 §7 as the "authoritative exhaustive list" — which does not substantiate 45. |

**Ruled out as sources of the missing 2** (by the suspended agent, evidence in
`governanceReviews/milestones/w2-idn-2/HANDOFF-NOTE.md` §3/§4): Doc-2 patches v1.0.3/v1.0.4/v1.0.5
(audit-mapping + Vendor-Slug law only), PATCH-10 (already folded into base text), Master System
Architecture §13.1/§13.3 (descriptive; no additional distinct slugs).

## 2. Why it halts W2-IDN-2

The seed WP's DoD is "slug set ≡ Doc-2 §7" while its sizing authority says 45. Seeding 43 silently
contradicts Doc-6C's attestation row; seeding 45 requires **inventing two slugs** — a hard §8/§11
violation. Neither is a local call. **Nothing was seeded; nothing was coined.**

## 3. Neutral options (owner picks; the Orchestrator has NOT pre-decided)

- **Option A — Doc-2's enumeration is the truth (count = 43).**
  The "45 (38 tenant)" figures in Doc-6C §5.1, CHK-6-062, and the playbook are a propagated
  counting error. Resolution: **additive editorial patch** to Doc-6C (45→43, 38→36) + playbook
  sync; W2-IDN-2 resumes seeding the enumerated 43.
  *Cost: small editorial patch to one frozen doc's assertion lines. No schema/architecture change.*
- **Option B — 45 is the intended catalog (2 tenant slugs are missing from Doc-2 §7).**
  Resolution: **additive Doc-2 §7 patch that ENUMERATES the two missing tenant slugs** (names +
  row placement + bundle-default cells), human-approved per §7/§8; Doc-6C stands; W2-IDN-2 resumes
  seeding 45.
  *Cost: rank-0 additive patch; the two slugs must come from the owner/architecture intent —
  the Orchestrator and agents cannot supply them.*
- **Option C — Defer:** park W2-IDN-2 (⛔ on `ESC-IDN-SLUGCOUNT`); the M1 chain continues only
  through items not dependent on the seed (note: `W2-IDN-3 check_permission` consumes the seed —
  the critical path stays blocked until ruled).

## 4. Resume path (either A or B)

Reactivate Agent M1 with the original packet + `HANDOFF-NOTE.md` + the ruling (per
`AI-Handoff-Note-Template.md` §6): seed the ruled set → 8E suite (counts updated to the ruling) →
A → B ∥ T6 → clean-gate close.

---
*Append-only Board packet. Conforms upward; coins nothing. Decision record to be appended below
this line by/for the owner.*

## DECISION RECORD (owner, 2026-07-09)

**RULING: OPTION A — Doc-2 §7's enumerated 43 (36 tenant + 7 staff) is the truth; the "45 (38
tenant)" figures in Doc-6C §5.1 / CHK-6-062 / the playbook were a propagated counting error.**

Executed at close of this packet:
- `generatedDocs/Doc-6C_Patch_v1.0.1.md` authored (additive editorial patch; frozen base files
  untouched; Doc-6C → v1.0.1) and registered in `00_AUTHORITY_MAP.md` (series row amended +
  patch row added).
- Living-doc sync: `backend_execution_playbook.md` §5 + `backend_build_plan.md` §2/§4 corrected
  45→43 / 38→36 with ruling citations.
- `esc_registry.md` `ESC-IDN-SLUGCOUNT` row → RESOLVED (Option A).
- `W2-IDN-2` unparked: Agent M1 reactivated (original packet + Handoff Note + this ruling) to
  seed exactly the 43 enumerated slugs; 8E suite pins 43/36/7.

**This packet is CLOSED.** Closed records never reopen; a future count question is a new item.
