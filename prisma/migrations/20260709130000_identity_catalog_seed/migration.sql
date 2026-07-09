-- Doc-6C §5 (as patched `Doc-6C_Patch_v1.0.1`) — M1 Identity permission/role catalog seed.
-- `W2-IDN-2` — idempotent forward-only DATA migration (Doc-6A §11.3); no DDL. System-actor
-- authored (created_by/updated_by left NULL — house pattern, matches the `identity_init`
-- system-bundle roles seed and the `core_init` POLICY-key seed; row identity is incidental).
--
-- Content source = Doc-2 §7 (`Domain_Model_And_Database_Blueprint_v1.0.2.md` §7), by pointer;
-- Doc-6C coins nothing. COUNT is per the owner ruling `ESC-IDN-SLUGCOUNT` Option A
-- (`Doc-6C_Patch_v1.0.1`, 2026-07-09): **43 slugs = 36 tenant (`space='tenant'`) + 7 staff
-- (`space='staff'`)** — NOT the base-text "45/38" (a propagated counting error the patch
-- corrects; Doc-2 §7's enumeration was always the truth). Slug + space verbatim; none coined,
-- none renamed.
--
-- §1 — identity.permissions (43 rows). §2 — identity.role_permissions mapping for the 4
-- pre-seeded system bundles (Owner/Director/Manager/Officer — seeded by `identity_init`,
-- untouched here) per the Doc-2 §7 bundle-default (O/D/M/F) columns. The 7 `staff_*` slugs are
-- NEVER mapped to any org bundle (Invariant #2 — Platform Participation ≠ Org Role; the
-- `staff_*` space belongs to the platform-staff space, never an org role).
--
-- Bundle-default re-derivation notes (Doc-2 §7 prose cells, resolved cell-by-cell, none
-- ambiguous — no Flag-and-Halt required):
--   * `can_manage_users` ("O,D; M per bundle 'manage team'"): no separate slug exists for
--     "manage team" in §7's enumeration, so the parenthetical documents Manager's bundle-default
--     label for the SAME slug, not a distinct permission — Manager is mapped. Officer is not.
--   * `can_manage_vendor_profile` ("Category assignments / declared tier / capacity" row):
--     the same slug as the "Vendor profile edit / publish / presentation" row (§7 cites it
--     twice, one slug) — "tier change additionally audited" is an audit-logging note, not an
--     additional bundle dimension; mapping stays O,D,M for both citations.
--   * `can_use_messaging` / `can_raise_support_ticket` ("all active members"): all 4 bundles
--     (O,D,M,F) — "all" is read as literal-all-bundles per §7 prose, not a residual/undefined set.

-- ─────────────────────────────────────────────────────────────────────────────
-- §1 — identity.permissions catalog seed (Doc-6C §5.1, as corrected by Patch v1.0.1)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "identity"."permissions" ("id", "slug", "description", "space") VALUES
  -- tenant space (36) — Doc-2 §7 table rows, in table order
  (gen_random_uuid(), 'can_create_rfq',                 'RFQ create/draft (Doc-2 §7)',                                                  'tenant'),
  (gen_random_uuid(), 'can_approve_rfq',                 'RFQ approve/submit gate (Doc-2 §7)',                                           'tenant'),
  (gen_random_uuid(), 'can_view_rfq',                    'RFQ view own (Doc-2 §7)',                                                      'tenant'),
  (gen_random_uuid(), 'can_view_all_rfqs',                'RFQ view all org RFQs (Doc-2 §7)',                                             'tenant'),
  (gen_random_uuid(), 'can_cancel_rfq',                  'RFQ cancel (Doc-2 §7)',                                                        'tenant'),
  (gen_random_uuid(), 'can_approve_vendor_selection',    'Vendor selection approval (Doc-2 §7)',                                         'tenant'),
  (gen_random_uuid(), 'can_award_rfq',                   'RFQ award (Doc-2 §7)',                                                         'tenant'),
  (gen_random_uuid(), 'can_submit_quote',                'Quotation create/submit — vendor side; also via delegation grant (Doc-2 §7)',   'tenant'),
  (gen_random_uuid(), 'can_respond_to_rfq',               'RFQ invitation response (accept/formal decline) — vendor side; also via delegation grant (Doc-2 §7)', 'tenant'),
  (gen_random_uuid(), 'can_withdraw_quote',               'Quotation withdraw (Doc-2 §7)',                                                'tenant'),
  (gen_random_uuid(), 'can_manage_private_vendors',       'Private vendor CRM — records, notes, ratings, favorites (Doc-2 §7)',           'tenant'),
  (gen_random_uuid(), 'can_manage_vendor_status',         'Buyer vendor status — approve/conditional/blacklist (Doc-2 §7)',               'tenant'),
  (gen_random_uuid(), 'can_manage_engagements',           'Engagement lifecycle — open/update/close (Doc-2 §7)',                          'tenant'),
  (gen_random_uuid(), 'can_create_documents',             'Engagement documents (LOI/PO/challan/WCC) create (Doc-2 §7)',                  'tenant'),
  (gen_random_uuid(), 'can_approve_po',                   'PO / financial approval (Doc-2 §7)',                                           'tenant'),
  (gen_random_uuid(), 'can_record_payments',              'Trade invoices / payment records (Doc-2 §7)',                                  'tenant'),
  (gen_random_uuid(), 'can_approve_payment',               'Payment approval (Doc-2 §7)',                                                  'tenant'),
  (gen_random_uuid(), 'can_manage_finance_records',        'Finance records (Doc-2 §7)',                                                   'tenant'),
  (gen_random_uuid(), 'can_manage_templates',              'Document templates (Doc-2 §7)',                                                'tenant'),
  (gen_random_uuid(), 'can_manage_vendor_profile',         'Vendor profile edit/publish/presentation; category assignments/declared tier/capacity (tier change additionally audited) (Doc-2 §7)', 'tenant'),
  (gen_random_uuid(), 'can_publish_profile',               'Vendor profile publish (Doc-2 §7)',                                            'tenant'),
  (gen_random_uuid(), 'can_manage_users',                  'Membership / team management (Doc-2 §7)',                                      'tenant'),
  (gen_random_uuid(), 'can_manage_workflow_settings',      'Workflow settings (Doc-2 §7)',                                                 'tenant'),
  (gen_random_uuid(), 'can_view_billing',                  'Billing & subscription — view (Doc-2 §7)',                                     'tenant'),
  (gen_random_uuid(), 'can_manage_billing',                'Billing & subscription — manage (Doc-2 §7)',                                   'tenant'),
  (gen_random_uuid(), 'can_transfer_ownership',            'Ownership transfer — Owner-only (Doc-2 §7)',                                   'tenant'),
  (gen_random_uuid(), 'can_delete_organization',           'Organization delete — Owner-only (Doc-2 §7)',                                  'tenant'),
  (gen_random_uuid(), 'can_submit_verification',           'Verification submission — Owner-only (Doc-2 §7)',                              'tenant'),
  (gen_random_uuid(), 'can_manage_delegations',            'Delegation grants — issue/revoke for own vendor profile (Doc-2 §7)',           'tenant'),
  (gen_random_uuid(), 'can_use_messaging',                 'Threads / chat — all active members (Doc-2 §7)',                              'tenant'),
  (gen_random_uuid(), 'can_raise_support_ticket',          'Support tickets — all active members (Doc-2 §7)',                             'tenant'),
  (gen_random_uuid(), 'can_manage_leads',                  'Vendor lead pipeline — vendor side (Doc-2 §7)',                                'tenant'),
  (gen_random_uuid(), 'can_manage_products',                'Vendor products / catalog (Doc-2 §7)',                                         'tenant'),
  (gen_random_uuid(), 'can_manage_ads',                     'Advertisements (Doc-2 §7)',                                                    'tenant'),
  (gen_random_uuid(), 'can_upload_spec_documents',          'Specification document uploads (Doc-2 §7)',                                    'tenant'),
  (gen_random_uuid(), 'can_submit_review',                  'Post-award public review — buyer side; engagement required (Doc-2 §7)',        'tenant'),
  -- staff space (7) — Doc-2 §7 "Platform-staff slugs (separate space)"; never mapped to an org bundle
  (gen_random_uuid(), 'staff_can_moderate_rfq',            'Platform-staff RFQ moderation (Doc-2 §7)',                                     'staff'),
  (gen_random_uuid(), 'staff_can_verify',                  'Platform-staff verification admin (Doc-2 §7)',                                 'staff'),
  (gen_random_uuid(), 'staff_can_support',                 'Platform-staff support admin — no private-RFQ read (Doc-2 §7)',                'staff'),
  (gen_random_uuid(), 'staff_can_ban',                     'Platform-staff ban authority (Doc-2 §7)',                                       'staff'),
  (gen_random_uuid(), 'staff_can_manage_categories',       'Platform-staff category management (Doc-2 §7)',                                'staff'),
  (gen_random_uuid(), 'staff_can_redact_audit',            'Platform-staff compliance-scoped audit redaction (Doc-2 §7)',                  'staff'),
  (gen_random_uuid(), 'staff_super_admin',                 'Platform-staff super admin — all actions audited+flagged (Doc-2 §7)',          'staff')
ON CONFLICT ("slug") DO UPDATE SET description = EXCLUDED.description, space = EXCLUDED.space, updated_at = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- §2 — identity.role_permissions mapping (Doc-6C §5.2, as corrected by Patch v1.0.1) —
--     the Doc-2 §7 bundle-default (O/D/M/F) columns for the 4 pre-existing system bundles
--     (`identity_init` seeded the role rows; NOT reseeded here). `organization_id` = NULL
--     (system-bundle composition — Doc-6C §5.2 / DC-CR2). Idempotent: composite PK
--     (role_id, permission_id) conflict → DO NOTHING (re-run leaves identical state).
--     Inv #2 hard guard: no `staff_*` slug appears in this VALUES list — enforced by construction
--     (only the 36 tenant slugs are enumerated below).
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "identity"."role_permissions" ("role_id", "permission_id", "organization_id")
SELECT r."id", p."id", NULL
FROM (VALUES
  ('can_create_rfq','Owner'),('can_create_rfq','Director'),('can_create_rfq','Manager'),('can_create_rfq','Officer'),
  ('can_approve_rfq','Owner'),('can_approve_rfq','Director'),('can_approve_rfq','Manager'),
  ('can_view_rfq','Owner'),('can_view_rfq','Director'),('can_view_rfq','Manager'),('can_view_rfq','Officer'),
  ('can_view_all_rfqs','Owner'),('can_view_all_rfqs','Director'),('can_view_all_rfqs','Manager'),
  ('can_cancel_rfq','Owner'),('can_cancel_rfq','Director'),('can_cancel_rfq','Manager'),
  ('can_approve_vendor_selection','Owner'),('can_approve_vendor_selection','Director'),('can_approve_vendor_selection','Manager'),
  ('can_award_rfq','Owner'),('can_award_rfq','Director'),
  ('can_submit_quote','Owner'),('can_submit_quote','Director'),('can_submit_quote','Manager'),('can_submit_quote','Officer'),
  ('can_respond_to_rfq','Owner'),('can_respond_to_rfq','Director'),('can_respond_to_rfq','Manager'),('can_respond_to_rfq','Officer'),
  ('can_withdraw_quote','Owner'),('can_withdraw_quote','Director'),('can_withdraw_quote','Manager'),
  ('can_manage_private_vendors','Owner'),('can_manage_private_vendors','Director'),('can_manage_private_vendors','Manager'),('can_manage_private_vendors','Officer'),
  ('can_manage_vendor_status','Owner'),('can_manage_vendor_status','Director'),('can_manage_vendor_status','Manager'),
  ('can_manage_engagements','Owner'),('can_manage_engagements','Director'),('can_manage_engagements','Manager'),
  ('can_create_documents','Owner'),('can_create_documents','Director'),('can_create_documents','Manager'),('can_create_documents','Officer'),
  ('can_approve_po','Owner'),('can_approve_po','Director'),
  ('can_record_payments','Owner'),('can_record_payments','Director'),('can_record_payments','Manager'),
  ('can_approve_payment','Owner'),('can_approve_payment','Director'),
  ('can_manage_finance_records','Owner'),('can_manage_finance_records','Director'),
  ('can_manage_templates','Owner'),('can_manage_templates','Director'),('can_manage_templates','Manager'),
  ('can_manage_vendor_profile','Owner'),('can_manage_vendor_profile','Director'),('can_manage_vendor_profile','Manager'),
  ('can_publish_profile','Owner'),('can_publish_profile','Director'),('can_publish_profile','Manager'),
  ('can_manage_users','Owner'),('can_manage_users','Director'),('can_manage_users','Manager'),
  ('can_manage_workflow_settings','Owner'),('can_manage_workflow_settings','Director'),
  ('can_view_billing','Owner'),('can_view_billing','Director'),
  ('can_manage_billing','Owner'),
  ('can_transfer_ownership','Owner'),
  ('can_delete_organization','Owner'),
  ('can_submit_verification','Owner'),
  ('can_manage_delegations','Owner'),('can_manage_delegations','Director'),
  ('can_use_messaging','Owner'),('can_use_messaging','Director'),('can_use_messaging','Manager'),('can_use_messaging','Officer'),
  ('can_raise_support_ticket','Owner'),('can_raise_support_ticket','Director'),('can_raise_support_ticket','Manager'),('can_raise_support_ticket','Officer'),
  ('can_manage_leads','Owner'),('can_manage_leads','Director'),('can_manage_leads','Manager'),('can_manage_leads','Officer'),
  ('can_manage_products','Owner'),('can_manage_products','Director'),('can_manage_products','Manager'),
  ('can_manage_ads','Owner'),('can_manage_ads','Director'),('can_manage_ads','Manager'),
  ('can_upload_spec_documents','Owner'),('can_upload_spec_documents','Director'),('can_upload_spec_documents','Manager'),('can_upload_spec_documents','Officer'),
  ('can_submit_review','Owner'),('can_submit_review','Director'),('can_submit_review','Manager')
) AS m("slug", "role_name")
JOIN "identity"."permissions" p ON p."slug" = m."slug"
JOIN "identity"."roles" r ON r."name" = m."role_name" AND r."organization_id" IS NULL AND r."is_system_bundle" = true AND r."deleted_at" IS NULL
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
