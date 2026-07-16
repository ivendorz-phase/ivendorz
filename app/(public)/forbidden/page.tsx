import Link from "next/link";
import { Button } from "@/frontend/primitives/button";

// Public Forbidden (403) route (`/forbidden`) — P-SH-06 (Doc-7C · T-STATE; screen_specifications §P-SH-06,
// Doc-7A §8.2). A pure SERVER COMPONENT rendered in the Doc-7C `(public)` shell.
//
// GOVERNANCE — the load-bearing rule (Invariant #11 / non-disclosure §7.5, Doc-7A §8.2):
//  • A 403 is shown ONLY where the viewer's RIGHT TO KNOW the resource exists is already established.
//  • Where there is NO right to know, "forbidden" MUST collapse to the byte-identical 404: code calls
//    Next's `notFound()` (rendering the kit `NotFound`, which takes no discriminating prop and is identical
//    to genuine absence — see (public)/not-found.tsx). Such cases NEVER reach this page, so a hidden
//    resource is indistinguishable from one that does not exist.
//  • Therefore this page is the right-to-know 403 ONLY. Even here the copy is GENERIC and names no resource
//    (it reveals nothing beyond "you don't have access"). No page-specific analytics fire (must not leak
//    existence). It coins no contract and binds no data. Styled to match the kit `NotFound` layout for
//    visual consistency (a page-local state view — the frozen kit is unchanged and no primitive is
//    duplicated; `NotFound` is deliberately 404-only). This page owns the single `<h1>`.
export const metadata = {
  title: "Access denied — iVendorz",
};

// 2026-07-16 — ported to the "iVendorz Public Pages" reference (`isForbidden`). It is a utility screen,
// so it takes NO `PublicPageHead` (the reference gives it none either — a breadcrumb into a page you
// cannot access would be nonsense). Ported: the reference's proportions — a large status code over the
// heading, a wider lead measure, and its ghost+primary action pair. Copy is unchanged, and the second
// action routes to `/contact`, a real page (the reference's own target for it).
export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center sm:py-28">
      <p className="font-mono text-5xl font-bold tracking-tight text-iv-brand-600 sm:text-6xl">
        403
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-iv-ink-heading sm:text-4xl">
        Access denied
      </h1>
      <p className="mt-4 max-w-xl text-base text-iv-ink-secondary">
        You don’t have access to this page. If you think this is a mistake, contact an administrator
        in your organization.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/contact">Contact support</Link>
        </Button>
      </div>
    </div>
  );
}
