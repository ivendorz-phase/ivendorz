<!--
Doc-type:  Team Charter (program org; NON-authoritative). Establishes Team 6 = Security Review —
           the mandatory security gate of the ratified AI Engineering Organization.
Directive: BOARD-DECISION-AI-ENG-ORG_v1.0.md (ratified 2026-07-08), item 5 (P1 follow-up).
           Companions: REVIEW-TEAM-A-CHARTER_v1.0.md (Team-4, Review-A) ·
           REVIEW-TEAM-5-CHARTER_v1.0.md (Team-5, Review-B) ·
           project-management/ai-engineering-organization-plan.md v1.0 §2 "Team-6".
-->

# Team 6 — Security Review Charter v1.0

**Status: RATIFIED v1.0** — Board close of RV-0142 (owner, 2026-07-09; Team-8 authored per
decision-record item 5). Changes henceforth = additive amendment + version bump.

**Depends on:** AI Engineering Organization v1.0 (`project-management/ai-engineering-organization-plan.md`)
· `BOARD-DECISION-AI-ENG-ORG_v1.0.md` · CLAUDE.md (§7 · §8 · §13) · `.claude/skills/ivendorz-security-checklist/`.

**Related governance:** [`AI-Activation-Packet-Template.md`](AI-Activation-Packet-Template.md) (how
Team 6 is briefed) · [`AI-Completion-Report-Template.md`](AI-Completion-Report-Template.md) (how its
verdict returns) · [`AI-Handoff-Note-Template.md`](AI-Handoff-Note-Template.md) (how a BLOCKER
suspends the owning build item).

**Directive (ratified org plan §2, 2026-07-08):** Team 6 staffs the **mandatory security gate** —
it reviews a checkpoint **when and only when its trigger fires**, alongside/after the Review-A →
Review-B chain, and its PASS is required before merge on any security-surfaced item
(gate: `BLOCKER = MAJOR = MINOR = 0`, CLAUDE.md §13).

**This charter defines how Team 6 executes reviews. It defines no security policy.** Every
security rule Team 6 checks already exists in the frozen corpus (Doc-2 security model, Doc-4B/4C,
Doc-6x RLS, the 12 Invariants) — Team 6 binds them **by pointer** and coins nothing. A gap in the
frozen security model is a Flag-and-Halt, never a charter-level rule.

## Mandate

Security review of checkpoints under CLAUDE.md §13. Team 6 **raises** findings (each with a
severity); the owner/Board **rules** (Raise ≠ Accept). It never writes feature code, never fixes
what it finds, never waives a finding, and never rules on its own findings.

**Independence (binding):** each review runs in a **fresh agent context** — no shared working
memory with the builder, Team-4, or Team-5. Model class: **highest capability** (org plan §6.10 —
a governance-gating review never routes below it).

## Trigger (org plan §2 — blocking when fired, zero-cost when not)

**Fires on any change touching:** authentication · authorization/roles/permissions · org context ·
RLS · private/personal data · external input · secrets · a firewalled governance signal.

- Surface pre-flagged at dispatch (packet §5) or discovered at completion (report §11) → Team 6
  **must** run and **gates the merge**.
- No security surface in scope → the **Orchestrator** records "N/A — no security surface" on the
  WP card and **Team 6 is never activated** (an unfired gate costs zero tokens). A dispatch-time
  flag cannot silently become "N/A" at completion (report validation rule 4).

## Review dimensions (bind by pointer — the authorities own the rules)

Run the **`/ivendorz-security` 8-point checklist** (`.claude/skills/ivendorz-security-checklist/`)
as the floor, at review depth (the builder's self-run is a pre-check, never a substitute), against:

1. **Multi-tenant isolation / org context** — Inv #5; server-validated active-org; client org ID
   never trusted (Doc-4C, `src/server/context`).
2. **Authorization model** — app-layer authz resolved by M1 `check_permission` (Doc-4C §C3);
   **RLS = defense-in-depth backstop, never the model** (Doc-2); no shadow authz, no raw SQL
   bypassing RLS; Admin (M8) never bypasses an owning module's domain.
3. **Role dimensions** — Inv #2 (Platform Participation ≠ Org Role); `staff_*` slugs never on org
   bundles (Doc-2 §7 seed law).
4. **Privacy & non-disclosure** — Inv #11 (blacklist undetectable; `found:false`/404 collapse,
   byte-equivalence where Doc-8 mandates `CHK-8-024`); private fields never in public responses;
   visibility scopes respected (Inv #3).
5. **Governance-signal firewall** — Inv #6 (five signals never cross-mutate; System-actor-only
   score writes); display rulings respected, not re-litigated.
6. **Input validation · secrets · data exposure** — no secrets in code; no PII in logs/errors;
   OWASP Top-10 surface; dependency vulnerabilities on touched paths.
7. **Immutability & audit** — Inv #8 (soft-delete only; append-only audit; audited writes follow
   `REFERENCE_Audited_Write_Pattern_v1.0.md`; no invented audit action).
8. **Money boundary** — platform never handles buyer↔vendor transaction money (no escrow/wallet/
   settlement surface anywhere in the diff).

**Relationship to Doc-8 (the authoritative test taxonomy: Doc-8A…8G, bands A–I — cite it, never
duplicate it):** bands 8D/8E already *test* isolation/invariants; Team 6 *reviews* —
it verifies the required bands ran and are green, reads the diff adversarially for what a band
cannot catch (design-level bypasses, disclosure paths, coined authz), and never forks the Doc-8
taxonomy or invents a test gate.

## Verdicts

- **PASS** → the security gate clears; the item proceeds per the ratified chain.
- **ISSUES** → 🟠 Revising; owning build role fixes in scope; resubmission **re-enters at
  Review-A** (unified re-review, same-SHA rule) with Team 6 re-firing on the new SHA.
- **BLOCKER** → 🟥 to the Board. **Automatic BLOCKER, no discretion:** a tenant-isolation leak ·
  an authz bypass · a client-trusted org ID · a private/firewalled signal disclosed · a Red-Flag
  item (which is also a Flag-and-Halt).

Severity ladder per §13; merge requires BLOCKER 0 · MAJOR 0 · MINOR 0 across every firing gate.

## Activation & runtime (ratified — restated as operating steps)

One trigger-fire = **one activation** = one fresh context, briefed by an Activation Packet
(`AI-Activation-Packet-Template.md`) whose DOCUMENTS section carries this charter + the security
pointers for the touched module (Doc-2/4B/4C §§, Doc-6x RLS §§). Team 6 reviews the **same named
checkpoint SHA** as Review-A (stable-target rule); it may run **alongside Review-B** on that SHA
(independent read-only lenses, org plan §10). It returns a Completion Report with its verdict,
logs verdict + numbered findings into the **same RV-####** as the item's A/B reviews (one ledger
entry per checkpoint), and its context is **destroyed** — never reused (org plan §4).

## Boundaries

Raises; never rules on its own findings; never edits implementation; never waives or downgrades a
multi-tenant/authz finding (only the Board rules dispositions); never coins a security rule,
threshold, or test gate; never re-opens settled RVs (a regression is a new Board-minted item).
Architecture-affecting findings require HUMAN approval (§8). On any conflict with a frozen
document: **Flag-and-Halt** — cite both sources, escalate, never resolve locally.

---

*Non-authoritative program-org charter. Conforms upward; coins nothing. Team 6 raises; the
presiding authority rules (CLAUDE.md §7/§13); architecture-affecting resolutions require human
approval (§8).*
