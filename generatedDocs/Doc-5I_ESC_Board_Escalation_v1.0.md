# Doc-5I — Board Escalation: Two Content-Freeze Gates (`[ESC-BILL-ADMINSCOPE]`, `[ESC-BILL-ACTIVATE]`)

| Field | Value |
|---|---|
| Document | Doc-5I ESC Board Escalation v1.0 |
| Raised by | Doc-5I content authoring + Independent Hard Reviews (Pass-2 Re-Review RR-B1; Pass-3; Content Hard Review) |
| Routed to | **Architecture Board · API Governance Board · Virtual CTO → human approver** |
| Decision class | **HUMAN APPROVAL REQUIRED.** Both items touch the frozen corpus (Authority Order ranks 0–1, immutable to skills; CLAUDE.md §8 — "Architecture-affecting artifacts require HUMAN approval; code review alone is insufficient") |
| Disposition by AI | **Flag-and-Halt.** No frozen document edited. Doc-5I content realizes the corpus-consistent reading and carries both as freeze gates; **neither resolved locally** |
| Blocks | `Doc-5I_Content_Freeze_Audit` — cannot certify FROZEN until both are dispositioned |
| Does NOT block | Pass-1/2/3 content authoring (complete, hard-review-clean) |

> **Why escalated, not decided.** Each item is a conflict/gap **between frozen corpus documents** (Doc-2 / Doc-4I) and the Doc-5I structure. Resolving either requires an **additive patch to a frozen doc** — outside any skill's authority. The options below are advisory only; the board/human chooses.

---

## GATE 1 — `[ESC-BILL-ADMINSCOPE]` (corpus conflict)

### Conflict
The Doc-5I structure §3 cross-cutting grant says **"Admin reads any org."** Frozen Doc-4I declares the org-scoped reads **Actor = User only**.

| Source A (Doc-5I structure) | Source B (frozen Doc-4I) |
|---|---|
| `Doc-5I_Structure_v1.0_FROZEN.md §3` — "Per-read disclosure-scope rule … Admin reads any org" (cross-cutting grant) | `Doc-4I_FROZEN_v1.0` §HB-2.5 (`get_subscription`/`list_subscription_events`), §HB-3.3 (`get_usage`), §HB-4.2 (`get_lead_balance`/`list_lead_transactions`), §HB-5.4 (`get_platform_invoice`/`list_platform_invoices`), §HB-6.3 (`get_reward_balance`/`list_referrals`) — **Actor: User** (Owner/Delegate), slug `can_view_billing`; no Admin actor |
| Exception: `get_plan`/`list_plans` (catalog) | `Doc-4I §HB-1.4` — `get_plan`/`list_plans` Actor = **User / Admin** (platform-owned catalog) |

### Authority resolution
Per the Authority Order, the **frozen Doc-4 corpus (rank 0) outranks the Doc-5I structure.** Doc-4I wins → the nine org-scoped reads are **User-only**. Doc-5I content realizes them User-only and re-scopes the structure §3 grant to the catalog reads. The conflict is in the **structure's wording**, which over-reached past Doc-4I's per-contract actors.

### Secondary gap (only relevant if Option B is chosen)
The org-scoped reads for `usage` / `lead-account` / `reward-account` are **ID-less org singletons**. There is **no Doc-4I-defined mechanism** for platform-staff to read *another* org's singleton, and a caller-supplied `org_id` is a **prohibited tenant-selection field** (`Doc-4A §9.7`; Invariant #5 — "client-supplied org ID never trusted"). So an Admin cross-org read would also need a mechanism defined (server-side admin context / dedicated admin surface), not a request param.

### Product question for the board
**Does platform-staff (Admin) operationally need to read a tenant's billing data (subscription/usage/lead/invoice/reward)?**

### Options (advisory — board decides)
| Opt | Action | Touches | Impact |
|---|---|---|---|
| **A (recommended)** | Re-scope the structure §3 grant to **catalog reads only**; confirm the nine org-scoped reads are User-only | Additive patch to `Doc-5I_Structure_v1.0_FROZEN.md` §3 wording only | Low. Aligns structure to frozen Doc-4I; **reopens no Doc-4I contract**; matches current content |
| **B** | Add an **Admin actor** to the org-scoped read contracts **and** define the admin singleton-read mechanism (no client `org_id`) | Additive patch to **Doc-4I** §HB-2.5/3.3/4.2/5.4/6.3 + a Doc-4A-conformant admin-scope mechanism | High. Reopens frozen Doc-4I; needs the mechanism designed; then Doc-5I content adds the Admin leg |
| **C** | Declare the structure §3 wording non-authoritative orientation overridden by Doc-4I; annotate, no patch | Annotation only | Low, but leaves a standing wording conflict in a FROZEN structure |

