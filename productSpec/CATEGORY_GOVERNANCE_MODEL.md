# Category Governance Model — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion. **Classification Schema v1.0 /
Taxonomy Content v1.0 (proposed).**
**Date:** 2026-07-02 · **Home:** `productSpec/` · **Companions:** `CATEGORY_TAXONOMY_REVIEW.md` ·
`CATEGORY_MIGRATION_PLAN.md` · `CATEGORY_ATTRIBUTE_FRAMEWORK.md` · `CATEGORY_TAXONOMY_DECISION_RECORD.md`
· terminology per `MASTER-CLASSIFICATION-DICTIONARY.md` (never redefined here).

**Purpose.** How the category taxonomy **evolves over time without deteriorating**: who owns it, who
approves changes, how merge/split/rename/retire work, how aliases grow, how content versions are cut,
and which health metrics tell us it is drifting. The taxonomy *mechanism* is frozen in the corpus; this
document governs the *content* that lives inside that mechanism.

---

## 1. Ownership & authority (by pointer — coined nowhere here)

| Concern | Authority | Anchor |
|---|---|---|
| Category entity, lifecycle states, 4-level tree, slugs, soft delete | **M2 Marketplace** owns; frozen mechanism | `Doc-4D` §D2/§D7.1 DD-4 · `Doc-2 §10.3` · `Doc-6D §3.2` (`level CHECK 1–4`) |
| Approval / status transitions (`draft → active → retired`) | **M8 Admin** staff only, via `marketplace.set_category_status.v1` (`staff_can_manage_categories`) | `Doc-4J` BC-ADM-3 · `Doc-4D` DD-4 |
| Vendor ↔ category assignment (≤10 total / ≤5 primary; `proposed → active → removed`) | Vendor orgs assign; M2 enforces caps | `Doc-4D` §D7.1 · `Doc-2 §3.3` |
| Matching consumption (category = hard gate A2) | **M3** consumes by `category_id`; never writes categories | `Doc-3 §3.1` · `Doc-4E` §E5.1/H.10 |
| Taxonomy **content** (which categories exist, names, placement) | **Open** — this governance model + human adjudication | `Doc-6D §7` (seed is admin-runtime; no frozen list) |

Vendors and buyers **never create categories**; they may *propose* (assignment lifecycle starts at
`proposed`) and platform staff decide. No events or audit actions are coined for category changes —
the frozen catalog stands (`Doc-2 §8/§9`, audit action "category approve/delete").

---

## 2. The Stable Taxonomy Principle (binding policy)

**The taxonomy is intentionally stable.** A category tree is navigation infrastructure, not a
product feed. Once Taxonomy Content v1.0 is active:

1. **New category nodes require governance approval** through the change process in §4. There is no
   self-service path to a new node.
2. **Most growth does not create nodes.** The default answer to "we need a category for X" is one of:
   - an **attribute** on an existing node (`CATEGORY_ATTRIBUTE_FRAMEWORK.md`),
   - a **specification** entry (spec library, `marketplace.spec_library_entries` — EXISTS),
   - an **alias/synonym** so search finds the existing node (§6),
   - a **synonym-dictionary expansion** for regional/industry terms.
3. A node is added only when the **node-admission test** passes (`CATEGORY_TAXONOMY_REVIEW.md`
   §"Category vs Product Family vs Application vs Material"): the concept is a *product family buyers
   browse as a family*, not a material, grade, brand, application, sourcing arrangement, or urgency.
4. **Brand never creates a category. "Who uses it" never creates a category** (industry is a separate
   axis — `INDUSTRY-TAXONOMY-MODEL.md`).

Uncontrolled node growth is the primary failure mode of marketplace taxonomies; this principle is the
control.

---

## 3. Lifecycle: process layered on the frozen state machine

**Frozen states (mechanism — cannot be extended):** `draft → active → retired`, no reopen; soft delete
independent (`Doc-2 §3.3`, `Doc-4D §D7.1`).

The Board-requested six-step *process* maps onto those three states as follows. The process is
convention; the states are law.

