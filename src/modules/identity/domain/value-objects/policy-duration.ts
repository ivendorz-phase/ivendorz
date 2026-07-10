// M1 domain (PRIVATE) — canonical interpreter for the Doc-3 v1.9 registered POLICY duration notation.
//
// CANONICALIZATION (W2-IDN-7, RV-0153 OBS-Δ3 + RV-0149 F4): the identical `<int><unit>` duration
// interpreter was hand-copied into three M1 sites — `create-delegation-grant.command.ts` (`durationToMs`),
// `expire-invitations.command.ts` (`durationToMs`) and `command-dedup.repository.ts` (`windowToMs`). Each
// copy was byte-identical in logic, differing ONLY in the key label it names on the throw. This module is
// the single source; the three sites now bind it by pointer. Behavior-preserving: the parse arms and the
// throw message template are unchanged, so every prior test stays green.
//
// GROUNDING (interprets, coins nothing): the accepted forms are the Doc-3 v1.9 (`identity.*` POLICY-key
// registration) duration notation — `<int><unit>` with unit ∈ {s, m, h, d} (the v1.9 start values use
// `24h` · `14d` · `365d` · `1h` · `7d`); a bare finite number is read as SECONDS. The canonical
// `value_jsonb` encoding is owned by the W2-IDN-7 seed + the Doc-6B `value_type='duration'` semantics —
// this interpreter conforms to that registered notation. An uninterpretable value THROWS (fail-loud); it
// never invents a fallback window.

type DurationUnit = "s" | "m" | "h" | "d";

/** Milliseconds per registered duration unit (Doc-3 v1.9 `<int><unit>` notation). */
const DURATION_UNIT_MS: Record<DurationUnit, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/** Matches the registered `<int><unit>` form (optional inner whitespace), unit ∈ {s, m, h, d}. */
const DURATION_RE = /^(\d+)\s*([smhd])$/;

/**
 * Interpret a stored POLICY duration value into milliseconds.
 *
 * @param value        the `core.config_value_query.v1` result value (a `<int><unit>` string, or a bare
 *                     finite number read as seconds).
 * @param contextLabel the key/context named in the throw message (e.g.
 *                     `"identity.delegation_validity_default"`) — preserves each call site's original
 *                     error text verbatim.
 * @throws Error when the value is neither a finite number nor a `<int><unit>` string — the caller aborts
 *         rather than proceeding on an invented window (Doc-4A §18.2 fail-loud; W2-IDN-7 seed guarantees
 *         the shape).
 */
export function policyDurationToMs(value: unknown, contextLabel: string): number {
  if (typeof value === "number" && Number.isFinite(value)) return value * 1000;
  if (typeof value === "string") {
    const match = DURATION_RE.exec(value.trim());
    if (match !== null) {
      const magnitude = Number(match[1]);
      const unitMs = DURATION_UNIT_MS[match[2] as DurationUnit];
      return magnitude * unitMs;
    }
  }
  throw new Error(`${contextLabel} value is not an interpretable duration (W2-IDN-7 seed).`);
}
