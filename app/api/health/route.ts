import { NextResponse } from "next/server";

/**
 * Health check (Wave 0 bootstrap). Thin route entry — delegates nothing yet.
 * Real module routes delegate into each module's `api/` via `src/server/` guards.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ivendorz",
    phase: "wave-0-bootstrap",
  });
}
