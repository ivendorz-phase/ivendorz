-- W2-IDN-6.5 — the M1 §B.6 command-dedup / Idempotency-Key replay store (`identity.command_dedup`).
-- Forward-only (Doc-6A §11); M1's OWN schema (One Module, One Owner — no cross-schema reference).
--
-- FROZEN GROUNDING (the store's realization vehicle — reviewer anchors):
--   • Doc-4C §B.6 (PassB:58–60): every mutation declares `Idempotency: required` with a client-
--     supplied key + a `[DC-5]` dedup window; "Replay (same key) → cached response; no duplicate
--     audit record; no duplicate side effect (§14.3 joint rule)".
--   • Doc-6A §10.3 (Pass3:37–39): "The dedup store (idempotency-key → result/within-window) is
--     realized per the owning module's design — a DEDICATED DEDUP TABLE or a unique idempotency-key
--     column on the target aggregate (realization choice — §2.5), indexed for the window lookup.
--     The window duration is the POLICY key, never a literal."
--   • Doc-6C §6.1 (Pass3:95, the frozen owning-module design): "The dedup store (idempotency-key →
--     result, within window) is realized per the owning-module design (Doc-6A §10.3); the window
--     durations are the keys above" — Doc-6C Appendix A CHK-6-072 attests the store PERSISTED.
--   • Doc-5A §9.3 (Pass6:36): a safe replay returns "the same stored result, the same HTTP status,
--     and the same original reference_id" — fixing the stored-result column set below. §9.3 (Pass6:37)
--     assigns the dedup MECHANISM/LAYER/WINDOW to development documents — this realization.
--
-- VEHICLE CHOICE [Doc-6A §2.5 realization choice — discriminated, not preferred]: the DEDICATED
-- TABLE is the only §10.3 vehicle that satisfies Doc-5A §9.3 — an idempotency-key column on the
-- target aggregate (vehicle B) cannot store the replayed response (status/body/reference_id), cannot
-- dedup CREATE commands (no aggregate row exists yet), and would alter the frozen Doc-6C table
-- shapes. Physical specifics (names, types, the scope key) are §2.5 realization choices carrying no
-- Doc-2 authority; the table holds NO domain element (an operational replay cache — Doc-6A R2).
--
-- SCOPE KEY (replay-cache poisoning/bypass guard — Team-6 pre-flag): a cached response is replayable
-- ONLY to the same (contract, acting user, org-context) that produced it — a key collision across
-- principals must NEVER leak another caller's stored response (Doc-4A §7.5 non-disclosure). NULLS NOT
-- DISTINCT (PostgreSQL 15+, the Doc-6A §0.4 hosting-locked floor) makes the org-less (self/Admin)
-- scope collide correctly. NO FK: the store is an inert operational cache — rows must stay valid
-- through actor anonymization (users are never hard-deleted; no integrity edge is load-bearing).
--
-- WINDOW: `executed_at` anchors the `[DC-5]` window lookup (`identity.command_dedup_window` /
-- `identity.user_update_dedup_window` — Doc-3 v1.9 registered, read via `core.config_value_query.v1`,
-- NEVER a literal; unseeded until W2-IDN-7). A post-window row is OVERWRITTEN by the next execution
-- (Doc-5A §9.4: post-window behavior is development-owned; bounded operational update — the cache is
-- non-authoritative, Invariant #8 untouched).

CREATE TABLE "identity"."command_dedup" (
  "id"               uuid        NOT NULL,                        -- [Doc-6A §3.1] PK UUIDv7 (M0 generator, app-side)
  "contract_id"      text        NOT NULL,                        -- the frozen Doc-4C contract id (e.g. identity.create_delegation_grant.v1)
  "actor_user_id"    uuid        NOT NULL,                        -- the acting principal (scope leg; no FK — inert cache)
  "organization_id"  uuid,                                        -- server-resolved org context; NULL for self/Admin scope
  "idempotency_key"  text        NOT NULL,                        -- client-generated opaque key (Doc-5A §9.2; bounded at the wire)
  "response_status"  integer     NOT NULL,                        -- the stored HTTP status (Doc-5A §9.3)
  "response_body"    jsonb       NOT NULL,                        -- the stored §5.6 envelope INCL. the original reference_id (§9.3)
  "response_headers" jsonb,                                       -- stored standard infra headers (e.g. the create `Location`)
  "executed_at"      timestamptz NOT NULL DEFAULT now(),          -- the window anchor (overwritten on post-window re-execution)
  "created_at"       timestamptz NOT NULL DEFAULT now(),          -- [Doc-6A R5]
  "updated_at"       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "command_dedup_pkey" PRIMARY KEY ("id"),             -- [§2.5] name
  -- The replay scope key (poisoning guard): one stored response per (contract, actor, org, key).
  -- NULLS NOT DISTINCT so org-less scopes (self/Admin ops) dedup correctly (PG15+).
  CONSTRAINT "command_dedup_scope_key_uq"
    UNIQUE NULLS NOT DISTINCT ("contract_id", "actor_user_id", "organization_id", "idempotency_key")
);

-- RLS (Doc-6C §6.2a pattern; read == write scope → one FOR ALL, the ows/buyer_profiles idiom):
-- a principal touches ONLY its own dedup rows; the staff leg is the platform backstop. App-layer
-- access is the authorized path (the M1 dedup repository); RLS is defense-in-depth.
ALTER TABLE "identity"."command_dedup" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "command_dedup_actor" ON "identity"."command_dedup" FOR ALL
  USING (
    "actor_user_id" = current_setting('app.user_id', true)::uuid
    OR current_setting('app.is_platform_staff', true)::boolean IS TRUE
  )
  WITH CHECK (
    "actor_user_id" = current_setting('app.user_id', true)::uuid
    OR current_setting('app.is_platform_staff', true)::boolean IS TRUE
  );
