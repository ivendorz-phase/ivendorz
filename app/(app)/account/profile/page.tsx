// User profile route (`/account/profile`) — P-ACC-02 (Doc-7E · T-SETTINGS; page_inventory §13.4). A
// Next.js SERVER COMPONENT in the Doc-7C `(app)` route group; `app/` does ROUTING + COMPOSITION ONLY.
// Mounted in the canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: edits the user's own profile via the frozen `update_user_profile` shape
// (Doc-4C §C4) — but this build performs NO mutation (a completed save shows an honest interim). The
// shell owns the `<main>` container + the page `<h1>` (PageHeader); this page renders header + form only.
import { PageHeader } from "../../_components/shell/page-header";
import { UserProfileForm } from "./user-profile-form";

export const metadata = {
  title: "User profile — iVendorz",
};

export default function UserProfilePage() {
  return (
    <>
      <PageHeader
        title="User profile"
        description="Update your personal details. Your organization profile is managed separately."
      />
      <UserProfileForm />
    </>
  );
}
