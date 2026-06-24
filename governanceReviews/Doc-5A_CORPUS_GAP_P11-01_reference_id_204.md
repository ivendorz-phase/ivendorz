# CORPUS GAP — `GAP-D5A-P11-01` — `reference_id` carriage on no-body (`204`) responses

| Field | Value |
|---|---|
| ID | `GAP-D5A-P11-01` |
| Raised by | Doc-5A Pass-11 (Appendix A, CHK-5A-042 verification) |
| Status | **RESOLVED — human ruling 2026-06-24: Option 1 (Doc-4A clarifies C-05).** Patch `PATCH-D4A-C05-204` created (`generatedDocs/Doc-4A_Patch_C-05-204_v1.0.md`); pending Architecture-Board ratification into the frozen corpus. |
| Class | CORPUS GAP (conflict between frozen authorities) |
| Nature | **Architecture-touching** — resolution is a corpus-precedence decision, **outside Doc-5A's authority** (`Gov-Note §7`; `Master Architecture §22.7`). Doc-5A invents nothing. |
| Blocks | Doc-5A freeze gate disposition (Step 8) — must be ruled before the Freeze Readiness Audit closes. |

## Statement

`Doc-4A §22.1 C-05` requires the platform-assigned `reference_id` to be present in **every contract response** (success and error), as the linkage between the response, the audit record, and the idempotency key.

`204 No Content` (Doc-5A §5.5, bound to §4.0 / `Doc-4A §10`) is a **no-body** outcome. The corpus defines `reference_id` **only as a body field** — the success body (Doc-5A §5.6), the error envelope (Doc-5A §6.1 / `Doc-4A §12.1`), and the audit linkage (`Doc-4A §17.2`). **No header carriage for `reference_id` is defined anywhere in the frozen corpus.**

Therefore the carriage of `reference_id` on a no-body (`204`) response is **undefined**: a frozen "every response" requirement (C-05) cannot be satisfied by a frozen no-body status (`204`) under the only defined carriage (body), and no alternative carriage exists.

## Conflicting authorities

| Authority | Says | Tension |
|---|---|---|
| `Doc-4A §22.1 C-05` | `reference_id` in **every** response | demands it on a 204 |
| Doc-5A §5.5 / §4.0 / `Doc-4A §10` | `204` = **no body** | nowhere to put it |
| Doc-5A §5.6 / §6.1 / `Doc-4A §12.1` / §17.2 | `reference_id` defined **only** as a body field | no header form exists |

## Candidate resolutions (for the Board — Doc-5A does not choose)

1. **Doc-4A clarifies C-05 scope** — e.g. "every response **that carries a body**", explicitly exempting no-body statuses. *(Doc-4A clarification patch; human-approved.)*
2. **No-204-when-`reference_id`-required realization constraint** — a Doc-5A rule that a contract requiring the C-05 linkage resolves a no-body outcome to `200` with a minimal `{ "reference_id": … }` body, never `204`. *(Pure realization; but it narrows §5.5's 204 use — needs Board sign-off that it does not re-decide §5.5.)*
3. **Header carriage for no-body responses** — define a `reference_id` response header for `204`. *(Introduces a new standard header → §4.4 + Appendix B amendment; architecture-touching.)*
4. **Accept as documented exception** — record that `204` responses are a known, ruled exception to C-05 carriage, pending a future Doc-4A clarification. *(No code-affecting change; explicit risk acceptance.)*

## Required action

Architecture / API Governance Board (with human approval) rules among the above. The ruling is recorded here and carried into:
- `Doc-5A_Freeze_Readiness_Audit_v1.0.md` (disposition),
- the relevant patch (Doc-4A clarification, or a Doc-5A §5/§6 realization amendment, or Appendix B header amendment) **only if** the ruling authorizes it.

**Until ruled, Doc-5A CHK-5A-042 stands scoped to body-bearing responses; no `204` carriage mechanism is invented.**

## Ruling (2026-06-24)

**Option 1 — Doc-4A clarifies C-05.** C-05 is clarified to "every response **that carries a body**"; `204 No Content` is explicitly exempt (linkage maintained server-side via the audit record §17.2 + idempotency/correlation identifiers). Implemented as additive clarification **`PATCH-D4A-C05-204`** (human-approved; pending Architecture-Board ratification). `CHK-5A-042` (already scoped to body-bearing responses) now matches clarified C-05; no Doc-5A mechanism invented. GAP **closed** pending ratification.
