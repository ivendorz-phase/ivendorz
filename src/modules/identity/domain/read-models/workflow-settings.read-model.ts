// M1 domain (PRIVATE) — the `organization_workflow_settings` read model for the owning-org read
// (Doc-6C §3.7 entity; Doc-4C §C11 `get_workflow_settings.v1`; Doc-5C §6.1 row 35). A read projection
// of the authoritative `identity.organization_workflow_settings` row — NOT a source of truth (the
// table is). W2-IDN-6.8.
//
// Reference-never-restate: the column set is owned by Doc-2 §10.2 / Doc-6C §3.7; this type binds it by
// shape. §C11 declares the response `workflow_settings` object as the SIX keys
// `{ rfq_approval_mode, approval_chain, financial_permissions, notification_rules,
//    default_routing_mode, buyer_courtesy_options }` (PassB:707). Of those, only FOUR are realized as
// Doc-6C §3.7 columns; `default_routing_mode` and `buyer_courtesy_options` have NO realized column
// (verified against the frozen §3.7 DDL — Doc-2 §10.2 line 723 lists only the four jsonb/enum
// columns). They are DEFERRED (the `update_organization_profile` address/contact_info/brand_assets_ref
// deferred-field precedent): surfaced here as `null` so the read preserves the frozen §C11 six-key
// response shape WITHOUT fabricating a value (a future additive Doc-2/Doc-6C column realizes them).
// [logged judgment call — the report §8 carries this.]

/** The authoritative organization_workflow_settings fields (Doc-2 §10.2 / Doc-6C §3.7), as read from
 *  the table, plus the two frozen §C11 response keys that have no realized column (deferred → null). */
export interface WorkflowSettingsReadModel {
  /** Owning organization — the tenant anchor (Doc-2 §6). Echoed for the consumer (§C11 response
   *  addresses the active-org singleton). */
  organizationId: string;
  /** `rfq_approval_mode` (Doc-6C §3.7 enum `none|single|multi_step`; DB DEFAULT `none`). */
  rfqApprovalMode: "none" | "single" | "multi_step";
  /** `approval_chain_jsonb` (Doc-6C §3.7; nullable). Shape owned upstream (list<object>), opaque here. */
  approvalChain: unknown;
  /** `financial_permissions_jsonb` (Doc-6C §3.7; nullable — thresholds). Shape owned upstream, opaque. */
  financialPermissions: unknown;
  /** `notification_rules_jsonb` (Doc-6C §3.7; nullable). Shape owned upstream, opaque here. */
  notificationRules: unknown;
  /** DEFERRED — no Doc-6C §3.7 column (see header); always `null` (the frozen six-key shape, no
   *  fabricated value). */
  defaultRoutingMode: null;
  /** DEFERRED — no Doc-6C §3.7 column (see header); always `null`. */
  buyerCourtesyOptions: null;
  /** The `updated_at` concurrency token (Doc-2 §0.2; Prisma `@updatedAt`). Carried so the read's ETag
   *  header hands the client the token the §C11 update's REQUIRED `If-Match` consumes (Doc-5C §6.4 —
   *  the optimistic-concurrency round-trip; an HTTP §4.0 infrastructure header, not a response field). */
  updatedAt: Date;
}
