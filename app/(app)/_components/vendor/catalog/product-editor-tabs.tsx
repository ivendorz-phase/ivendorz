// ProductEditorTabs (companion §5: S2 Content · S3 Specifications · S6/S7 Publishing). Thin feature
// adapter over the shared WorkspaceTabs infrastructure (Milestone 8): it only maps the three named
// section slots to tabs and owns no tab logic. The section contents are server-rendered and passed in
// as props. Render is byte-identical to the pre-extraction wrapper. RSC-friendly.
import type { ReactNode } from "react";
import { WorkspaceTabs } from "../shared";

export interface ProductEditorTabsProps {
  content: ReactNode;
  specifications: ReactNode;
  publishing: ReactNode;
}

export function ProductEditorTabs({ content, specifications, publishing }: ProductEditorTabsProps) {
  return (
    <WorkspaceTabs
      tabs={[
        { value: "content", label: "Content", content },
        { value: "specifications", label: "Specifications", content: specifications },
        { value: "publishing", label: "Publishing", content: publishing },
      ]}
    />
  );
}
