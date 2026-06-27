// M1 infrastructure barrel (PRIVATE — not a cross-module surface). Adapters that read/write the
// `identity` schema directly. Cross-module callers reach these only through the module composition
// root (identity.module.ts) / contracts, never by importing infrastructure (REPOSITORY_STRUCTURE).

export { findActiveOrgBuyerProfile } from "./data/buyer-profile.repository";
