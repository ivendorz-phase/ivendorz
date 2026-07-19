// Documents shared home — FE-DOC-03 NOT-FOUND boundaries (Doc-7A §8.2 · Inv #11 / GI-12).
// Unknown/absent id and not-owned id are INDISTINGUISHABLE: same copy, same layout, no leaf ref
// (breadcrumb shows only the list ancestor). Thin per-mount `not-found.tsx` files pass `basePath`.

import Link from "next/link";
import { FileStack, LayoutTemplate } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { Breadcrumbs } from "../shell";

export function TemplateNotFound({ basePath }: { basePath: string }) {
  const list = `${basePath}/documents/templates`;
  return (
    <>
      <Breadcrumbs items={[{ label: "Document templates", href: list }]} className="mb-4" />
      <h1 className="sr-only">Template not available</h1>
      <EmptyState
        icon={<LayoutTemplate aria-hidden />}
        title="Template not available"
        description="This template doesn't exist or isn't available to you."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href={list}>Back to templates</Link>
          </Button>
        }
        className="py-16"
      />
    </>
  );
}

export function GeneratedDocumentNotFound({ basePath }: { basePath: string }) {
  const list = `${basePath}/documents/generated`;
  return (
    <>
      <Breadcrumbs items={[{ label: "Generated documents", href: list }]} className="mb-4" />
      <h1 className="sr-only">Document not available</h1>
      <EmptyState
        icon={<FileStack aria-hidden />}
        title="Document not available"
        description="This document doesn't exist or isn't available to you."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href={list}>Back to generated documents</Link>
          </Button>
        }
        className="py-16"
      />
    </>
  );
}
