import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../../_components/vendor";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <WorkspaceSectionPlaceholder
      title="Categories"
      description="Propose category assignments for admin approval."
    />
  );
}
