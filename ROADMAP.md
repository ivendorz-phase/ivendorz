# iVendorz — Implementation Roadmap

| Field | Value |
|---|---|
| **Status** | NON-AUTHORITATIVE — mirrors program state; patched to match the corpus on conflict |
| **Date** | 2026-06-26 |
| **Authority** | `generatedDocs/00_AUTHORITY_MAP.md` · `Doc-5_Program_Governance_Note_v1.0` |
| **Conforms To** | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2…Doc-8 (all FROZEN) |

> On any conflict, the frozen corpus wins and this file is patched to match.
> **The entire design + realization + verification corpus is COMPLETE / FROZEN.** The project is in
> the **Development Decomposition** phase — the bridge from the frozen corpus to application code.
> The **Development Decomposition** has been produced
> (`generatedDocs/Development_Decomposition_v1.0.md`). Application code has **not** started; it is
> gated by the Doc-8 conformance fabric.

---

## Current State

| Program | Status |
|---|---|
| Master System Architecture · ADR Compendium | CANONICAL / FROZEN |
| Doc-2 (Domain Model) v1.0.3 · Doc-3 (RFQ/Operational Spec) v1.0.2 | FROZEN |
| Doc-4A…4M (API metastandard + 10 module contracts + state/event/integration authorities) | FROZEN (`Doc-4_SERIES_FROZEN_v1.0`) |
| **Doc-5A…5K** — API realization (metastandard + M0–M9) | **FROZEN** |
| **Doc-6A…6K** — Database realization (metastandard + M0–M9 schemas) | **FROZEN** |
| **Doc-7A…7H** — Frontend realization (metastandard + 7 surfaces) | **FROZEN** (`Doc-7_SERIES_FROZEN_v1.0`) |
| **Doc-8A…8G** — Test & Conformance realization (metastandard + harness + 5 suites) | **FROZEN** (`Doc-8_SERIES_FROZEN_v1.0`; authored-not-run) |
| **Development Decomposition** (`Development_Decomposition_v1.0.md`) | **PRODUCED** |
| Build Roadmap | NOT STARTED |
| Application Code | NOT STARTED (gated by the Doc-8 conformance fabric) |

> Carried `[ESC-*]` items (e.g. per-module audit/schema markers, `[ESC-7-API]` file-upload grant,
> `[ESC-6-DD7]` tenancy reconciliation) are tracked on named channels in
> `generatedDocs/00_AUTHORITY_MAP.md` and `generatedDocs/Program_Status_And_Roadmap.md` — none gate
> the Development Decomposition.

---

## Phase Sequence (where we are)

```
Architecture (Doc-2/3/4)        FROZEN ✅
   ↓
API realization (Doc-5)         FROZEN ✅
   ↓ (parallel) ↓
Database (Doc-6)  Frontend (Doc-7)  Test (Doc-8)   ALL FROZEN ✅
   ↓
Development Decomposition        PRODUCED ✅  ← Development_Decomposition_v1.0.md
   ↓
Build Roadmap                    NEXT
   ↓
Implementation (Code)            gated by the Doc-8 conformance fabric
```

The **Development Decomposition** (`generatedDocs/Development_Decomposition_v1.0.md`) is the
authoritative working reference for *what to build and in what order*: engineering streams,
per-module work packages, repository bootstrap (Wave 0), walking skeleton, dependency-ordered
implementation waves (M0→M1 serial → M2/M5/M6/M7 parallel → M3 moat → M4/M8 → M9), parallelization,
and acceptance gates (Doc-8 bands A–I). It coins nothing and fixes no dates.

---

## MVP Scope (v1)

> Tentative — must be ratified by Architecture Board + Product before the build phase begins.

**Must Have (MVP)**
- Vendor Profile & Catalog (M2)
- Vendor Verification (M5)
- RFQ Posting, Matching & Routing (M3)
- Quotation & Award (M3)
- Vendor Inbox / Messaging (M6)
- Subscription & Entitlements (M7)
- Admin Moderation & Config (M8)

**Not In MVP**
- Financing / Escrow (platform never handles transaction money — architecture invariant)
- Logistics
- Advanced AI Layer (M9 — reserved, regenerable artifacts only)
- Mobile App
- External webhook push API (ratified exclusion — Doc-5A Structure §decisions)

---

## Security Baseline

> Implementation policy. Architecture-level security owned by `Master Architecture §§13, 16, 22`
> and the frozen corpus. This section is the wire-up checklist for code — not restated architecture.

| Concern | Policy |
|---|---|
| Authentication | Supabase Auth; Bearer carriage only (Doc-5A §7.1); no session logic in contracts |
| Authorization | Server-side 3-layer check (`Doc-4A §6.1`); never derived from wire headers |
| Row-Level Security | Defense-in-depth backstop — NOT the authorization model (`Master Architecture §16`) |
| Secrets | Environment variables only; never in code, commits, or logs |
| Audit Logging | M0 owns; every mutation produces exactly one audit record (`Doc-4A §17`) |
| Rate Limits | POLICY-bound (`Doc-4A §19`); keys in `Doc-3 §12` — never hardcoded |
| Non-Disclosure | Blacklist/exclusion undetectable on the wire (Doc-5A §6.3, §8.7; Invariant #11) |

---

## Release Strategy

**Environments**

| Environment | Purpose | Deploy trigger |
|---|---|---|
| Local | Developer machine | `next dev` |
| Preview | PR-level Vercel preview | Auto on PR open |
| Staging | Pre-production integration | Manual promote |
| Production | Live | Manual promote + approval |

**Branch Strategy**
- `main` = production; protected; no direct push
- Feature branches off `main` → PR → review → merge
- Module boundaries = branch discipline (one module per PR preferred)

**Migration Policy**
- Schema changes: forward-only / expand-contract (`Doc-6A §11`); additive — no column drops in the same PR as a code change
- Rollback: Vercel instant rollback for the app layer; a bad schema change is undone by a compensating forward migration, never a down-migration
- Breaking API changes: surface-version bump per Doc-5A §12 — no silent breaks

**Feature Flags**
- M0 owns platform-level feature flags (`Doc-4B`)
- New surfaces shipped behind flags; flags removed after rollout confirmed

---

## Exit Gates (Phase Completion Criteria)

A phase does NOT close until ALL its gates pass. NITPICKs deferrable; BLOCKER / MAJOR / MINOR block exit.

| Gate | Closes when... | State |
|---|---|---|
| **G-1** Architecture | Doc-2/3/4 FROZEN | **Green** |
| **G-2** API realization | Doc-5A…5K FROZEN | **Green** |
| **G-3** DB realization | Doc-6A…6K FROZEN | **Green** |
| **G-4** FE realization | Doc-7A…7H FROZEN | **Green** |
| **G-5** Test & conformance | Doc-8A…8G FROZEN (authored-not-run) | **Green** |
| **G-6** Development Decomposition | Decomposition produced + registered | **Green** |
| **G-7** Build Roadmap | Milestones sequenced into executable engineering work | Pending |
| **G-8** MVP Ready | All MVP-scope modules code-complete; security baseline verified; Doc-8 suites green in CI | Pending |
| **G-9** Beta Ready | Staging stable; audit logging live; feature flags operational; no open SEV-1/SEV-2 | Pending |
| **G-10** Production Ready | Penetration test passed; SLA defined; runbook complete; rollback tested | Pending |

---

*Non-authoritative roadmap. On any conflict, the frozen corpus and `00_AUTHORITY_MAP.md` win.
Patch this file to match on any divergence.*
