# Doc-7E — Content Pass-2 (§5–§9 + Appendix) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7E_Content_v1.0_Pass2.md` (§5–§9 + Appendix) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Doc-5I actor/ownership conformance |
| Verdict | **NOT YET PASS** — 1 MAJOR + 2 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- §5.2 R6 firewall (platform-fee invoices only; ≠ trade invoices) — CORRECT.
- §5.3 R10 entitlement via wired reads, never `resolve_entitlements` — CORRECT.
- §6.1 `renew_subscription`/`expire_subscription` = System period-end jobs (`Doc-5I` §10 out-of-wire), UI displays not invokes — CORRECT.
- §9.1 applicability matches ER10 (CHK-7-012 N/A; 010/011 `(app)`-only; 050/051 N/A) — CORRECT.

0 BLOCKER. One actor/ownership misbinding (MAJOR) + two refinements + one nit.

### MAJOR-1 — `activate_plan` is misbound to the user subscription view; it is **Admin catalog governance** (Doc-7H), not a user account action
§5.1 (and the Appendix) bind **`activate_plan`** under the **Subscription** view as a "user-initiated command." But **`activate_plan` realizes the plan `draft→active` edge** (`Doc-4I ActivatePlan` additive patch; `Doc-2 §3.8`), and **plans are BC-BILL-1 Admin catalog governance** ("plans `draft→active→retired`" — `Doc-5I` line 60, **Admin command**). A **user does not activate a plan** — the user **purchases a subscription** (`purchase_subscription`, BC-BILL-2 User). Binding `activate_plan` to the user account shell is a **wrong-actor / wrong-owner** violation; it belongs to the **Admin console (Doc-7H)**.
**Required fix:** **remove `activate_plan` from Doc-7E** (§5.1 + Appendix). The account shell's subscription view binds **`purchase_subscription` / `cancel_subscription`** (BC-BILL-2 User) + own-org reads only. **`activate_plan` (plan catalog `draft→active`) is realized in Doc-7H (Admin console)**, alongside `create_plan`/`update_plan`/`retire_plan` (BC-BILL-1 Admin).

### MINOR-1 — §5.1 `credit_lead_account` actor leg needs confirmation (user-buy vs System-credit-after-payment)
§5.1 binds `credit_lead_account` as "buy (User leg)." `credit_lead_account` is **User/System actor-branched** (BC-BILL-4); the user-initiated leg may be a **purchase that triggers a System credit**, not a direct user `credit_lead_account`.
**Required fix:** confirm the BC-BILL-4 User leg — if the user **buys** credits via a purchase flow (System then credits), the UI binds the **purchase** action and **reads** the balance; bind `credit_lead_account` directly only if its User leg is genuinely a caller-facing user command. Same actor-leg discipline as platform invoices (§5.1 System-issued).

### MINOR-2 — §6.1 bind the subscription UI to the verified Doc-4M transition set
§6.1 lists `purchase → active → (renew | expire | cancel)` but does not pin the **user-invocable** edges to Doc-4M. The UI must offer **only** the Doc-4M-permitted, **User-actor** transitions (`purchase_subscription`, `cancel_subscription`); renew/expire are **System** (displayed, not invoked).
**Required fix:** §6.1 bind the offered transitions to the **Doc-4M subscription machine** by pointer, marking `renew`/`expire` System-only (display) and `purchase`/`cancel` the user-invocable edges; confirm the `cancel` edge in Doc-4M at content.

### NITPICK-1 — note the `activate_plan` removal cascades to Doc-7H
The MAJOR-1 fix moves `activate_plan` to the Admin console.
**Required fix:** §9.2 / a cross-reference note that `activate_plan` (plan catalog `draft→active`) is **Doc-7H's** binding, not carried here — so Doc-7H picks it up.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MAJOR-1 `activate_plan` misbound (→ Doc-7H Admin) | MAJOR | Content Patch — remove from Doc-7E |
| MINOR-1 `credit_lead_account` actor leg | MINOR | Content Patch — confirm buy vs System-credit |
| MINOR-2 subscription Doc-4M transition set | MINOR | Content Patch — bind edges by pointer |
| NITPICK-1 activate_plan → Doc-7H note | NIT | Content Patch — cross-reference |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 1 MAJOR + 2 MINOR open → **Content Patch required**, then short closure check, then Content Freeze Audit → Doc-7E FROZEN.

*End of Content Pass-2 Independent Hard Review. Nothing coined; no frozen document edited. The MAJOR is a genuine wrong-actor/ownership misbinding (`activate_plan` is Admin catalog governance, not a user account action) caught against the Doc-5I BC-BILL-1 Admin-command leg.*
