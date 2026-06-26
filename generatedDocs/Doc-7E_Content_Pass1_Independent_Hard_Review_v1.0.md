# Doc-7E — Content Pass-1 (§0–§4) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7E_Content_v1.0_Pass1.md` (§0–§4) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Doc-5C conformance |
| Verdict | **NOT YET PASS** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- **§2.2 no `create_user`** — verified vs `Doc-5C` (only `create_organization`/`create_role`/`create_delegation_grant`). The signup-has-no-frontend-create resolution is correct.
- §3.1 management bindings ↔ `Doc-5C §C4–§C7/§C10/§C11` (verified). CORRECT.
- §4 delegation `§C9` + server-side access check (R5/§6B). CORRECT.
- §1.2 seam (§C8 switcher = Doc-7C's, not realized here). CORRECT.

0 BLOCKER, 0 MAJOR. Three scope-precision refinements + one nit.

### MINOR-1 — §2.2 over-asserts "M1 provisions the record out-of-band"
The **verified** fact is narrow: **no frontend-callable `create_user`** exists, so the signup screen calls Supabase Auth and **coins no create command**. But §2.2 also asserts "the M1 user record is provisioned out-of-band by M1" — **how** the M1 record comes to exist (event-consumer / System provisioning) was **not verified** and is **M1's internal concern**, not Doc-7E's to assert.
**Required fix:** §2.2 narrow the claim to the frontend's scope — signup invokes Supabase Auth; **the frontend creates no user record and coins no `create_user`**; **how M1 materializes the user record is M1-internal and out of Doc-7E scope** (not asserted here). `[ESC-7-API-SIGNUP]` resolved from the frontend's side; any future wired onboarding command is `[ESC-7-API]`.

### MINOR-2 — §3 omits that `soft_delete_organization`'s cross-module cascade is System/out-of-wire (DC-1)
`soft_delete_organization` (§C5) triggers the **DC-1 cross-module cascade** (org soft-delete → M2/M3), which `Doc-5C` (line 47) marks **Integration / out-of-wire**. The frontend calls only the **wired** `soft_delete_organization` command; it **does not orchestrate the cascade**.
**Required fix:** §3 note — the UI invokes the **wired** `soft_delete_organization`/`restore_organization` (§C5); the **DC-1 cross-module cascade is System/out-of-wire** (`Doc-5C`), never frontend-orchestrated. (Soft-delete only — Invariant #8; no hard delete.)

### MINOR-3 — §2.3 invitation-acceptance flow spans `(auth)`→`(app)`
§2.3 places `accept_invitation` in `(app)`, but an **invited, not-yet-registered** user enters via an **invitation link** (`(auth)`), signs up, **then** `accept_invitation` runs in `(app)`. The entry path spans both areas.
**Required fix:** §2.3 clarify the invitation flow: invite link (`(auth)`) → authenticate/sign up → `accept_invitation` (`(app)`); the screen placement spans the two areas (Doc-7C owns the route placement, Doc-7E the screens).

### NITPICK-1 — distinguish login-time 2FA challenge from `update_user_2fa_settings`
§2/§3 should not conflate the **login-time 2FA challenge** (Supabase Auth, `(auth)`) with **`update_user_2fa_settings`** (§C4, authenticated management, `(app)`).
**Required fix:** one line noting the two are distinct (challenge = Supabase Auth auth-entry; settings = §C4 management).

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 §2.2 over-asserts M1 provisioning | MINOR | Content Patch — narrow to frontend scope |
| MINOR-2 §3 DC-1 cascade out-of-wire | MINOR | Content Patch — note cascade is System |
| MINOR-3 §2.3 invite flow spans areas | MINOR | Content Patch — clarify `(auth)`→`(app)` |
| NITPICK-1 2FA challenge vs settings | NIT | Content Patch — distinguish |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR. 3 MINOR open → **Content Patch required**, then short closure check, then Content Pass-2 (§5–§9 + Appendix).

*End of Content Pass-1 Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — bindings sound; three scope-precision defects (signup-provisioning over-assertion, org-cascade attribution, invite-flow areas).*
