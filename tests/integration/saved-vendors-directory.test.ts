import { describe, expect, it } from "vitest";
import {
  buildDirectorySnapshot,
  buildMarketplaceSearchCorpus,
  buildMarketplaceWorkingVendor,
  buildPrivateWorkingVendor,
  canBePreferred,
  selectDirectoryRows,
  viewCounts,
} from "../../app/(app)/(workspace)/buy/_components/vendor-directory/working-model";
import {
  MAX_OFFERINGS,
  privateVendorSaveEligibility,
  suggestCategory,
} from "../../app/(app)/(workspace)/buy/_components/vendor-directory/offerings";
import {
  autoMapColumns,
  buildPasteRows,
  eligiblePasteRows,
  parseClipboardTable,
  pasteRowState,
} from "../../app/(app)/(workspace)/buy/_components/vendor-directory/paste-import";

// My Vendor Directory (Saved-Vendors fold) — PURE-LOGIC conformance tests for the load-bearing owner
// directives D1(a) / D3 / D5. These exercise the presentation data layer only (no DOM, no router, no
// DB): the D1(a) linked-only rule baked into the composition + filters, the D5 category matcher /
// save-eligibility, and the D3 paste parse / validation states. Boundary: a test may import the app
// presentation layer it exercises (eslint `tests → app`).

describe("D1(a) — only linked records can be Preferred / hold buyer status", () => {
  const snapshot = buildDirectorySnapshot();

  it("unlinked records carry no favourite, no status, and cannot be preferred", () => {
    const unlinked = snapshot.filter((vendor) => vendor.linkStatus !== "linked");
    expect(unlinked.length).toBeGreaterThan(0);
    for (const vendor of unlinked) {
      expect(vendor.isFavorite).toBe(false);
      expect(vendor.currentStatus).toBe("none");
      expect(canBePreferred(vendor)).toBe(false);
    }
  });

  it("the Preferred view returns only linked, favourited vendors", () => {
    const preferred = selectDirectoryRows(snapshot, "preferred", []);
    expect(preferred.length).toBeGreaterThan(0);
    for (const vendor of preferred) {
      expect(vendor.linkStatus).toBe("linked");
      expect(vendor.isFavorite).toBe(true);
    }
  });

  it("a newly created private vendor is unlinked and cannot be preferred", () => {
    const created = buildPrivateWorkingVendor("new_1", {
      name: "Test Private Vendor",
      offerings: [{ id: "o1", label: "MS plate", categoryId: "cat-ms-plate" }],
      source: "manual",
    });
    expect(created.origin).toBe("private");
    expect(created.linkStatus).toBe("none");
    expect(canBePreferred(created)).toBe(false);
    expect(created.offeringSource).toBe("buyer");
  });

  it("saving a marketplace vendor links it and defaults to preferred (Save == favourite)", () => {
    const corpus = buildMarketplaceSearchCorpus();
    const source = corpus[0];
    const saved = buildMarketplaceWorkingVendor("new_2", {
      slug: source.slug,
      name: source.name,
      category: source.category,
      location: source.location,
      verified: source.verified,
      claimState: source.claimState,
    });
    expect(saved.origin).toBe("marketplace");
    expect(saved.linkStatus).toBe("linked");
    expect(saved.isFavorite).toBe(true);
    expect(canBePreferred(saved)).toBe(true);
    // Offerings are READ from the M2 profile (never copied into a private record).
    expect(saved.offeringSource).toBe("marketplace");
  });
});

describe("directory views + default sort", () => {
  const snapshot = buildDirectorySnapshot();

  it("partitions marketplace/private and isolates archived", () => {
    expect(
      selectDirectoryRows(snapshot, "marketplace", []).every((v) => v.origin === "marketplace"),
    ).toBe(true);
    expect(selectDirectoryRows(snapshot, "private", []).every((v) => v.origin === "private")).toBe(
      true,
    );
    expect(selectDirectoryRows(snapshot, "archived", []).every((v) => v.state === "archived")).toBe(
      true,
    );
    // Active views never show archived rows.
    expect(selectDirectoryRows(snapshot, "all", []).every((v) => v.state === "active")).toBe(true);
  });

  it("view counts: all (active) == marketplace + private", () => {
    const counts = viewCounts(snapshot);
    expect(counts.all).toBe(counts.marketplace + counts.private);
  });

  it("sorts preferred vendors first in All", () => {
    const rows = selectDirectoryRows(snapshot, "all", []);
    const firstUnpreferred = rows.findIndex((v) => !v.isFavorite);
    const lastPreferred = rows.map((v) => v.isFavorite).lastIndexOf(true);
    if (firstUnpreferred !== -1 && lastPreferred !== -1) {
      expect(lastPreferred).toBeLessThan(firstUnpreferred);
    }
  });

  it("the blacklisted chip surfaces only blacklisted vendors (buyer-side)", () => {
    const rows = selectDirectoryRows(snapshot, "all", ["blacklisted"]);
    expect(rows.every((v) => v.currentStatus === "blacklisted")).toBe(true);
  });
});

