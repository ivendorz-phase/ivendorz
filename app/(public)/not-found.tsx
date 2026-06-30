import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { NotFound } from "@/frontend/components/not-found";

// Doc-7C SR7 / Doc-7A §8.2 — `(public)` route-segment not-found boundary. Renders the kit NotFound,
// which is BYTE-IDENTICAL to genuine absence (no "forbidden" vs "missing" distinction — Invariant #11).
export default function PublicNotFound() {
  return (
    <NotFound
      action={
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      }
    />
  );
}
