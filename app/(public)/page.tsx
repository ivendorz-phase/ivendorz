import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Badge } from "@/frontend/primitives/badge";

// Public landing route (`/`) — lives in the (public) route group (REPOSITORY_STRUCTURE §8).
// PLACEHOLDER: the full landing (P-PUB-01, Doc-7D / landing_page_spec.md) binds M2 Public reads
// and is Wave-3 work — NOT built here. This spine-only hero renders inside the Doc-7C public shell
// so the foundations (kit + light theme + shell chrome) are visibly verifiable end-to-end.
export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-[var(--iv-content-max)] flex-col items-center px-4 py-24 text-center sm:px-6">
      <Badge variant="brand">Foundations preview</Badge>
      <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        The Industrial Procurement Operating System for Bangladesh
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted-foreground">
        Structured RFQ, verified vendor discovery, and post-award workflow on one platform.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/login">Get started</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
      <p className="mt-10 text-xs text-muted-foreground">
        Wave-2 foundations — the full marketplace landing (Doc-7D) lands in Wave 3.
      </p>
    </section>
  );
}
