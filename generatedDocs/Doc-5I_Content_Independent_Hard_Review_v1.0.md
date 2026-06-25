# Doc-5I — Monetization / Billing (M7) — Content Independent Hard Review v1.0

| Field | Value |
|---|---|
| Reviews | Full Doc-5I content — `Doc-5I_Content_v1.0_Pass1.md` (§0–§3), `…Pass2.md` (§4–§6), `…Pass3.md` (§7–§11 + Appendix A) — 32 contracts |
| Stance | Independent board-level adversarial review of the **assembled** content. Traced against `Doc-4I_FROZEN_v1.0` §HB-1…6 + §H, `Doc-5A §5.5/§5.6/§6.2/§8`, `Doc-4A §9.6/§9.7/§12.2`, `Doc-5I_Structure_v1.0_FROZEN.md` |
| Prior gates | Pass-2 Hard Review (5 BLOCKER, all resolved) + Focused Re-Review (RR-B1/RR-B2, resolved) + Doc-4I field-trace correction round |
| Verdict | **CONDITIONAL PASS** — 0 BLOCKER · 0 MAJOR · 4 MINOR · 4 NITPICK. Content is wire-conformant; **content freeze is gated only by the two carried human-approval ESC items**, which are frozen-corpus matters, not authoring defects |
| Findings | **0 BLOCKER · 0 MAJOR · 4 MINOR · 4 NITPICK** + 2 open freeze gates (`[ESC-BILL-ADMINSCOPE]`, `[ESC-BILL-ACTIVATE]`) |

> **Headline:** the prior review cycles did their job. Error taxonomy, response envelope, pagination grammar, prohibited-field discipline, and Doc-4I field/output/error tracing are all sound across the three passes. The remaining findings are accuracy/consistency cleanups, not conformance breaks. Two real freeze gates remain — both corpus conflicts correctly carried, not locally resolvable.

---

## What was verified solid (no change)

- **Error taxonomy:** every error table uses `Doc-5A §6.2` classes at fixed statuses; zero `BAD_REQUEST`; `VALIDATION`=400; `STATE`/`CONFLICT`=409; `REFERENCE`/`BUSINESS`=422. Doc-4I validation-table reclassifications correctly applied (catalog missing-id → `REFERENCE 422`; duplicate slug → `BUSINESS 422`; one-active-per-org → `STATE 409`).
- **Doc-4I field tracing:** representations match `§HB` outputs verbatim — `status` (not `state`), `price`, `slug`/`default_value`, `is_active` marketing flag, `value_jsonb`, `auto_renew`, `human_ref INV-P-…`, `{transaction_id,…,balance}`, `{referral_id,state}`. No reshaping.
- **Envelope + pagination:** §3.9 `{result|items, page_info, reference_id}`; `page_size`+`cursor`; bounds via `[ESC-BILL-POLICY]`, never literal. Consistent Pass-2→Pass-3.
- **Actor model:** reads User-only (Doc-4I §HB-4.2/5.4/6.3); actor-branched commands realize the User leg only, System leg in-process (R11); org context server-derived, never a request field (§9.7).
- **Fences:** R5 firewall, R6 platform-≠-trade, R8 gateway-callback, R10 entitlement-service-authority — all stated as wire constraints; §10 5-protocol fence + flag-and-halt.
- **Partition closure:** 26 caller (§4:8 · §5:4 · §6:1 · §7:4 · §8:4 · §9:5) + 6 out-of-wire = 32, each once. Correct.

---

## MINOR

### m-01 — §3.8 canonical error table is incomplete, and Pass-3 §11.1 misstates its contents
**Where:** Pass-1 §3.8 table lists only `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, CONFLICT, BUSINESS, REFERENCE, QUOTA`. But Pass-3 §7.0 and §11.1 reference `DEPENDENCY → 503` and `SYSTEM → 500` as governing classes, and §11.1's Error-map row claims "**§3.8 table; … DEPENDENCY=503, SYSTEM=500**" — yet those rows are **not in** §3.8.
**Authority:** `Doc-5A §6.2` closed set includes `DEPENDENCY (503)`, `SYSTEM (500)`, `RATE_LIMITED (429)`, `ASYNC_PENDING`. Doc-4I §11 error tables list `DEPENDENCY`/`SYSTEM` on every contract.
**Fix:** add `DEPENDENCY (503)`, `SYSTEM (500)` rows to the §3.8 table (and a note that `RATE_LIMITED (429)`/`ASYNC_PENDING` are defined upstream, not used by M7 today). Correct the §11.1 claim so it does not assert the table contains rows it lacks.

### m-02 — "minor units" is an unstated realization convention on money fields
**Where:** Pass-2 `price` ("minor units"), Pass-3 `amount`/`points`/invoice `amount` ("minor units").
**Authority:** `Doc-4I §HB-1.1/4.1/5.1/6.1` declare these `numeric` with **no unit**; CLAUDE.md §2 only says "currency stored per value field." Asserting "minor units" is a representation decision Doc-4I does not make.
**Fix:** either bind a corpus money-representation rule by pointer, or label the choice `[realization convention]` (as Doc-5A does for its own realization conventions) and apply uniformly. Do not present an unstated unit as if Doc-4I-derived.

