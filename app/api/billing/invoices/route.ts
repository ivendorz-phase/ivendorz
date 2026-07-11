// Thin Next.js App Router entry for `GET /billing/invoices` — `billing.list_platform_invoices.v1`
// (Doc-5I §8 → `200`). REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION ONLY. Org-self (debtor) read; the
// composition core owns session→401, the active-org + `can_view_billing` gate, and ALL SYNTAX (filter
// allowlist, cursor, page_size). This route only extracts the Doc-5A §8 wire grammar. BOUNDARY (§9):
// `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleListPlatformInvoices } from "@/server/billing";
import type { ListPlatformInvoicesRequest } from "@/modules/billing/contracts";

const FILTER_PARAM = /^filter\[(.+)\]$/;

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const filters: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    const match = FILTER_PARAM.exec(key);
    if (match) {
      filters[match[1]] = value;
    }
  }

  const cursor = url.searchParams.get("cursor");
  const pageSize = url.searchParams.get("page_size");

  const listRequest: ListPlatformInvoicesRequest = {
    filters,
    ...(cursor !== null ? { cursor } : {}),
    // Parse to a number here; the composition rejects a non-integer / out-of-bound value as SYNTAX 400.
    ...(pageSize !== null ? { pageSize: Number(pageSize) } : {}),
  };

  const { status, body } = await handleListPlatformInvoices(listRequest, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
