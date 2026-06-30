import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../../_components/vendor";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <WorkspaceSectionPlaceholder
      title="Products"
      description="Your product catalog — drafts, published items and specifications."
    />
  );
}
