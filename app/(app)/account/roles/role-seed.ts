// Role editor presentation seed — P-ACC-09 (Doc-7E). NOT authoritative: a wired build resolves the
// permission catalog from `identity.list_permissions.v1` (`{ slug, description, space }`, Doc-4C §C7:454)
// and the role + its composed slugs from `identity.list_roles.v1` / role reads. PRESENTATION ONLY.
//
// FIELD DISCIPLINE: permissions are referenced by their FROZEN SLUG (Doc-2 §7 catalog) — never by an
// invented name-string (Invariant #10). The `description` strings here are display copy standing in for
// the catalog's `description` field; the slugs themselves are the authoritative frozen identifiers.

export interface PermissionItem {
  /** Frozen permission slug (Doc-2 §7) — the authoritative identifier. */
  slug: string;
  /** Display description (a wired build reads this from list_permissions). */
  description: string;
}

// Tenant-space permission catalog — frozen slugs (Doc-2 §7; Doc-4C Appendix D).
export const PERMISSION_CATALOG: PermissionItem[] = [
  { slug: "can_manage_users", description: "Manage members, invitations, and their roles." },
  {
    slug: "can_manage_workflow_settings",
    description: "Configure approval chains and thresholds.",
  },
  { slug: "can_manage_delegations", description: "Grant and revoke delegated authority." },
  { slug: "can_manage_vendor_profile", description: "Manage the organization's vendor profile." },
  { slug: "can_submit_verification", description: "Submit verification evidence for review." },
  { slug: "can_transfer_ownership", description: "Transfer organization ownership." },
  { slug: "can_delete_organization", description: "Deactivate or restore the organization." },
];

export interface RoleSeed {
  roleId: string;
  name: string;
  isSystemBundle: boolean;
  permissionSlugs: string[];
}

// Role lookup — mirrors the P-ACC-08 list seed. System bundles carry representative composed slugs;
// custom roles are org-authored.
export const ROLES_BY_ID: Record<string, RoleSeed> = {
  role_owner: {
    roleId: "role_owner",
    name: "Owner",
    isSystemBundle: true,
    permissionSlugs: PERMISSION_CATALOG.map((p) => p.slug),
  },
  role_director: {
    roleId: "role_director",
    name: "Director",
    isSystemBundle: true,
    permissionSlugs: [
      "can_manage_users",
      "can_manage_workflow_settings",
      "can_manage_vendor_profile",
      "can_submit_verification",
    ],
  },
  role_manager: {
    roleId: "role_manager",
    name: "Manager",
    isSystemBundle: true,
    permissionSlugs: ["can_manage_vendor_profile", "can_submit_verification"],
  },
  role_officer: {
    roleId: "role_officer",
    name: "Officer",
    isSystemBundle: true,
    permissionSlugs: ["can_submit_verification"],
  },
  role_proc_lead: {
    roleId: "role_proc_lead",
    name: "Procurement Lead",
    isSystemBundle: false,
    permissionSlugs: ["can_manage_users", "can_manage_workflow_settings"],
  },
  role_wh_officer: {
    roleId: "role_wh_officer",
    name: "Warehouse Officer",
    isSystemBundle: false,
    permissionSlugs: ["can_manage_vendor_profile"],
  },
};

export function getRoleSeed(roleId: string): RoleSeed | undefined {
  return ROLES_BY_ID[roleId];
}
