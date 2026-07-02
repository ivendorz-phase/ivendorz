// Notification preferences route (`/account/notifications`) — P-ACC-15 (Doc-7E · T-SETTINGS;
// page_inventory §13). A SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY.
// Mounted in the canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: manages the user's per-channel / per-type notification preferences (self-scope) —
// but this build performs NO mutation (honest interim). The preference DATA is Identity-owned
// (`users.NotificationPreferences`, Doc-2 §2 / Doc-4C; confirmed by the Doc-4H freeze audit) and consumed
// read-only by M6, which executes delivery; the write seam is cross-module (page_inventory: Doc-5H). The
// shell owns the `<main>` container + the page `<h1>` (PageHeader).
import { PageHeader } from "../../_components/shell/page-header";
import { NotificationPreferences } from "./notification-preferences";

export const metadata = {
  title: "Notification preferences — iVendorz",
};

export default function NotificationPreferencesPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Choose how you're notified about activity across iVendorz."
      />
      <NotificationPreferences />
    </>
  );
}
