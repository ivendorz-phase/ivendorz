// Workflow settings route (`/account/settings`) — P-ACC-13 (Doc-7E · T-SETTINGS; page_inventory §13). A
// SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the
// canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: configures the org's RFQ approval chain + award threshold via the frozen command
// `identity.update_workflow_settings.v1` (Doc-4C §C11, `can_manage_workflow_settings`) — but this build
// performs NO mutation (honest interims). The shell owns the `<main>` container + the page `<h1>`.
import { PageHeader } from "../../_components/shell/page-header";
import { WorkflowSettings } from "./workflow-settings";

export const metadata = {
  title: "Workflow settings — iVendorz",
};

export default function WorkflowSettingsPage() {
  return (
    <>
      <PageHeader
        title="Workflow settings"
        description="Set who must approve RFQs and the award value that requires approval."
      />
      <WorkflowSettings />
    </>
  );
}
