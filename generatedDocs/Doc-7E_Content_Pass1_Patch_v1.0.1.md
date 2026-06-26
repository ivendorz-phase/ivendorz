# Doc-7E — Content Pass-1 **Patch v1.0.1** (applies Pass-1 Independent Hard Review) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7E_Content_v1.0_Pass1.md` (§0–§4) |
| Applies | `Doc-7E_Content_Pass1_Independent_Hard_Review_v1.0.md` (3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-1 **+ this patch** = clean §0–§4 |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Pass-2 (§5–§9 + Appendix) |
| Discipline | Additive; nothing coined; no frozen document edited |

---

## Changes

### C-1 — closes **MINOR-1** (signup provisioning scope)
§2.2 narrowed to the frontend's scope:
> **Verified:** no frontend-callable `create_user` exists. The signup screen **invokes Supabase Auth only and creates no user record / coins no `create_user`**. **How M1 materializes the user record is M1-internal and out of Doc-7E scope** — not asserted here. **`[ESC-7-API-SIGNUP]` is RESOLVED from the frontend side** (no frontend command to bind); any future wired onboarding command is `[ESC-7-API]` (additive Doc-5C patch, Board).

### C-2 — closes **MINOR-2** (org soft-delete cascade)
§3 (new §3.4) adds: the UI invokes the **wired** `soft_delete_organization` / `restore_organization` (§C5; **soft-delete only — Invariant #8, no hard delete**); the **DC-1 cross-module cascade** (org soft-delete → M2/M3) is **System / out-of-wire** (`Doc-5C`) and is **never frontend-orchestrated** — the UI calls the single wired command and reflects the resulting state.

### C-3 — closes **MINOR-3** (invite flow spans areas)
§2.3 clarified: the **invitation-acceptance flow spans `(auth)`→`(app)`** — an invited, not-yet-registered user enters via an **invitation link** (`(auth)`), authenticates/signs up, then **`accept_invitation`** (§C6) runs in `(app)`. Doc-7C owns the route placement across both areas; Doc-7E authors the screens.

### C-4 — closes **NITPICK-1** (2FA challenge vs settings)
§2 note added: the **login-time 2FA challenge** is **Supabase Auth** (auth-entry, `(auth)`); **`update_user_2fa_settings`** (§C4) is **authenticated 2FA management** (`(app)`). The two are distinct and not conflated.

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MINOR-1 signup provisioning scope | MINOR | C-1: narrowed to frontend (no create_user; M1 materialization out of scope) | **CLOSED** |
| MINOR-2 org soft-delete cascade | MINOR | C-2: wired command only; DC-1 cascade System/out-of-wire; soft-delete only | **CLOSED** |
| MINOR-3 invite flow areas | MINOR | C-3: `(auth)`→`(app)` span clarified | **CLOSED** |
| NITPICK-1 2FA challenge vs settings | NIT | C-4 | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** No new finding; no anchor regressed; nothing coined. `[ESC-7-API-SIGNUP]` resolved from the frontend side; `[ESC-IDN-DELEG-EXPIRY]` carried (reinstate deferred).

**Next pass:** Content Pass-2 (§5–§9 + Appendix) — account & billing views (§5), state-machine UI (§6), active-org/authz/non-disclosure (§7), data/baseline (§8), conformance & carried items (§9), view/contract-binding skeleton (Appendix).

*End of Content Pass-1 Patch v1.0.1 + Short Closure Check. Effective §0–§4 = Pass-1 + this patch. Additive; nothing coined; no frozen document edited.*
