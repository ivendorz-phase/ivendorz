# Page Standards — Definition of Done

**Non-authoritative.** Points to the frozen standards; coins nothing. Vocabulary + presets are owned
by [`shared_conventions.md`](../shared_conventions.md) (`SC`); gaps by
[`esc_registry.md`](../esc_registry.md). A page is **Ready for Review** only when every box below is
satisfied.

## Definition of Done checklist

- ☐ **Responsive** — mobile-first; verified at mobile / tablet / desktop (`SC` breakpoints).
- ☐ **Empty state** — present and honest (no fabricated data).
- ☐ **Loading state** — skeleton/spinner via kit presets (`SK-*`).
- ☐ **Error state** — via kit; branch only on allowed `error_class`, never on forbidden-vs-absent.
- ☐ **Not-found** — byte-identical to genuine absence (Doc-7A §8.2) where applicable.
- ☐ **Uses shared components** — from `src/frontend/` + surface `_components/`; **no new primitives**,
      no duplication, no design-system changes.
- ☐ **Mock data realistic** — industrial-procurement domain; plausible refs/units/currency (BDT).
- ☐ **Accessibility** — WCAG-AA: labels, focus order, contrast, keyboard paths.
- ☐ **No console errors / warnings** in dev render.
- ☐ **Guardrails honored** (below).

## Presentation-only guardrails (binding — by pointer)

- **Wired-contracts-only** (Doc-7A §3.7): consume only caller-facing wired Doc-5 reads; **never**
  internal-service contracts (`check_permission`, `resolve_entitlements`, `enforce_quota`).
- **Byte-equivalence / non-disclosure** (Doc-7A §8): a blacklisted/never-matched/forbidden state
  renders identically to genuine absence; no discriminating prop. Buyer-private CRM never leaks.
- **Received-only denominators**: counts use received/own-org sets — never routed/eligible/total or
  cross-tenant aggregates. **Cursor pagination** on every list; no grand totals.
- **Trust displayed, never computed** — **band-only**; never render a raw 0–100 score
  (`ESC-7G-SCORE-DISPLAY` / `ESC-7B-TRUSTSCORE`).
- **Capability = 4-flag matrix** (`can_supply/service/fabricate/consult`); **participation ≠ org-role**.
- **Server is final authority** — UI gates are UX only; entitlements read as boolean/numeric/enum,
  never plan-/role-name strings.
- **Neutral routing** — coin no new routes; follow Doc-7C/7D…7H topology; routes carry opaque IDs.
- **No invented perf budgets** — Doc-8 owns performance/testing; do not author acceptance criteria.
- **Admin (R5):** a page invokes a wired Admin command; the **owning module owns the effect** — no
  page writes Trust/Performance/Tier or makes matching/award decisions.
- **Money boundary:** post-award pages **record/confirm only** — no funds movement, escrow, or wallet.
- **Any gap** → cite the `esc_registry.md` handle and ship its interim; **never invent a contract**.