| Process step | Frozen state effect | Performed by | Notes |
|---|---|---|---|
| **1. Create** | insert row, `status = draft` | Platform staff (M8 surface; M2 owns entity) | From an approved change request (§4) only |
| **2. Review** | none (stays `draft`) | Taxonomy owner (product) + reviewing staff | Checked against node-admission test + acceptance criteria |
| **3. Approve** | none (decision recorded) | M8 Admin staff (`staff_can_manage_categories`) | Raise ≠ Accept: proposer never approves own node |
| **4. Publish** | `draft → active` via `set_category_status` | M8 Admin staff | Node becomes browsable and A2-routable |
| **5. Deprecate** | **none — operational convention** | Taxonomy owner announces | Node flagged in ops tracking as *closing*: no new vendor assignments encouraged, content migrates to successor. **No `deprecated` state exists in the frozen mechanism.** If a true state is ever wanted, that is an additive corpus patch decided by the Board (Flag-and-Halt; never resolved locally). |
| **6. Retire** | `active → retired` (terminal) | M8 Admin staff | Excluded from public reads; assignments handled per §5; row survives forever (soft delete only, IDs never reused) |

---

## 4. Change process (merge / split / rename / relocate / add)

Every structural change is a **change request** adjudicated under CLAUDE.md §13 (Validate Findings:
valid → applicable → best for product → consistent with corpus). All operations compose **only frozen
primitives** — create, update, set-status, assignment lifecycle. Nothing new is coined.

| Operation | Recipe (frozen primitives only) | Identity effect |
|---|---|---|
| **Rename (label)** | `update_category` on `name` | UUID + slug unchanged — safe, cheap, preferred |
| **Rename (slug)** | Discouraged (see §7). If unavoidable: `update_category` on `slug` + register old slug as alias/redirect | UUID unchanged; old slug must keep resolving |
| **Add** | Create `draft` → review → approve → publish (§3) | New UUID minted once |
| **Merge A+B → C** | Create/choose C `active`; vendors on A/B assign to C (new `proposed → active` assignments); retire A and B | A, B UUIDs survive as `retired`; alias A→C, B→C |
| **Split A → B, C** | Create B, C `active`; vendors on A re-assign to B and/or C per their scope; retire A | A survives `retired`; alias A→B (primary successor) |
| **Relocate (change parent)** | **Never mutate `parent_id`/`level` of an `active` node** (level is fixed at creation). Recipe = create successor under the new parent + merge-retire the old node | Old UUID retired; alias old→new |
| **Retire (no successor)** | Retire; assignments end per §5 | Alias to nearest family node so old URLs don't dead-end |

**Rules that hold for every operation:**
- Vendor assignment caps (≤10 / ≤5 primary) are respected during re-assignment — a merge may not push
  a vendor over cap; overflow is resolved by the vendor choosing, never silently dropped.
- A2 matching continuity: a node referenced by open RFQs is **not retired** until those RFQs close
  (matching gates on active assignment; yanking a category mid-RFQ would silently shrink the candidate
  pool). Check before retiring.
- Nothing is hard-deleted; IDs are never reused (`Doc-2 §0.1/§0.2`).

---

## 5. Vendor & content continuity on retirement

When a node retires: (a) existing `active` assignments on it no longer pass gate A2 for *new* RFQs
targeting successor nodes — so **re-assignment happens before retirement**, in the deprecate window
(§3 step 5); (b) the alias map (§6) points the retired slug at its successor so public URLs, saved
searches and SEO equity land somewhere useful; (c) analytics keep the retired node queryable forever
(soft delete, never erased).

---

## 6. Alias & synonym governance

The alias/synonym mechanism is **NET-NEW** (nothing in the frozen corpus models it — escalation
`ESC-CLASS-ALIAS`, registered in `CATEGORY_MIGRATION_PLAN.md`). Until a mechanism is ratified, the
synonym dictionary lives as governed *content* (starter set in `CATEGORY_TAXONOMY_REVIEW.md` §9) and
may be consumed by the search projection (search is a disposable read-model — `Doc-6D` MK-CR9).

Growth process:
1. Anyone proposes synonyms (support tickets, zero-result search logs, vendor feedback).
2. Taxonomy owner batches proposals; checks each is a **true synonym** (same concept) and not a
   distinct concept that deserves an attribute or (rarely) a node.
3. Approved batch ships as a dictionary version bump (v1.0 → v1.1). Synonyms are additive; removing
   one requires the same review.
4. **Aliases never appear in navigation** — they exist for search expansion and redirects only.
   Taxonomy defines structure; search finds anything; aliases expand queries; AI suggests. Four
   systems, kept independent (`CATEGORY_TAXONOMY_REVIEW.md` §8b).

