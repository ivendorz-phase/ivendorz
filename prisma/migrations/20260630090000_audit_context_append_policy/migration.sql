-- ─────────────────────────────────────────────────────────────────────────────
-- Audit-records append-only context-bound INSERT policy (R-b realization)
-- Realizes: ESC-W2-AUDIT-RLS §7 = R-b · ADR-021 (Audit-Records RLS Asymmetry) ·
--           Doc-6B_Structure_Additive_Patch_v1.0.1 (APPROVED + folded 2026-06-30).
-- ─────────────────────────────────────────────────────────────────────────────
-- The realized `core.audit_records` RLS was a single platform-staff `USING`-only policy. Because
-- Postgres copies a policy's `USING` into the INSERT `WITH CHECK` when the latter is omitted, INSERT
-- was implicitly gated to `is_platform_staff IS TRUE` only — so a tenant-context mutation (server guard
-- sets `app.is_platform_staff = false`) could NOT satisfy its mandatory atomic in-tx audit obligation
-- (Doc-4B §B10 / Doc-4A §17.1). This migration adds a dedicated permissive `FOR INSERT` policy whose
-- `WITH CHECK` binds the row to the server-set request context. Permissive policies OR-combine, so the
-- effective INSERT admission becomes `(staff) OR (context-bound tenant)` — monotonic widening, never
-- narrowing. SELECT stays platform-staff-only (the existing `…_platform_staff` policies are UNTOUCHED);
-- UPDATE/DELETE stay closed (CR4′ immutability triggers). `organization_id` here is a WRITE-INTEGRITY
-- binding (prevents cross-tenant audit forgery), NOT a read-tenancy anchor — CR2 read posture unchanged.
-- `actor_type` pins the frozen lowercase `core.ActorType` label `'user'` (not `'User'`).
--
-- PARTITIONS: RLS does NOT inherit from the partitioned parent to its partitions. This policy is created
-- on the parent `core.audit_records` AND the DEFAULT partition `core.audit_records_default`. Every
-- operationally-provisioned monthly partition (`core.audit_records_YYYY_MM`) MUST likewise receive this
-- `…_context_append` INSERT policy alongside its `…_platform_staff` policy (partition-rotation runbook —
-- Doc-6B §3.1) — a partition with only the staff policy is a direct-to-partition append bypass for tenant
-- code. Forward-only (Doc-6A §11); the audit service appends via a NON-`RETURNING` insert (the staff-only
-- SELECT posture would otherwise abort `INSERT … RETURNING` with SQLSTATE 42501 — Deployment Constraint).

-- Parent table.
CREATE POLICY "audit_records_context_append" ON "core"."audit_records" FOR INSERT
  WITH CHECK (
    -- Tenant-user leg: row bound to the server-set request context (write-integrity, not read-tenancy).
    -- Fail-closed: an unset GUC → current_setting(...,true) = NULL → predicate not-true → rejected.
    (
      "organization_id" = current_setting('app.active_org', true)::uuid
      AND "actor_id"     = current_setting('app.user_id', true)::uuid
      AND "actor_type"   = 'user'::"core"."ActorType"
    )
    -- System / drainer / admin / bootstrap leg (System actor, no active-org context).
    OR current_setting('app.is_platform_staff', true)::boolean IS TRUE
  );

-- DEFAULT partition (RLS does not inherit — must be applied explicitly).
CREATE POLICY "audit_records_default_context_append" ON "core"."audit_records_default" FOR INSERT
  WITH CHECK (
    (
      "organization_id" = current_setting('app.active_org', true)::uuid
      AND "actor_id"     = current_setting('app.user_id', true)::uuid
      AND "actor_type"   = 'user'::"core"."ActorType"
    )
    OR current_setting('app.is_platform_staff', true)::boolean IS TRUE
  );
