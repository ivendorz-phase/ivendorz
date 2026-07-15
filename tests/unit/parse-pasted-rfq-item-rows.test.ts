import { describe, expect, it } from "vitest";
// Relative import: the `@/*` alias resolves to `src/*` only, so app-layer surfaces are not aliasable.
import { parsePastedRows } from "../../app/(app)/(workspace)/buy/_components/rfq-create/item-requirements-table";

// Column-dispatch guard for the New-RFQ "Paste from Excel" helper.
//
// The paste width DECIDES which field each cell lands in, so an off-by-one in the dispatch silently
// corrupts an entire RFQ — a size becomes a quantity, a PR # becomes an item name — and nothing
// throws. The buyer only finds out on the preview, or worse, the vendor does.
//
// The model (owner directive 2026-07-15) is 6 columns: PR #, Item Name, Size, Qty, Unit, Description.
// Sl. No. is auto-numbered by the grid and is NEVER pasted — that is why the primary width is 6.
// The pre-PR-# widths (5/4/3) keep their ORIGINAL meaning so sheets copied before PR # existed do
// not shift by one column; those cases are the regression surface and are pinned individually.

describe("parsePastedRows — column dispatch", () => {
  describe("6 columns — the current model (PR #, Item Name, Size, Qty, Unit, Description)", () => {
    it("maps every cell to its field", () => {
      const [row] = parsePastedRows(
        "PR-2026-0184\tMS plate 12mm\t2000x1000mm\t50\tpcs\tMill-certified",
      );
      expect(row).toMatchObject({
        prNumber: "PR-2026-0184",
        itemName: "MS plate 12mm",
        size: "2000x1000mm",
        quantity: "50",
        unit: "pcs",
        description: "Mill-certified",
      });
    });

    it("keeps a blank PR # cell blank without shifting the other columns", () => {
      const [row] = parsePastedRows("\tMS plate 12mm\t2000x1000mm\t50\tpcs\tMill-certified");
      expect(row).toMatchObject({
        prNumber: "",
        itemName: "MS plate 12mm",
        size: "2000x1000mm",
        quantity: "50",
      });
    });
  });

  describe("pre-PR-# widths keep their original meaning (no silent shift)", () => {
    it("5 columns = Item Name/Size/Qty/Unit/Description — the first cell is NOT read as a PR #", () => {
      const [row] = parsePastedRows("MS plate 12mm\t2000x1000mm\t50\tpcs\tMill-certified");
      expect(row).toMatchObject({
        prNumber: "",
        itemName: "MS plate 12mm",
        size: "2000x1000mm",
        quantity: "50",
        unit: "pcs",
        description: "Mill-certified",
      });
    });

    it("4 columns = Item Name/Size/Qty/Unit", () => {
      const [row] = parsePastedRows("MS plate 12mm\t2000x1000mm\t50\tpcs");
      expect(row).toMatchObject({
        prNumber: "",
        itemName: "MS plate 12mm",
        size: "2000x1000mm",
        quantity: "50",
        unit: "pcs",
        description: "",
      });
    });

    it("3 columns = Item Name/Qty/Unit, with no Size", () => {
      const [row] = parsePastedRows("MS plate 12mm\t50\tpcs");
      expect(row).toMatchObject({
        prNumber: "",
        itemName: "MS plate 12mm",
        size: "",
        quantity: "50",
        unit: "pcs",
      });
    });
  });

  describe("cross-cutting behavior survives the added column", () => {
    it("parses multiple rows and auto-assigns distinct ids", () => {
      const rows = parsePastedRows(
        "PR-1\tMS plate\t10mm\t5\tpcs\tnote one\nPR-2\tMS angle\t50x50\t8\tkg\tnote two",
      );
      expect(rows).toHaveLength(2);
      expect(rows[0].prNumber).toBe("PR-1");
      expect(rows[1].prNumber).toBe("PR-2");
      expect(rows[0].id).not.toBe(rows[1].id);
    });

    it("normalizes the unit token in the 6-column shape (kgs -> kg)", () => {
      const [row] = parsePastedRows("PR-1\tMS plate\t10mm\t5\tkgs\tnote");
      expect(row.unit).toBe("kg");
    });

    it("strips non-numeric noise from the quantity cell", () => {
      const [row] = parsePastedRows("PR-1\tMS plate\t10mm\t1,250 nos\tpcs\tnote");
      expect(row.quantity).toBe("1250");
    });

    it("HTML-escapes the Description cell before it seeds the rich editor", () => {
      const [row] = parsePastedRows("PR-1\tMS plate\t10mm\t5\tpcs\t<img src=x onerror=alert(1)>");
      expect(row.description).not.toContain("<img");
      expect(row.description).toContain("&lt;img");
    });

    it("splits comma- and semicolon-delimited 6-column rows too", () => {
      expect(parsePastedRows("PR-1,MS plate,10mm,5,pcs,note")[0]).toMatchObject({
        prNumber: "PR-1",
        description: "note",
      });
      expect(parsePastedRows("PR-1;MS plate;10mm;5;pcs;note")[0]).toMatchObject({
        prNumber: "PR-1",
        description: "note",
      });
    });

    it("drops a line carrying neither an item name nor a quantity", () => {
      expect(parsePastedRows("\t\t\t\t\t")).toEqual([]);
      expect(parsePastedRows("   \n  \n")).toEqual([]);
    });
  });
});
