// FE-PUB-09 MEGA_MENU Phase 5 exit — adapter-readiness demo (MEGA_MENU_IMPLEMENTATION_PLAN.md).
// Proves the `TaxonomySource` seam: the seed implementation and a MOCK contract implementation
// (standing in for the future `list_categories` projection — [ESC-7-API-CATNAV]) feed the SAME
// index builder and satisfy the same guarantees — swapping the source touches zero components.

import { describe, expect, it } from "vitest";
import { buildTaxonomyIndex } from "@/frontend/navigation/model/taxonomy-index";
import { seedTaxonomySource } from "@/frontend/navigation/model/taxonomy-source";
import type { CategoryNodeData, TaxonomySource } from "@/frontend/navigation/model/types";

/** Mock of the future contract adapter — different data provenance, same shape. */
const mockContractSource: TaxonomySource = {
  load: () =>
    Promise.resolve<CategoryNodeData[]>([
      { id: "c-1", slug: "contract-root", name: "Contract Root", level: 1, parentId: null },
      { id: "c-2", slug: "contract-child", name: "Contract Child", level: 2, parentId: "c-1" },
    ]),
};

describe("TaxonomySource seam (ESC-7-API-CATNAV readiness)", () => {
  it("seed source loads the ratified 794 nodes", async () => {
    const nodes = await seedTaxonomySource.load();
    expect(nodes).toHaveLength(794);
  });

  it("a contract-shaped source drives the SAME index builder with zero component changes", async () => {
    for (const source of [seedTaxonomySource, mockContractSource]) {
      const nodes = await source.load();
      const index = buildTaxonomyIndex(nodes);
      expect(index.roots.length).toBeGreaterThan(0);
      const anyRoot = index.roots[0]!;
      expect(index.bySlug.get(anyRoot.slug)).toBe(anyRoot);
      expect(index.pathTo(anyRoot.children[0]?.id ?? anyRoot.id)[0]).toBe(anyRoot);
    }
  });

  it("virtualization checkpoint: max sibling list stays far below the ~50 threshold", async () => {
    const nodes = await seedTaxonomySource.load();
    const counts = new Map<string | null, number>();
    for (const n of nodes) counts.set(n.parentId, (counts.get(n.parentId) ?? 0) + 1);
    const max = Math.max(...counts.values());
    // ARCH §7: virtualize a column only if a sibling list exceeds ~50 — explicitly skipped at
    // v1.0 scale; this assertion documents the decision and trips if a future release crosses it.
    expect(max).toBeLessThan(50);
  });
});
