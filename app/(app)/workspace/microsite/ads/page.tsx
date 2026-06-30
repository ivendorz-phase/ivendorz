import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../../_components/vendor";

export const metadata: Metadata = { title: "Advertising" };

export default function AdvertisingPage() {
  return (
    <WorkspaceSectionPlaceholder
      title="Advertising"
      description="Advertising placements you submit for admin review."
    />
  );
}
