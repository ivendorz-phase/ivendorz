// Security & 2FA route (`/account/security`) — P-ACC-03 (Doc-7E · T-SETTINGS; page_inventory §13.4). A
// SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the
// canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: manages 2FA settings + account deactivation via the frozen commands
// `update_user_2fa_settings` (two_fa_enabled, recovery_method — Doc-4C §C4) and `deactivate_own_account`
// (Doc-5C) — but this build performs NO mutation (honest interims). The shell owns the `<main>`
// container + the page `<h1>` (PageHeader).
import { PageHeader } from "../../_components/shell/page-header";
import { SecuritySettings } from "./security-settings";

export const metadata = {
  title: "Security & 2FA — iVendorz",
};

export default function SecurityPage() {
  return (
    <>
      <PageHeader
        title="Security & 2FA"
        description="Protect your account with two-factor authentication and manage account status."
      />
      <SecuritySettings />
    </>
  );
}
