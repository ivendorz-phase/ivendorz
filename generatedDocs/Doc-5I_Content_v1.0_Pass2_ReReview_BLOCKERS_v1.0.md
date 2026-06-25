# Doc-5I — Content Pass-2 — Focused Re-Review of the 5 BLOCKERs (+ Doc-4I trace) v1.0

| Field | Value |
|---|---|
| Re-reviews | `Doc-5I_Content_v1.0_Pass2.md` after the Hard Review v1.0 patch |
| Scope | The 5 BLOCKERs from `Doc-5I_Content_v1.0_Pass2_Hard_Review.md` (B-01…B-05). Verification extended into `Doc-4I_FROZEN_v1.0` per-contract Actor/Output fields (the source of truth the original Pass-2 was *not* traced against) |
| Method | Pattern-grep across the patched file + per-contract diff against `Doc-4I_FROZEN_v1.0` §HB blocks. Adversarial, not confirmatory |
| Verdict | **5 BLOCKERs RESOLVED.** But the B-04 fix + the deferred M-04 exposed **2 new conflicts with frozen Doc-4I** (RR-B1, RR-B2) that now block content freeze |

---

## Part 1 — The 5 BLOCKERs (verdict: all RESOLVED)

| ID | Original defect | Fix verified | Status |
|---|---|---|---|
| **B-01** | `400 BAD_REQUEST` invented class | Zero `BAD_REQUEST` in file; §3.8 explicitly states "no `BAD_REQUEST` class"; malformed body folded into `400 VALIDATION` (create_plan, update_plan, purchase_subscription) | ✅ **RESOLVED** |
| **B-02** | `422 VALIDATION` wrong status map | Zero `422 VALIDATION` rows remain; all field/format failures → `400 VALIDATION`; genuine business rules correctly reclassified `422 BUSINESS` (purchase one-active-per-org / cycle-not-offered; get_usage future period) | ✅ **RESOLVED** |
| **B-03** | page-size literals + `limit` | All lists use `page_size` + `cursor`; bounds referenced to `[ESC-BILL-POLICY]` page key, over-max → `400 VALIDATION`; no `20/50/100/200` literals; no `limit` param | ✅ **RESOLVED** |
| **B-04** | `org_id` tenant-selection param | `org_id` removed from get_usage; §4.0 + §3.9 declare it prohibited (`Doc-4A §9.7`); admin cross-org leg escalated `[ESC-BILL-ADMINSCOPE]` | ✅ **RESOLVED** (but see RR-B1) |
| **B-05** | `is_active` lifecycle field in body | `is_active` removed from update_plan; body note states no lifecycle field accepted; activation escalated `[ESC-BILL-ACTIVATE]` | ✅ **RESOLVED** (refined by RR-m1) |

Also confirmed clean: **M-01** (`FORBIDDEN`→`AUTHORIZATION` everywhere; zero `FORBIDDEN` in error tables) and **M-02/M-03** envelope declared once in §3.9/§4.0 (no top-level `next_cursor` response bodies remain).

**The mechanical anti-invention / status-map layer is now Doc-5A-conformant.** Had the Pass-2 representations also been traced to Doc-4I, this would be a clean pass. They were not — the patch deferred that trace behind `[ESC-BILL-FIELD]`. Tracing it now is where the two new conflicts surface.

---

## Part 2 — New conflicts found by tracing against `Doc-4I_FROZEN_v1.0`

### RR-B1 (BLOCKER · Flag-and-Halt) — Admin is **not** an actor on any org-scoped read; Doc-4I says User-only
**Evidence (`Doc-4I_FROZEN_v1.0`):**
- §HB-2.5 `get_subscription` / `list_subscription_events` — **Actor: User** (Owner, Delegate); slug `can_view_billing`.
- §HB-3.3 `get_usage` — **Actor: User** (21.3 Query).
- §HB-4.2 `get_lead_balance` / `list_lead_transactions` — **Actor: User**.
- §HB-5.4 `get_platform_invoice` / `list_platform_invoices` — **Actor: User**.
- §HB-6.3 `get_reward_balance` / `list_referrals` — **Actor: User**.
- Only §HB-1.1/1.x `get_plan` / `list_plans` (platform-owned catalog) are **User / Admin**.

**Conflict:** Pass-1 §3.6 stamps "**Admin reads any org (§3 cross-cutting grant)**" onto **all nine** org-scoped reads, and Pass-2 `get_usage` lists Actor "User / Admin". Doc-4I declares those nine reads **User-only**. Authority order: the frozen Doc-4 corpus outranks the Doc-5I structure §3 grant — **Doc-4I wins**.

**Why it matters:** this is *realize-never-redecide* being violated upstream — the structure §3 "Admin reads any org" cross-cutting grant over-reached past Doc-4I's per-contract actors. The `[ESC-BILL-ADMINSCOPE]` escalation I added halts in the right place but **mis-states the cause**: the admin singleton-read mechanism is undefined because **Admin is not an actor on these contracts at all**, not because the mechanism is merely unspecified.