### m-03 — fabricated-looking `CHK-5A` identifiers in §11.1
**Where:** Pass-3 §11.1 cites `CHK-5A-04x` (path grammar row) and `CHK-5A-0xx` (envelope row).
**Authority:** `Doc-5A_Content_v1.0_Pass11.md` defines the stable `CHK-5A-xxx` set. `04x`/`0xx` are placeholder patterns, not real IDs — anti-invention optics in the very band that attests anti-invention.
**Fix:** cite the actual checklist IDs from Doc-5A Pass-11 (the real ones already used elsewhere — `CHK-5A-070/071/121` — are correct), or generalize to `Doc-5A §5.2/§5.3` / `§5.6` pointers. Do not print placeholder IDs.

### m-04 — `credit_reward` User leg performs `direction=redeem` on a "credit-reward" route (clarity)
**Where:** Pass-3 §9.2 `billing.credit_reward.v1` — path `/billing/reward-account/credit-reward`, User-leg request `direction: "redeem"`.
**Issue:** Doc-4I-accurate (one contract-ID; System=credit, User=redeem), but a route literally named `credit-reward` whose **only** caller-wire action is a *redeem* will read as a contradiction to an implementer and invites a wrong rejection (e.g. blocking `redeem` on a "credit" route). Not a conformance break — the structure §2 fixed the slug.
**Fix:** add one explicit sentence: the slug is the Doc-4I contract-ID name; the User wire carries `direction=redeem` (System leg = `credit`); both are valid on this single contract. Keep the token; clarify the artifact.

---

## NITPICK

### n-01 — `direction` (a Doc-4I required input) omitted from credit/debit_lead_account requests
Doc-4I §HB-4.1 lists `direction` as **required**. The wire omits it ("fixed by the contract slug"). Defensible (the slug determines it), but state explicitly: `direction` is **server-set from the contract**, not dropped — so the realization is not read as omitting a required input.

### n-02 — System legs of actor-branched contracts lack a realization pointer
Inline notes say the System leg is "in-process." Add a one-line pointer (as §10 does) that System-leg realization is code / Doc-6 — for symmetry, so the System legs are not read as unspecified.

### n-03 — `track_referral` `referred_organization_id` → `REFERENCE 422` may look like a non-disclosure leak
Doc-4I §HB-6.2 stage-7 **mandates** `REFERENCE` (definitive) for `referred_organization_id` (vs `NOT_FOUND` for the referrer's own `referral_id`). This is correct realize-never-redecide, but a reviewer could mistake it for a §7.5 leak. Add a half-line: the `REFERENCE` classification is Doc-4I-mandated (the referred org is a referenced entity, not the actor's protected resource).

### n-04 — Appendix A is thin vs the per-band table it points to
Appendix A defers to §11.1 (correct — attestations only, no normative behavior). Fine, but consider a one-line per-band PASS echo so the Appendix is self-contained for the freeze-audit reader.

---

## Open freeze gates (not findings — corpus matters, correctly carried)

| Gate | Status | Why it blocks content freeze |
|---|---|---|
| `[ESC-BILL-ADMINSCOPE]` | Carried, unchanged | Structure §3 "Admin reads any org" **conflicts** with Doc-4I §HB-2.5/3.3/4.2/5.4/6.3 (reads User-only). Resolved either by re-scoping the structure §3 grant to catalog reads (additive structure patch) or adding an Admin actor to Doc-4I (additive Doc-4I patch) — **human approval**, not a Doc-5I decision |
| `[ESC-BILL-ACTIVATE]` | Carried, unchanged | `status` `draft→active` edge (Doc-2 §3.8) has **no realizing Doc-4I BC-BILL-1 contract** (create→draft, update=marketing fields, retire→retired). Needs an additive Doc-4I attribution/contract — **human approval** |

Both are dispositioned correctly: flagged, escalated, **not locally fixed** (per the authoring instruction). They are the legitimate content-freeze blockers — the Content Freeze Audit cannot certify until they are dispositioned by human-approved additive patches (or an explicit governance decision that the User-only realization stands and the structure §3 grant is corrected).

---

## Required actions before Content Freeze Audit

1. **m-01:** complete the §3.8 table (`DEPENDENCY`/`SYSTEM`; note `RATE_LIMITED`/`ASYNC_PENDING`); fix the §11.1 mis-citation of §3.8 contents.
2. **m-02:** bind or label the "minor units" money convention.
3. **m-03:** replace placeholder `CHK-5A-04x/0xx` with real IDs or section pointers.
4. **m-04 / n-01…n-04:** clarity one-liners (credit_reward redeem artifact; `direction` server-set; System-leg → Doc-6 pointer; `REFERENCE` Doc-4I-mandated note; optional Appendix A echo).
5. **Gates:** escalate `[ESC-BILL-ADMINSCOPE]` + `[ESC-BILL-ACTIVATE]` to the Architecture/API Governance Board for human-approved additive disposition. **Do not** resolve in Doc-5I.

---

*Independent review. The three-pass content is conformant to Doc-5A and traces verbatim to Doc-4I; the patch history (5 BLOCKER → re-review RR-B1/B2 → Doc-4I correction round) converged. No authoring defect blocks freeze — only the two carried corpus conflicts do. Recommend: apply the MINOR/NITPICK patch, then route the two ESC gates for human disposition before the Content Freeze Audit.*
