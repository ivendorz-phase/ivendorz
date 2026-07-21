-- W3-COMM-GRW-1 (B2-2) — M1 `identity` SECURE DELIVERY STORE (forward-only; Doc-6A §11).
-- Completes the P1 Board carry on `identity.resolve_invitation_delivery_payload.v1`
-- (Doc-4C v1.0.3 §C13 — the signed-URL semantics: SHORT-LIVED / ONE-TIME / REPLAY-GUARDED, TTL =
-- the seeded `identity.growth_invite_delivery_url_ttl` POLICY key, Doc-3 v1.14 key 6).
--
-- MARKER BINDING (load-bearing — read before touching): Doc-6C v1.0.4 §5 pins the delivery-reference
-- resolution + signed-URL replay state as a §10.3-class OPERATIONAL store (the CHK-6-072
-- idempotency-store class): "a `delivery_reference_id → growth_invitation_id` entry written by
-- `create_invitation` in the issuing txn … plus the ONE-TIME signed-URL NONCE state (lifetime =
-- `identity.growth_invite_delivery_url_ttl`; consumed on first redemption — the replay guard).
-- Non-authoritative, regenerable, never a Doc-2 aggregate … the concrete PHYSICAL SHAPE … is
-- implementation scope under the Doc-4C contract owner — carried as an `[ESC-6-API]`-class flag."
-- This migration REALIZES that physical shape (two dedicated store tables) UNDER that carried flag:
-- the class, lifetime, and owner are the folded pins; only the shape is chosen here. The P1
-- mapping-only `invitation_delivery_refs` table is UNTOUCHED (mapping-only stays binding).
--
-- WHAT IS ADDED (both keyed on the existing `invitation_delivery_refs` store — intra-schema FKs only):
--   (1) identity.invitation_delivery_secrets — token CIPHERTEXT + AES-GCM nonce, written by
--       `create_invitation` in the SAME issuing txn (targeted invitations only). The encryption key
--       comes from env (`GROWTH_INVITE_DELIVERY_STORE_KEY`) and is NEVER persisted or logged. The
--       raw token therefore remains NEVER-PERSISTED-IN-PLAINTEXT (Doc-2 v1.0.10 §1 / GI-2 hold);
--       it is recoverable ONLY inside the M6-sole-caller delivery-payload resolve, for URL minting.
--   (2) identity.invitation_delivery_url_nonces — one row per MINTED signed URL: `expires_at` =
--       mint-time + the 15m POLICY TTL; `consumed_at` set once on first redemption (the atomic
--       replay guard). A fresh mint (each resolve / each retry re-dispatch) inserts a fresh nonce —
--       "a fresh short-lived signed URL is obtained; the stale one is never re-sent"
--       (Doc-4H GrowthDelivery Patch v1.0.1 §2).
--
-- RLS: staff-GUC-only (GI-3 — delivery plumbing, never a tenant surface; the
-- `invitation_delivery_refs` service-only precedent). Secrets: SELECT + INSERT only (no UPDATE/
-- DELETE policy — default-denied). Nonces: SELECT + INSERT + UPDATE (the consume leg is an UPDATE).
-- Forward-only, zero backfill; both tables start empty (pre-store P1 rows simply have no secret —
-- the resolve returns the TRANSIENT `identity_growth_invite_delivery_unavailable` for them).

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) identity.invitation_delivery_secrets — token ciphertext + nonce (§10.3-class store).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE identity.invitation_delivery_secrets (
  delivery_reference_id uuid NOT NULL,                                       -- [§2.5] PK = the operational delivery key (1:1 with invitation_delivery_refs)
  token_ciphertext      text NOT NULL,                                       -- [§2.5] AES-256-GCM ciphertext||tag, base64 — NEVER the plaintext token
  token_nonce           text NOT NULL,                                       -- [§2.5] the AES-GCM IV, base64 (per-row random; never reused)
  created_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invitation_delivery_secrets_pkey PRIMARY KEY (delivery_reference_id),
  CONSTRAINT invitation_delivery_secrets_ref_fk FOREIGN KEY (delivery_reference_id)
    REFERENCES identity.invitation_delivery_refs(delivery_reference_id)      -- [Doc-6A §5.2] intra-schema ONLY
);

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) identity.invitation_delivery_url_nonces — the one-time signed-URL replay state.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE identity.invitation_delivery_url_nonces (
  id                    uuid NOT NULL,                                       -- [§2.5] PK UUIDv7 — the nonce carried in the signed URL
  delivery_reference_id uuid NOT NULL,
  expires_at            timestamptz NOT NULL,                                -- [§2.5] mint-time + identity.growth_invite_delivery_url_ttl (POLICY read — never a DB literal, Doc-6A §10.2)
  consumed_at           timestamptz,                                         -- [§2.5] set ONCE on first redemption (the replay guard)
  created_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invitation_delivery_url_nonces_pkey PRIMARY KEY (id),
  CONSTRAINT invitation_delivery_url_nonces_ref_fk FOREIGN KEY (delivery_reference_id)
    REFERENCES identity.invitation_delivery_refs(delivery_reference_id)      -- [Doc-6A §5.2] intra-schema ONLY
);
CREATE INDEX invitation_delivery_url_nonces_ref_idx ON identity.invitation_delivery_url_nonces (delivery_reference_id);  -- [§2.5]

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS — staff-GUC-only service plumbing (the invitation_delivery_refs §5 precedent; GI-3).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE identity.invitation_delivery_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitation_delivery_secrets_service_read ON identity.invitation_delivery_secrets FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY invitation_delivery_secrets_service_insert ON identity.invitation_delivery_secrets FOR INSERT
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (no UPDATE/DELETE policy — default-denied; a secret is written once in the issuing txn.)

ALTER TABLE identity.invitation_delivery_url_nonces ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitation_delivery_url_nonces_service_read ON identity.invitation_delivery_url_nonces FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY invitation_delivery_url_nonces_service_insert ON identity.invitation_delivery_url_nonces FOR INSERT
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY invitation_delivery_url_nonces_service_consume ON identity.invitation_delivery_url_nonces FOR UPDATE
  USING      (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (no DELETE policy — default-denied; expired/consumed nonces are inert operational residue.)
