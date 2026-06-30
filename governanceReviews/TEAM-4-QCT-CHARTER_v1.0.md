<!--
Doc-type:  Team Charter (program org; NON-authoritative). Establishes Team 4 = Quality & Conformance Team.
Directive: CTO, 2026-06-30 - governance-prep phase complete; Team 4 reassigned to standing QCT for the FE program.
-->

# Team 4 — Quality & Conformance Team (QCT) Charter v1.0

**Directive (CTO, 2026-06-30):** the governance-preparation phase is complete. **Team 4 is reassigned**
from governance prep to the standing **Quality & Conformance Team** for the frontend program. Four
parallel streams going forward:

- **Team 1** → Public Experience
- **Team 2** → Buyer Experience
- **Team 3** → Vendor Experience
- **Team 4** → **Cross-team Quality & Governance Review** (this charter)

## Mandate

Independent quality + conformance review across Teams 1–3, operating under **CLAUDE.md §13** (Review &
Findings Governance). Team 4 **raises** findings (each with a severity); the owning team's author or the
presiding authority (§7) **rules** (Raise ≠ Accept). Team 4 is a review function — it does not write
feature code, rule architecture, or freeze the corpus.

## Responsibilities

1. **Cross-team architecture reviews** — module boundaries, One-Module-One-Owner, `contracts/`-only surface, wired-vs-out-of-wire.
2. **Component-duplication detection** — extend the frozen kit; never duplicate a primitive ([[frontend-foundation-frozen]]); new pieces enter as `[ESC-7B-…]`.
3. **Design-system conformance** — Doc-7B tokens/primitives; `status-chip` from Doc-4M tokens; `currency-display`/`file-link`; light-default semantic tokens.
4. **Accessibility audits** — WCAG 2.1 AA; keyboard/focus/contrast; status never by colour alone; ARIA wired.
5. **Responsive verification** — desktop/tablet/mobile; low-bandwidth; Bn/En parity (numerals/dates/currency).
6. **Governance compliance** — the 12 invariants; byte-equivalence / non-disclosure (CHK-7-040); the firewall; Content ≠ Presentation; cursor-only lists; no invented slugs/states/audit-actions.
7. **Final milestone sign-off before commits** — the gate below.

## How it operates

- **Severity ladder (§13):** BLOCKER / MAJOR / MINOR / NIT / OBS. **Commit/merge gate = BLOCKER 0 · MAJOR 0 · MINOR 0**; NIT/OBS never block.
- **Per milestone, per team:** a conformance review → findings with dispositions (Validate-Findings gate) → **sign-off or block**. Verifies against the frozen corpus / Doc-7 / the kit on disk — never rubber-stamps.
- **Flag-and-Halt:** any conflict with a frozen document is escalated to the right authority (Architecture Board / API Governance Board / corpus reconciliation), **never resolved locally**.
- **Output:** signed conformance reviews + dispositions, not implementations.

## Boundaries

- Reviews and **raises**; the owning author / presiding authority **rules**.
- Does **not** modify frozen docs, the kit foundation, or module ownership; does **not** commit governance decisions or invent Board outcomes.
- **Architecture-affecting findings require HUMAN approval (§8)** — Team 4 escalates; AI/skill review does not substitute.

## Inaugural backlog

- Verify **Team-1 Public M1**, **Team-2 Buyer**, and **Team-3 Vendor UI M1** against this charter at their milestone gates.
- Shepherd the Vendor companion's open queues to their human gates — [`BOARD-SPRINT-VENDOR-FE-FREEZE_v1.0.md`](BOARD-SPRINT-VENDOR-FE-FREEZE_v1.0.md), [`API-GOV-INTAKE-VENDOR-FE_v1.0.md`](API-GOV-INTAKE-VENDOR-FE_v1.0.md), [`DECISION-MATRIX-VENDOR-FE_v1.0.md`](DECISION-MATRIX-VENDOR-FE_v1.0.md) — and apply rulings to the companion when they land.

---

*Non-authoritative program-org charter. Conforms upward; coins nothing. Team 4 raises; the presiding authority rules (CLAUDE.md §7/§13); architecture-affecting resolutions require human approval (§8).*
