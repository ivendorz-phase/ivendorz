# Doc-6J — M8 Admin Operations (`admin`) Schema Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-6J Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | **M8 — Admin Operations** (`admin` schema) — the **authoritative event catalog (Doc-4J)**; **"Admin decides, owning module owns"**; the ban authority (emits `VendorBanned`); **`link_suggestions` never vendor-visible** |
| Realizes | **Doc-2 §10.9** — **10 tables / 5 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A 37/37); **Doc-2 v1.0.3 = binding *what*-authority**; consistent-with Doc-5J; consumes Doc-6B (`core`) + Doc-6C/6D/6F/6G (UUID + event); Doc-4J (catalog) |
| Freeze evidence | `Doc-6J_Content_Freeze_Audit_v1.0.md` — PASS; 0 open BLOCKER/MAJOR/MINOR; 7 phases PASS. Cross-pass `Doc-6J_Content_Hard_Review_v1.0.md` — 0 BLOCKER/MAJOR; owning-module + link non-disclosure verified end-to-end |

---

## Effective set (the authoritative Doc-6J)

| Artifact | Role |
|---|---|
| `Doc-6J_Structure_v1.0_FROZEN.md` | Frozen structure — AD-CR1–CR12, 10-table partition, Admin-decides/owning-module-owns model, ban authority + link non-disclosure, state machines, Appendix-A map |
| `Doc-6J_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-6J_Content_v1.0_Pass1.md` | §0–§2 RLS model · Moderation & Bans (`ban_actions`→`VendorBanned`) · Suggestions (`link_suggestions` staff-only) |
| `Doc-6J_Content_v1.0_Pass2.md` | Import (jobs + append-only rows) · Verification Tasks (work-item; decision in M5) · Outreach (`content_jsonb` interim) |
| `Doc-6J_Content_v1.0_Pass3.md` | §4 state (M8 = authoritative catalog) · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A (37/37, 0 FAIL) |
| `Doc-6J_Content_Hard_Review_v1.0.md` | Cross-pass review — 0 BLOCKER/MAJOR; owning-module + link non-disclosure verified end-to-end; 2 OBSERVATION by-design |
| `Doc-6J_Content_Freeze_Audit_v1.0.md` | Content freeze certification (PASS) |

---

## What Doc-6J realizes (the `admin` schema)

- **10 tables / 5 groupings** (Doc-2 §10.9), columns verbatim: Moderation & Bans, Suggestions (+link), Import (+rows), Verification Tasks, Outreach.
- **Admin decides, owning module owns** — M8 holds the **admin work-item + emits the decision event**; it **writes no owning-module authoritative table**. Ban → M2 (`VendorBanned`); verification decision → M5 (`trust.verification_decisions`); link confirm → M4 (`operations.private_vendor_records` via Operations service); category/vendor import → M2.
- **The ban authority** — `ban_actions` (polymorphic subject; `public_banner`; `state active/lifted/expired`; column-scoped immutable) **emits `VendorBanned`** (Doc-5J's single §8 event) → M2 reflects `vendor_profiles.status=banned` + M3 routing excludes (structural — Invariant #11). The public banner is M2's reflected surface.
- **`link_suggestions` never vendor-visible** (A-03) — staff-only; the private↔public link candidate is never exposed; confirmation writes the link columns on M4 via service (linking never moves/exposes private data). CHK-6-022 in-scope.
- **Verification tasks** — M8 work-item/queue (`verification_record_id`→M5); the decision lives in `trust.verification_decisions` (M5; `verification_task_id` ref). **Import** — `import_jobs` + append-only `import_rows` (entities created in the owning module via service). **Outreach** — interim `content_jsonb` (`[ESC-ADMIN-SCHEMA-OUTREACH]`).
- **M8 = the authoritative event catalog (Doc-4J)** — no event coined; `VendorBanned` is the single §8 event. **No `human_ref`** (CHK-6-002 N/A); cross-module = bare UUID; coins nothing.

## Carried items

`DR-6-CORE` (consumed) · `DR-6-STATE` (machines) · `DR-6-API` (Doc-5J Band H) · DD-MKT (ban/category) / DD-OPS (link confirm) / DD-TRUST (verification) · **Admin-decides/owning-module-owns** (realized) · **`link_suggestions` non-disclosure** (realized — in-scope CHK-6-022) · **`[ESC-ADMIN-AUDIT]`** (admin audit actions — M8 owns the Doc-4J §9 catalog; bind there) · **`[ESC-ADMIN-SCHEMA-OUTREACH]`** (outreach columns — bind via Doc-4J/Doc-5J or admin-runtime) · `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.7). Carry-forward to **Doc-8**: RLS positive/negative/cross-tenant + the link-non-disclosure byte-equivalence + the ban-event-flow (Doc-6A §11.5) — schema satisfiable.

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (2 MAJOR — owning-module boundary + link non-disclosure) → v0.2 → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1/2/3 each per-pass-reviewed (link non-disclosure, ban owning-module, ban immutability, verification owning-module, import-row immutability, outreach anti-coining, 043 catalog clarification) · **cross-pass Content Hard Review** (0 BLOCKER/MAJOR — owning-module + link non-disclosure verified end-to-end; 2 OBSERVATION by-design) · Content Freeze Audit (PASS).

---

*Doc-6J (M8 `admin` schema) is FROZEN. Realizes Doc-2 §10.9's 10 tables on PostgreSQL/Supabase + Prisma `multiSchema` against frozen Doc-6A — the authoritative event catalog; Admin decides, owning module owns (M8 writes no owning-module authoritative table); the ban authority (emits `VendorBanned`); `link_suggestions` never vendor-visible; coins nothing. Carried: Admin-decides/owning-module-owns + link non-disclosure (realized) + `[ESC-ADMIN-AUDIT]` + `[ESC-ADMIN-SCHEMA-OUTREACH]`. On any conflict with Doc-2/Doc-6A or the frozen corpus, the frozen corpus wins; flag-and-halt. Next: Doc-6K (M9 `ai`) — the FINAL Doc-6 module; regenerable derived artifacts only; the sole `ai.*` TTL hard-delete exception.*
