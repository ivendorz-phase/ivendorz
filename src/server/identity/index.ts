// App-layer composition for M1 caller-facing HTTP surfaces (REPOSITORY_STRUCTURE §5/§8). The thin
// Next.js route entries (`app/api/identity/**`) delegate here; the composition wires Supabase Auth ↔
// active-org context ↔ M1 contracts. Authentication/active-org context are app-layer; RLS is the backstop.

export {
  handleGetBuyerProfile,
  loadActiveOrgBuyerProfile,
  type ActiveOrgBuyerProfileOutcome,
  type GetBuyerProfileHandlerDeps,
  type ResolveSession,
} from "./get-buyer-profile.route-handler";

export {
  handleUpsertBuyerProfile,
  type UpsertBuyerProfileHandlerDeps,
} from "./upsert-buyer-profile.route-handler";

// W2-IDN-6.1 — the §C4 User/Account wired surface (Doc-5C §4.1 rows 1–4).
export {
  handleUpdateUserProfile,
  type UpdateUserProfileHandlerDeps,
} from "./update-user-profile.route-handler";
export {
  handleUpdateUser2faSettings,
  type UpdateUser2faSettingsHandlerDeps,
} from "./update-user-2fa-settings.route-handler";
export {
  handleDeactivateOwnAccount,
  type DeactivateOwnAccountHandlerDeps,
} from "./deactivate-own-account.route-handler";
export {
  handleSetUserAccountStatus,
  type SetUserAccountStatusHandlerDeps,
} from "./set-user-account-status.route-handler";
