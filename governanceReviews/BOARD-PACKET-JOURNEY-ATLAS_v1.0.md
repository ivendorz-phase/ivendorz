# BOARD PACKET — Journey Atlas Intake (v1.0)

**Date:** 2026-07-06 · **Status:** OPEN — human Architecture Board
**Source:** journey/lifecycle companion program — [`../journeys/JOURNEY_ATLAS.md`](../journeys/JOURNEY_ATLAS.md)
(+ 9 domain files, 45 lifecycle journeys). Registry rows: `esc_registry.md` § "Journey Atlas
(journeys/ intake, 2026-07-06)".
**Nature:** two corpus-absence escalations surfaced while mapping the owner's journey outline onto
the frozen corpus. **Neither blocks the journey docs** (both are recorded as "not ratified —
escalated" in the atlas §8 ledger); each is a **product decision first**, then an additive patch.

---

## Item 1 — `ESC-JRN-BUYER-VERIF` · Buyer Verification ("Trusted Buyer")

**Ask:** should buyers/organizations get a verification flow and badge, symmetric to vendor
verification?

**Corpus position (verified):**
- `verification_records.subject_type` = `vendor_profile | organization | capacity_claim |
  declared_tier` — fixed enum, "do not extend"; scope bound to **the organization that owns the
  subject** (the vendor's org) — Doc-4G H.3 / H.9(a) / H.10.
- Sole verification event: `VendorVerified`. Zero corpus hits for "Trusted Buyer" / buyer
  verification.
- **However:** `identity.organizations` already carries `verification_level`
  (`unverified/verified/enhanced_verified`, Doc-2 §3) — a dormant field with no ratified flow,
  contract, or display rule. Any ruling should say what this field is for.

**Options for the Board:**
- (a) **Reject** — buyer standing stays out of scope; `verification_level` documented as
  reserved/dormant.
- (b) **Approve minimal** — additive Doc-4G patch admitting buyer-org subjects into the existing
  verification machine (`requested → in_review → …`), reusing M8 `verification_tasks` (M6-5) and
  the existing display-governance style (binary badge; no score).
- (c) **Approve full** — (b) plus RFQ-surface disclosure rules ("verified buyer" on invitations).
  Requires a Doc-3/Doc-4E disclosure review (vendor-side display of buyer standing is new
  ground).

**Until ruled:** no buyer-verification journey, badge, or flow anywhere.

---

## Item 2 — `ESC-JRN-LEAD-DIST` · Admin Lead Distribution

**Ask:** the owner's outline lists "Lead Distribution" as an admin operation. Should staff be able
to assign/distribute leads to vendors?

**Corpus position (verified):**
- Doc-4J has **no** lead entity or function (the only "lead" token is the English verb).
- `vendor_leads` are created **only** by `ops.create_lead_on_invitation.v1` on `(VendorInvited)`,
  which fires **only** at invitation `[delivered]` — i.e. leads are born from the governed
  matching/routing pipeline (seam M6-2), never assigned.
- M7 lead credits (BC-BILL-4) are a **commercial balance** — "never procurement standing"; they
  meter access, never gate or assign.

**Governance tension to weigh:** any staff lead-assignment instrument would inject a human hand
into the matching moat (engine owns invitations; Doc-3) and risks the R7/billing firewall if
paired with lead packages. The conservative reading is that "lead distribution" as a business idea
is *already realized* by matching + routing + invitations, and the admin lever is routing-rule
governance (`manage_routing_rule`/`assist_routing`, Stage-gated).

**Options for the Board:**
- (a) **Reject** — affirm leads stay invitation-born; admin lever = routing rules only.
- (b) **Approve narrow** — an M8-initiated *re-delivery/nudge* instrument (no new lead creation
  path), additive Doc-4J patch.
- (c) **Approve broad** — staff lead assignment (new creation path) — would require Doc-4F +
  Doc-4J patches **and** an explicit moat/firewall review.

**Until ruled:** no admin lead-assignment surface or journey; File H ledger carries the absence.

---

*Non-authoritative packet. Coins nothing; each item resolves only via its named channel
(human Architecture Board), never locally. On any conflict the frozen corpus wins.*
