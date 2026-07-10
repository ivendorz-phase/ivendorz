import { describe, expect, it } from "vitest";
import { policyDurationToMs } from "@/modules/identity/contracts";

// W2-IDN-7 — the unified POLICY-duration interpreter (`domain/value-objects/policy-duration.ts`), the
// single source that replaced the three former byte-identical copies (`create-delegation-grant.command`
// `durationToMs`, `expire-invitations.command` `durationToMs`, `command-dedup.repository` `windowToMs`
// — RV-0153 OBS-Δ3 / RV-0149 F4). Pins the behavior the three copies shared so the canonicalization is
// provably behavior-preserving: the parse arms, the Doc-3 v1.9 seeded values, and the VERBATIM throw
// message each call site formerly emitted (reproduced via the context label).

describe("W2-IDN-7 policyDurationToMs — unified POLICY-duration interpreter", () => {
  it("interprets each registered <int><unit> arm (s/m/h/d)", () => {
    expect(policyDurationToMs("30s", "k")).toBe(30_000);
    expect(policyDurationToMs("5m", "k")).toBe(300_000);
    expect(policyDurationToMs("24h", "k")).toBe(86_400_000);
    expect(policyDurationToMs("7d", "k")).toBe(604_800_000);
  });

  it("interprets a bare finite number as SECONDS (the integer-seconds arm)", () => {
    expect(policyDurationToMs(60, "k")).toBe(60_000);
    expect(policyDurationToMs(0, "k")).toBe(0);
  });

  it("interprets the 5 Doc-3 v1.9 seeded duration values exactly", () => {
    expect(policyDurationToMs("24h", "k")).toBe(86_400_000); // *_dedup_window (×3)
    expect(policyDurationToMs("14d", "k")).toBe(1_209_600_000); // membership_invite_expiry_window
    expect(policyDurationToMs("365d", "k")).toBe(31_536_000_000); // delegation_validity_default
    expect(policyDurationToMs("1h", "k")).toBe(3_600_000); // delegation_expiry_sweep_cadence
    expect(policyDurationToMs("7d", "k")).toBe(604_800_000); // ownership_succession_reminder_cadence
  });

  it("tolerates surrounding/inner whitespace (trim + optional inner space), as the former copies did", () => {
    expect(policyDurationToMs(" 24h ", "k")).toBe(86_400_000);
    expect(policyDurationToMs("24 h", "k")).toBe(86_400_000);
  });

  it("throws (no invented fallback) on an uninterpretable value — a non-finite number", () => {
    expect(() => policyDurationToMs(Number.NaN, "k")).toThrow(/not an interpretable duration/);
    expect(() => policyDurationToMs(Number.POSITIVE_INFINITY, "k")).toThrow(
      /not an interpretable duration/,
    );
  });

  it("throws on an uninterpretable string / unknown unit / wrong type", () => {
    expect(() => policyDurationToMs("24w", "k")).toThrow(/not an interpretable duration/); // 'w' not a unit
    expect(() => policyDurationToMs("later", "k")).toThrow(/not an interpretable duration/);
    expect(() => policyDurationToMs(null, "k")).toThrow(/not an interpretable duration/);
    expect(() => policyDurationToMs({}, "k")).toThrow(/not an interpretable duration/);
  });

  it("reproduces each former call site's VERBATIM throw message via the context label", () => {
    // The three former copies threw these exact strings; the template `${label} value is not an
    // interpretable duration (W2-IDN-7 seed).` reproduces them byte-for-byte.
    expect(() => policyDurationToMs("x", "identity.delegation_validity_default")).toThrow(
      "identity.delegation_validity_default value is not an interpretable duration (W2-IDN-7 seed).",
    );
    expect(() => policyDurationToMs("x", "identity.membership_invite_expiry_window")).toThrow(
      "identity.membership_invite_expiry_window value is not an interpretable duration (W2-IDN-7 seed).",
    );
    expect(() => policyDurationToMs("x", "command-dedup window POLICY")).toThrow(
      "command-dedup window POLICY value is not an interpretable duration (W2-IDN-7 seed).",
    );
  });
});
