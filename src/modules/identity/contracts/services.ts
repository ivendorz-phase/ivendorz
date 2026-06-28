// Public service interfaces + callables for module "identity" — the ONLY cross-module call surface
// (REPOSITORY_STRUCTURE §3). Cross-module consumers (e.g. `src/server`) import from here, never the
// private application/domain/infrastructure layers (the boundary linter enforces this).
//
// `provisionIdentity` (WP-1.3 [W1-AUTH-001]) is the public face over the private M1 first-login
// provisioning command — the contracts/ facade delegates to its OWN module's application layer
// (same-module import; the cross-module One-Module rule is untouched). The Module 0
// `allocateHumanReference` contract service is INJECTED (typed from `@/modules/core/contracts` — a
// cross-module TYPE import, the only boundary-legal way to consume another module): M0 allocation
// stays flowing through contracts, never a concrete cross-module value import (Doc-4B §A7; Doc-4C §C5
// "allocate the ref via Module 0").

import type { AllocateHumanReference } from "@/modules/core/contracts";
import type { DbExecutor } from "@/shared/db";
import { provisionIdentityForAuthUser } from "../application/commands/provision-identity.command";
import { getBuyerProfile as getBuyerProfileQuery } from "../application/queries/get-buyer-profile.query";
import type {
  GetBuyerProfileResult,
  ProvisionIdentityInput,
  ProvisionIdentityResult,
} from "./types";

/** Dependencies a caller injects into provisioning — the Module 0 contract service(s). */
export interface ProvisionIdentityDeps {
  /**
   * The Module 0 `core.allocate_human_reference.v1` contract service (Doc-4B §A7), injected by the
   * contract TYPE. Bound into the provisioning transaction so the `ORG-…` ref allocation is atomic
   * with the org create (Doc-4C §C5 — "no second ref on replay").
   */
  allocateHumanReference: AllocateHumanReference;
}

/**
 * `identity.provisionIdentity` — the cross-module callable that lazily provisions a first-login
 * identity (user + Personal Organization + Owner membership), atomically and idempotently. The
 * authoritative behavior (one transaction, idempotent on `auth_user_id`, full rollback, RLS
 * bootstrap context) lives in the private M1 command; this is its public, contracts-only entry point.
 */
export type ProvisionIdentity = (
  input: ProvisionIdentityInput,
  deps: ProvisionIdentityDeps,
) => Promise<ProvisionIdentityResult>;

/**
 * The concrete public provisioning service (M1 contracts facade → M1 application command).
 * Cross-module consumers call this via `@/modules/identity/contracts`.
 */
export const provisionIdentity: ProvisionIdentity = (input, deps) =>
  provisionIdentityForAuthUser(input, { allocateHumanReference: deps.allocateHumanReference });

/**
 * `identity.get_buyer_profile.v1` (Doc-5C §6.1 row 33; §6.3 non-disclosure) — the PUBLIC, contracts-only
 * face over the private M1 read query (WP-1.2). The owning/active-org buyer-profile singleton read; the
 * active org is RESOLVED + enforced upstream by the app-layer org-context guard which sets `app.active_org`
 * on the request transaction (Doc-6C §2.1 / Doc-5C §3.3 — client-supplied org id never trusted). RLS scopes
 * the read; NO organization id is taken as input. Cross-tenant / absent → `found: false` (Doc-5C §6.3 — the
 * wire `404` collapse, indistinguishable from genuine absence).
 *
 * The cross-module surface is the TYPE; the concrete callable below binds the same-module application query
 * (the canonical DDD contracts-facade pattern — `${from.module}`-scoped; no cross-module internal access).
 * Callers (the app-layer route) MUST invoke it with the transaction executor carrying the server-set
 * `app.active_org` GUC — i.e. INSIDE `withActiveOrgContext` (`src/server/context`).
 *
 * @param db the request-transaction executor carrying the server-set active-org GUC (Doc-6C §2.1).
 */
export type GetBuyerProfile = (db?: DbExecutor) => Promise<GetBuyerProfileResult>;

/** Concrete `identity.get_buyer_profile.v1` facade (M1 contracts → M1 application query). */
export const getBuyerProfile: GetBuyerProfile = (db) => getBuyerProfileQuery(db);

// The M1 WIRE FACE for the buyer-profile read (result → Doc-5A envelope + §6.2 status). M1 owns how
// its read becomes HTTP, so the mapper lives in M1's `api/`; this contracts re-export is the public,
// boundary-legal handle the app-layer route composition consumes via `@/modules/identity/contracts`
// (same-module contracts → own `api/`; `${from.module}`-scoped — no cross-module internal access).
export { mapGetBuyerProfile } from "../api/get-buyer-profile.handler";
