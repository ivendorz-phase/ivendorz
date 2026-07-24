// Unit tests — P-BUY-07 New-RFQ submission-readiness evaluation (pure module; no DB, no React).
// Verifies the FE mirror of the Doc-3 §1.2 submission FIXED-set: the four badge-tiers, the conditional
// spec rule, the presentation readiness states, and the per-section rail status.

import { describe, it, expect } from "vitest";
import {
  parseAmount,
  isSpecSatisfied,
  evaluateBlockers,
  evaluateWarnings,
  readinessState,
  sectionStatuses,
  evaluateReadiness,
} from "../../../app/(app)/(workspace)/buy/_components/rfq-create/rfq-draft-validation";
import type { RfqDraftForm } from "../../../app/(app)/(workspace)/buy/_components/rfq-create/rfq-form-models";

const MIN = 200;

/** A draft that satisfies every submission blocker (written-scope path). */
function readyForm(): RfqDraftForm {
  return {
    categoryId: "c-ms-plate",
    categoryLabel: "Mild steel plate",
    workNature: ["supply"],
    budget: "1,800,000",
    district: "Gazipur",
    routingMode: "approved_open",
    noFormalSpec: true,
    scopeText: "x".repeat(MIN),
  };
}

describe("parseAmount", () => {
  it("strips grouping separators and whitespace", () => {
    expect(parseAmount("1,800,000")).toBe(1800000);
    expect(parseAmount("1 800 000")).toBe(1800000);
  });
  it("treats blank / non-numeric as 0", () => {
    expect(parseAmount(undefined)).toBe(0);
    expect(parseAmount("")).toBe(0);
    expect(parseAmount("abc")).toBe(0);
  });
});

describe("isSpecSatisfied (conditional rule)", () => {
  it("is met by at least one ready attachment", () => {
    const form: RfqDraftForm = { attachments: [{ id: "a", name: "spec.pdf", status: "ready" }] };
    expect(isSpecSatisfied(form, MIN)).toBe(true);
  });
  it("ignores a too-large attachment", () => {
    const form: RfqDraftForm = { attachments: [{ id: "a", name: "big.pdf", status: "too-large" }] };
    expect(isSpecSatisfied(form, MIN)).toBe(false);
  });
  it("is met by no_formal_spec + scope at/above the min", () => {
    expect(isSpecSatisfied({ noFormalSpec: true, scopeText: "x".repeat(MIN) }, MIN)).toBe(true);
  });
  it("is NOT met by no_formal_spec with scope below the min", () => {
    expect(isSpecSatisfied({ noFormalSpec: true, scopeText: "x".repeat(MIN - 1) }, MIN)).toBe(
      false,
    );
  });
  it("is NOT met by a long scope WITHOUT no_formal_spec and without an attachment", () => {
    expect(isSpecSatisfied({ scopeText: "x".repeat(MIN + 50) }, MIN)).toBe(false);
  });
  it("honours a different server-provided threshold", () => {
    expect(isSpecSatisfied({ noFormalSpec: true, scopeText: "x".repeat(50) }, 50)).toBe(true);
    expect(isSpecSatisfied({ noFormalSpec: true, scopeText: "x".repeat(49) }, 50)).toBe(false);
  });
});

describe("evaluateBlockers", () => {
  it("mirrors the six FIXED-set checks, all unmet on a blank draft", () => {
    const blockers = evaluateBlockers({}, MIN);
    expect(blockers.map((b) => b.id).sort()).toEqual(
      [
        "category",
        "district",
        "estimated_value",
        "routing_mode",
        "specification",
        "work_nature",
      ].sort(),
    );
    expect(blockers.every((b) => !b.met)).toBe(true);
  });
  it("marks estimated_value unmet when it is 0 and met when > 0", () => {
    expect(
      evaluateBlockers({ budget: "0" }, MIN).find((b) => b.id === "estimated_value")!.met,
    ).toBe(false);
    expect(
      evaluateBlockers({ budget: "1" }, MIN).find((b) => b.id === "estimated_value")!.met,
    ).toBe(true);
  });
  it("anchors estimated_value to the value section (not budget/optional)", () => {
    const ev = evaluateBlockers({}, MIN).find((b) => b.id === "estimated_value")!;
    expect(ev.section).toBe("value");
    expect(ev.label).toMatch(/greater than BDT 0/i);
  });
  it("passes every blocker on a fully-ready form", () => {
    expect(evaluateBlockers(readyForm(), MIN).every((b) => b.met)).toBe(true);
  });
});

describe("readinessState (presentation only)", () => {
  it("is not-ready with any unmet blocker", () => {
    const form: RfqDraftForm = {};
    expect(readinessState(evaluateBlockers(form, MIN), evaluateWarnings(form))).toBe("not-ready");
  });
  it("is needs-attention when blockers pass but a warning is unmet", () => {
    const form = readyForm(); // no items, no date, no attachment, no contact → warnings unmet
    expect(readinessState(evaluateBlockers(form, MIN), evaluateWarnings(form))).toBe(
      "needs-attention",
    );
  });
  it("is ready when all blockers and warnings pass", () => {
    const form: RfqDraftForm = {
      ...readyForm(),
      itemRows: [{ id: "1", itemName: "MS plate", size: "", quantity: "10", unit: "pcs" }],
      deliveryDate: "2026-09-15",
      attachments: [{ id: "a", name: "spec.pdf", status: "ready" }],
      contactPersonName: "Engr. Kamrul",
    };
    expect(readinessState(evaluateBlockers(form, MIN), evaluateWarnings(form))).toBe("ready");
  });
});

describe("sectionStatuses (rail dots + badges)", () => {
  it("flags the four blocking sections on a blank draft, requirement/attachments/terms/comms carry no badge", () => {
    const s = sectionStatuses({}, MIN);
    expect(s.specification.blockers).toBe(1);
    expect(s.delivery.blockers).toBe(1);
    expect(s.routing.blockers).toBe(1);
    expect(s.value.blockers).toBe(1);
    expect(s.requirement.blockers).toBe(0);
    expect(s.attachments.blockers).toBe(0);
    expect(s.terms.blockers).toBe(0);
    expect(s.communication.blockers).toBe(0);
  });
  it("marks requirement done once category + work nature are set", () => {
    expect(sectionStatuses({ categoryId: "c", workNature: ["supply"] }, MIN).requirement.done).toBe(
      true,
    );
    expect(sectionStatuses({ categoryId: "c" }, MIN).requirement.done).toBe(false);
  });
  it("clears the value badge once estimated_value > 0", () => {
    expect(sectionStatuses({ budget: "500" }, MIN).value).toEqual({ done: true, blockers: 0 });
  });
});

describe("evaluateReadiness snapshot", () => {
  it("reports met/total blockers and the derived state together", () => {
    const snap = evaluateReadiness(readyForm(), MIN);
    expect(snap.metBlockers).toBe(snap.totalBlockers);
    expect(snap.state).toBe("needs-attention");
  });
});
