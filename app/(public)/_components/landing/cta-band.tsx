// SEC-CTA — Final conversion band (landing_page_spec §13 · Doc-7D). STATIC. CTAs ROUTE (no anonymous
// mutation): "Post an RFQ" → `(auth)` (Doc-7E); "Talk to us" → the public contact page (P-PUB-24). No
// anonymous lead-capture POST. Navy brand band; amber stays reserved (not used decoratively here).
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Container } from "@/frontend/components/container";

export function CtaBand() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--iv-navy-800),var(--iv-navy-950))] px-8 py-10 text-center sm:px-12 sm:py-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to source smarter?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            Post your first RFQ in under two minutes and get competing quotes from verified
            suppliers.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/login">
                <Plus aria-hidden="true" />
                Post an RFQ
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            >
              <Link href="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
