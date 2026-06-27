// M0 infrastructure — realizes `core.allocate_human_reference.v1` (Doc-4B §A7) by invoking the
// M0-owned DB allocator `core.allocate_human_ref(text, integer)` (Doc-6B §3.3 — SECURITY DEFINER,
// row-locked, gap-tolerant, never-reused). This is M0 calling its OWN schema (allowed); other
// modules consume this via the contract surface, never raw `core` SQL (One Module, One Owner).

import { prisma } from "../../../../shared/db";
import type { AllocateHumanReference, CoreServiceExecutor } from "../../contracts/services";

interface AllocateHumanRefRow {
  human_ref: string;
}

/**
 * Allocate the next year-scoped human reference for an entity type (Doc-4B §A7 / Doc-6B §3.3).
 * Runs on the supplied transaction executor when present (joins the caller's transaction —
 * Doc-4B §A7 atomicity); otherwise on the shared client.
 */
export const allocateHumanReference: AllocateHumanReference = async (
  input,
  executor?: CoreServiceExecutor,
) => {
  const db = executor ?? prisma;
  // Cast $2 to integer: the frozen allocator signature is core.allocate_human_ref(text, integer)
  // (Doc-6B §3.3); Prisma binds JS numbers as bigint, so the cast selects the correct overload.
  const rows = await db.$queryRawUnsafe<AllocateHumanRefRow[]>(
    "SELECT core.allocate_human_ref($1, $2::integer) AS human_ref",
    input.entityType,
    input.year,
  );

  const humanRef = rows[0]?.human_ref;
  if (typeof humanRef !== "string") {
    // The DB allocator raises on a missing sequence row; an empty result is an internal failure.
    throw new Error(
      `core.allocate_human_reference.v1: allocator returned no reference for (${input.entityType}, ${input.year})`,
    );
  }

  return { humanRef };
};
