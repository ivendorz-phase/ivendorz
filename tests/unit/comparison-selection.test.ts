import { describe, expect, it } from "vitest";
import {
  MAX_COMPARE,
  MIN_COMPARE,
  defaultSelection,
  normalizeSelection,
  parseSelParam,
} from "../../app/(app)/(workspace)/buy/_components/comparison-workspace/selection";

// The 2–5 comparison selection.
//
// This pure function is the ONLY place the selection rule lives, and both the server page and the client
// provider call it — that shared call is what keeps the rendered columns and the server-computed
// arithmetic from disagreeing. It is also the boundary that stops a URL from mixing RFQs: ids are always
// intersected with the disclosed set of ONE RFQ, so a `?sel=` carrying another RFQ's quotation ids can
// never widen the comparison.
//
// The fixture universe tops out at 3 disclosed quotations, so the cap behaviour is exercised here with
// synthetic ids rather than left unverified.

const FIVE = ["a", "b", "c", "d", "e"];
const SIX = [...FIVE, "f"];

describe("selection bounds", () => {
  it("pins the frozen 2–5 window", () => {
    expect(MIN_COMPARE).toBe(2);
    expect(MAX_COMPARE).toBe(5);
  });
});

describe("parseSelParam", () => {
  it("normalizes the three shapes Next.js can hand over", () => {
    expect(parseSelParam(undefined)).toEqual([]);
    expect(parseSelParam("a")).toEqual(["a"]);
    expect(parseSelParam(["a", "b"])).toEqual(["a", "b"]);
  });
});

describe("defaultSelection", () => {
  it("takes the first MAX_COMPARE disclosed ids in System order", () => {
    expect(defaultSelection(SIX)).toEqual(FIVE);
  });

  it("returns everything when fewer than MAX_COMPARE are disclosed", () => {
    expect(defaultSelection(["a", "b"])).toEqual(["a", "b"]);
  });
});

describe("normalizeSelection", () => {
  const fallback = ["a", "b"];

  it("accepts a two-quotation selection — the minimum viable comparison", () => {
    expect(normalizeSelection(["a", "b"], FIVE, fallback)).toEqual(["a", "b"]);
  });

  it("accepts a five-quotation selection — the maximum", () => {
    expect(normalizeSelection(FIVE, FIVE, fallback)).toEqual(FIVE);
  });

  it("caps a six-quotation request at five rather than rendering six columns", () => {
    const result = normalizeSelection(SIX, SIX, fallback);
    expect(result).toHaveLength(MAX_COMPARE);
    expect(result).toEqual(FIVE);
  });

  it("falls back when a single quotation is requested — one column is not a comparison", () => {
    expect(normalizeSelection(["c"], FIVE, fallback)).toEqual(fallback);
  });

  it("falls back on an empty request", () => {
    expect(normalizeSelection([], FIVE, fallback)).toEqual(fallback);
  });

  it("drops ids that are not disclosed on this RFQ", () => {
    // The cross-RFQ guard: "x" and "y" stand in for another RFQ's quotation ids arriving via the URL.
    expect(normalizeSelection(["a", "x", "b", "y"], FIVE, fallback)).toEqual(["a", "b"]);
  });

  it("falls back when every requested id is foreign", () => {
    // A selection built entirely from another RFQ's ids must not silently become that RFQ's comparison.
    expect(normalizeSelection(["x", "y"], FIVE, fallback)).toEqual(fallback);
  });

  it("de-duplicates repeated ids instead of rendering a vendor twice", () => {
    expect(normalizeSelection(["a", "a", "b", "b"], FIVE, fallback)).toEqual(["a", "b"]);
  });

  it("restores System order regardless of the order requested", () => {
    // Order is the contract's, never the URL's — otherwise `?sel=` becomes a ranking control (R6/GI-04).
    expect(normalizeSelection(["d", "a", "c"], FIVE, fallback)).toEqual(["a", "c", "d"]);
  });

  it("is deterministic — the server and client derive the same subset from the same input", () => {
    const once = normalizeSelection(["e", "b", "zz", "b"], FIVE, fallback);
    const twice = normalizeSelection(["e", "b", "zz", "b"], FIVE, fallback);
    expect(once).toEqual(twice);
    expect(once).toEqual(["b", "e"]);
  });

  it("removing a quotation re-derives the comparison without touching the others", () => {
    const before = normalizeSelection(["a", "b", "c"], FIVE, fallback);
    const after = normalizeSelection(
      before.filter((id) => id !== "b"),
      FIVE,
      fallback,
    );
    expect(before).toEqual(["a", "b", "c"]);
    expect(after).toEqual(["a", "c"]);
  });

  it("dropping to one remaining id falls back rather than showing a single column", () => {
    expect(normalizeSelection(["a"], FIVE, fallback)).toEqual(fallback);
  });
});