> **AI recommendation (advisory):** **Option A** — least invasive, consistent with the frozen Doc-4I, no reopening of a frozen contract; choose **B only** if there is a real operational need for platform-staff to read tenant billing, in which case the admin-scope mechanism must be designed before the Doc-4I patch.

---

## GATE 2 — `[ESC-BILL-ACTIVATE]` (corpus gap)

### Gap
The plans status machine **`draft → active → retired`** exists in `Doc-2 §3.8`, but **no Doc-4I BC-BILL-1 contract realizes the `draft → active` edge.**

| Source A (Doc-2 — edge exists) | Source B (frozen Doc-4I — no realizing contract) |
|---|---|
| `Doc-2 §3.8` — plans machine `draft → active → retired` | `Doc-4I_FROZEN_v1.0 §HB-1.1`: `create_plan` → `draft`; `update_plan` = **marketing-config mutation** ("update from draft/active"); `retire_plan` → `retired`. **No operation drives `draft → active`.** STATE table (stage 6) defines create→draft and retire→retired only |
| | `is_active` (§HB-1.1 input) is a **marketing-visibility bool**, explicitly **distinct from** the `status` machine — it does **not** drive `draft→active` |

### Why it cannot be realized locally
A status transition cannot be a request body lifecycle field (`Doc-4A §9.7` prohibits lifecycle-state request fields), and Doc-4I assigns the edge to no contract. So Doc-5I content **cannot** wire `draft→active` without either inventing a contract/field (forbidden) or an additive Doc-4I change.

### Question for the board
**How is a plan intended to move `draft → active`?** Three plausible intents — the board confirms which is correct:
1. An explicit **publish/activate** operation (a missing Doc-4I contract), or
2. A **server-derived publish semantics** folded into `update_plan` (clarify §HB-1.1, no lifecycle field), or
3. **Automatic/out-of-band** activation (e.g. on first entitlement bundle, or admin publish) — clarify in Doc-2/Doc-4I.

### Options (advisory — board decides)
| Opt | Action | Touches |
|---|---|---|
| **A** | Add an explicit `billing.activate_plan.v1` (publish) contract to Doc-4I BC-BILL-1 | Additive **Doc-4I** patch (+ Doc-5I realizes the new command-slug) |
| **B** | Attribute `draft→active` to `update_plan` via explicit **server-derived publish semantics** (no lifecycle body field); clarify `§HB-1.1` | Additive **Doc-4I §HB-1.1** clarification |
| **C** | Confirm `draft→active` is automatic/out-of-band; document the trigger in `Doc-2 §3.8` / `Doc-4I` | Additive **Doc-2/Doc-4I** clarification |

> **AI recommendation (advisory):** this is a **Doc-2 §3.8 ↔ Doc-4I §HB-1.1 reconciliation** — the board/human must state the intended activation path first; Options A and B are the most likely realizations. **No local pick.**

---

## What the board needs to return

1. **Gate 1** — choose A / B / C; if B, commission the admin singleton-read mechanism design.
2. **Gate 2** — state the intended `draft→active` path; choose A / B / C.
3. For any option that patches a frozen doc (Doc-2 / Doc-4I / Doc-5I structure): **human approval** + an **additive patch** (never an in-place edit; the existing freeze is preserved, the patch is layered).

On disposition, Doc-5I content is updated additively to match, and the **Doc-5I Content Freeze Audit** proceeds. Until then both remain **TRACKED freeze gates**; all other content dimensions are freeze-ready.

---

## Disposition record (to be completed by the approver)

| Gate | Decision | Approver | Date | Patch ref |
|---|---|---|---|---|
| `[ESC-BILL-ADMINSCOPE]` | ☐ A ☐ B ☐ C | | | |
| `[ESC-BILL-ACTIVATE]` | ☐ A ☐ B ☐ C | | | |

---

*Flag-and-Halt escalation. No frozen document was edited. Both gates cite their conflicting frozen sources; AI recommendations are advisory only. Authority Order ranks 0–1 are immutable to all skills (including the Virtual CTO) — these dispositions are human decisions, realized as additive architecture patches.*