**Required (Flag-and-Halt — do not resolve locally):**
1. Remove "User / Admin" and the "Admin reads any org" annotation from all nine **org-scoped** reads in Pass-1 §3.6 and Pass-2 (§5/§6). Keep User/Admin **only** on `get_plan`/`list_plans` (Doc-4I §HB-1.x).
2. Escalate the structure §3 cross-cutting grant as conflicting with Doc-4I §HB-2.5/3.3/4.2/5.4/6.3 — the grant must be re-scoped to the platform-owned catalog reads, or an additive Doc-4I/structure patch with human approval is required to add an Admin actor. Cite both sources; this is a corpus conflict, not an authoring choice.
3. Retire `[ESC-BILL-ADMINSCOPE]` as written; replace with this conflict escalation.

### RR-B2 (MAJOR — was M-04, now concrete) — response representations diverge from Doc-4I outputs
The `[ESC-BILL-FIELD]` marker deferred field-tracing; tracing now shows real divergences, not hypothetical ones:

| Contract | Doc-4I FROZEN output (`§HB`) | Pass-2 representation | Divergence |
|---|---|---|---|
| `get_subscription` | `{ subscription_id, plan_id, **status**, period_start, period_end, auto_renew }` (§HB-2.5) | uses `**state**`; adds `human_ref, organization_id, plan_snapshot{…}, billing_cycle, purchased_at, cancelled_at, expired_at` | **`state` vs Doc-4I `status`** (direct field-name contradiction); 7 fields not in Doc-4I output |
| `list_subscription_events` | `items: { event_type, occurred_at }` (§HB-2.5) | adds `id, subscription_id, actor, metadata` | 4 fields not in Doc-4I output |
| `get_usage` | quota inquiry (§HB-3.3) | `organization_id, period_*, totals{…}, entries[{…}]` | trace each to §HB-3.1/3.3; `totals`/`entries` shape unverified |

**Required:** trace every representation field to its Doc-4I `§HB` output; rename `state`→`status` (Doc-4I governs the field name); trim or escalate (`[ESC-BILL-FIELD]` with a specific per-field cite) every field absent from the Doc-4I output. `Doc-5A §5` / §5.6: representations are the owning module's canonical output **by reference** — Doc-5I must not add or rename fields. M-04 is therefore **not yet resolved** — only procedurally deferred.

---

## Part 3 — Minor (fix in the same re-patch)

- **RR-m1 (`[ESC-BILL-ACTIVATE]` refined):** Doc-4I §HB-1.1 purpose = "create a plan at `draft` / **update** plan config / retire"; PassA frames the trilogy as "create/**activate**/retire". So `update_plan` **owns** the `draft→active` edge — the escalation is **not** "which contract," it is the narrower wire question: how to express activation **intent** without a `Doc-4A §9.7`-prohibited lifecycle field. Re-scope `[ESC-BILL-ACTIVATE]` to that realization decision (dedicated activation command-slug vs publish semantics); ownership is settled.
- **RR-m2 (get_usage envelope hybrid):** the patched get_usage shows a single object with a nested `entries[]` plus `page_size`/`cursor` params, but the §3.9 envelope has no "single-entity-with-paginated-sublist" shape. Decide: model get_usage as the **list envelope** (`items` = entries, `page_info`, `reference_id`) with `organization_id`/`period_*`/`totals` as list **facets** (`Doc-4A §10.3` permits facets) — or drop entry pagination. Current JSON is internally inconsistent.
- **RR-m3 (cursor naming):** Doc-4I uses `page_token`/`next_page_token` (§22.3); Pass-2 uses `cursor`/`page_info.next_cursor`. This is **correct** — Doc-5A §8 realizes the abstract token as the `cursor` wire param — but add a one-line pointer (`page_token` §22.3 → realized as `cursor` §8) so the rename is not read as invention.
- **RR-m4 (get_subscription optional id):** Doc-4I §HB-2.5 inputs allow `subscription_id` **optional** (no input → the actor's Controlling-Org subscription). Pass-2 makes it a required path param, losing the "my current subscription" no-arg mode. Realize both, or cite the narrowing.

---

## Verdict & gate

- **The 5 BLOCKERs: RESOLVED.** The error-class taxonomy, status mapping, pagination grammar, prohibited-field removal, and lifecycle-field removal are now Doc-5A-conformant.
- **Content freeze remains BLOCKED** on **RR-B1** (Admin-actor conflict with frozen Doc-4I — Flag-and-Halt) and **RR-B2** (representation fields untraced / `state` vs `status`).
- **RR-B1/RR-B2 do not block Pass-3 *authoring*** — but Pass-3 must (a) apply the User-only actor correction to its own §7/§8/§9 reads from the start, and (b) trace every field to Doc-4I as it writes, not defer. The same conflict will otherwise replicate across BC-BILL-4/5/6.

**Recommendation:** small re-patch now — RR-B1 (drop Admin from org-scoped reads in Pass-1 §3.6 + Pass-2; escalate the structure §3 grant), RR-B2 (`state`→`status` + field trace), RR-m1…m4 — *then* proceed to Pass-3. RR-B1 is the load-bearing one: it is a frozen-corpus conflict and must be escalated, not silently realized either way.

---

*Independent re-review. The patch fixed exactly what it claimed (5/5 BLOCKERs). The new findings are not regressions — they are pre-existing conflicts that the original Pass-2 hid behind an invented `org_id` param and an untraced representation, and that removing those inventions correctly exposed.*