---

## 7. Canonical identity policy (shared with the migration plan)

| Element | Policy |
|---|---|
| **UUIDv7** | Minted once at creation (M0 ID generation), immutable, never reused — frozen mechanism |
| **Slug** | *Governance policy:* **immutable after first publish**. The frozen mechanism permits slug mutation via `update_category`; we choose not to use it except under a Board-level exception, because slugs are public URLs, SEO equity, and import keys. A slug change requires a registered alias + redirect |
| **human_ref** | Prefix for categories is **not materialized in the corpus** — open decision flagged to the Board (`CATEGORY_MIGRATION_PLAN.md` §Escalations) |
| **Display name** | Freely renameable (id-preserving `update_category`) under §4 review |
| **Alias list** | Governed content per §6; every retired slug gets an alias |

---

## 8. Taxonomy versioning

Taxonomy **content** is versioned as **Taxonomy Content vX.Y** under the Classification Schema
versioning convention (ADR-023 §7 — additive & versioned):

- **vX.0** — structural release (new/merged/retired nodes). Requires the full §4 process and a Board
  sign-off on the batch.
- **vX.Y** — additive minor (synonym batches, attribute vocabulary growth, display-name fixes).
- Every release ships with a changelog entry (old → new mapping for any structural change, same format
  as `CATEGORY_MIGRATION_PLAN.md` Appendix B) so integrations and analytics can follow.
- Categories themselves are **not versioned rows** (frozen model: head row + soft-delete history);
  versioning is of the *content release*, not the row.

---

## 9. Review cycle

- **Quarterly health review** (taxonomy owner): KPI readout (§10), zero-result search terms, proposed
  synonym batch, node change requests triage.
- **Yearly structural review** (owner + Board): does the L1/L2 shape still match buyer behavior;
  candidate merges of thin nodes (< agreed vendor/product threshold after 12 months); expansion needs
  from new markets.
- **Ad-hoc** — a BLOCKER-severity finding (e.g., a firewall-adjacent misuse of categories) goes
  straight to Flag-and-Halt per CLAUDE.md §11, never resolved locally.

---

## 10. Quality KPIs (product-level definitions; measurement points to owning modules)

Definitions live here; **instrumentation is owned by the owning modules** (M2 data, M3 matching
outcomes, product analytics via PostHog per the frozen stack). Nothing below coins an event, table, or
contract — where a metric needs new plumbing, that is a future additive request to the owning module.

| KPI | Definition | Direction | Measured from (pointer) |
|---|---|---|---|
| **Duplicate rate** | Nodes flagged as duplicate-meaning per review ÷ total active nodes | → 0 | Quarterly manual audit (this doc §9) |
| **Average assignment depth** | Mean level of categories vendors actually assign | ≥ 3 target | M2 `category_assignments` |
| **Browse success** | Sessions reaching a leaf category page from Explorer without using search fallback | ↑ | Product analytics (PostHog) |
| **Search success** | Category-intent searches returning ≥1 relevant node in top results; zero-result rate | ↑ / ↓ | Search projection logs (M2 read-model) |
| **Vendor classification accuracy** | Share of vendor assignments unchanged 90 days after onboarding (proxy: got it right first time) | ↑ | M2 assignment lifecycle history |
| **RFQ match accuracy** | Share of RFQs whose A2 gate yields a non-empty candidate pool at the chosen node; buyer re-categorization rate | ↑ / ↓ | M3 matching outcomes (aggregate only — never exposes gate-excluded vendors, `Doc-4E` H.10) |
| **Unclassified products** | Products with no category-linked spec/discovery path | ↓ | M2 products (note: product↔category link is optional in the frozen model — metric flags where that hurts) |

KPI thresholds are set at first quarterly review from observed baselines — no invented budgets
(fe-planning guardrail: numbers are owned where they're measured, coined nowhere).

---

## 11. Separation of duties (recap)

- **Taxonomy owner (product role)** proposes and maintains content, runs reviews, owns this document.
- **M8 Admin staff** are the only actors who publish/retire (frozen permission).
- **The Board / human authority** rules on structural releases, slug-change exceptions, and anything
  touching the frozen corpus (Authority Order §7 — architecture is supreme).
- **Reviewers raise; owners rule** — Raise ≠ Accept (CLAUDE.md §13) applies to every change request.
