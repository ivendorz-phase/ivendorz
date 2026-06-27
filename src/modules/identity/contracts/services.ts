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
import { provisionIdentityForAuthUser } from "../application/commands/provision-identity.command";
import type { ProvisionIdentityInput, ProvisionIdentityResult } from "./types";

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