describe("D5 — category matcher + save eligibility", () => {
  it("suggests confident matches and returns none for gibberish", () => {
    expect(suggestCategory("SS tank fabrication")).toEqual({
      categoryId: "cat-tank",
      confidence: "high",
    });
    expect(suggestCategory("Centrifugal pumps").categoryId).toBe("cat-centrifugal");
    expect(suggestCategory("qwerty zzz").confidence).toBe("none");
    expect(suggestCategory("qwerty zzz").categoryId).toBeUndefined();
  });

  it("requires a company name and ≥1 confirmed category; text-only never satisfies", () => {
    expect(
      privateVendorSaveEligibility("Acme", [{ id: "o", label: "x", categoryId: "cat-valves" }]).ok,
    ).toBe(true);

    const noName = privateVendorSaveEligibility("", [
      { id: "o", label: "x", categoryId: "cat-valves" },
    ]);
    expect(noName.ok).toBe(false);
    expect(noName.reasons.some((r) => /name/i.test(r))).toBe(true);

    const textOnly = privateVendorSaveEligibility("Acme", [
      { id: "o", label: "x", textOnly: true },
    ]);
    expect(textOnly.ok).toBe(false);
    expect(textOnly.reasons.some((r) => /category/i.test(r))).toBe(true);
  });

  it("flags going over the 10-offering ceiling", () => {
    const offerings = Array.from({ length: MAX_OFFERINGS + 1 }, (_, i) => ({
      id: `o${i}`,
      label: `svc ${i}`,
      categoryId: "cat-valves",
    }));
    const result = privateVendorSaveEligibility("Acme", offerings);
    expect(result.ok).toBe(false);
    expect(result.reasons.some((r) => /maximum/i.test(r))).toBe(true);
  });
});

describe("D3 — paste parse + per-row validation states", () => {
  const snapshot = buildDirectorySnapshot();
  const corpus = {
    existingNames: snapshot.map((v) => v.name),
    marketplaceNames: buildMarketplaceSearchCorpus().map((v) => v.name),
  };
  // "Brahmaputra Traders" shares no first token with any fixture/marketplace name → not a duplicate.
  const raw = [
    "Company Name\tPhone\tEmail\tCategory",
    "Brahmaputra Traders\t01711000000\tsales@brahmaputra.example\tSS tank fabrication",
    "Custom Works\t\tbad-email-here\tGeneric machining",
    "\t01555000000\tnn@x.example\tValves",
    "Titas Fabrication Works\t01900000000\tworkshop@titasfab.example\tFabrication",
  ].join("\n");

  it("parses tab-separated content with a header row", () => {
    const table = parseClipboardTable(raw, true);
    expect(table.columns).toEqual(["Company Name", "Phone", "Email", "Category"]);
    expect(table.rows).toHaveLength(4);
  });

  it("auto-maps columns to the frozen/gated/category fields", () => {
    const table = parseClipboardTable(raw, true);
    expect(autoMapColumns(table.columns)).toEqual(["company", "phone", "email", "category"]);
  });

  it("assigns exactly one deterministic state per row", () => {
    const table = parseClipboardTable(raw, true);
    const rows = buildPasteRows(table, autoMapColumns(table.columns), corpus);
    const [fresh, custom, noName, titas] = rows;

    expect(pasteRowState(noName)).toBe("missing_required"); // empty company
    expect(pasteRowState(custom)).toBe("blocked"); // invalid email
    expect(pasteRowState(titas)).toBe("possible_duplicate"); // matches a marketplace vendor
    expect(pasteRowState(fresh)).toBe("needs_category"); // suggestion not yet confirmed

    // Confirming the category promotes the row to ready; it becomes eligible.
    fresh.categoryId = "cat-tank";
    fresh.categoryConfirmed = true;
    expect(pasteRowState(fresh)).toBe("ready");
    expect(eligiblePasteRows(rows).map((r) => r.company)).toContain("Brahmaputra Traders");
  });
});
