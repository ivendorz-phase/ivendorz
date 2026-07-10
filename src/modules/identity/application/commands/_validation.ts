// M1 application (PRIVATE) — shared SYNTAX-validation primitives for the identity command layer.
//
// Extracted (W2 maintainability refactor — DRY only, no behavior change) from 14 command files that
// each declared a byte-identical `UUID_PATTERN`. Module-PRIVATE: imported solely by sibling
// `application/commands/*.command.ts`; never re-exported through `contracts/` and never imported
// outside the identity module (One-Module-One-Owner). Single-purpose — id-shape validation only.

/**
 * RFC-4122 UUID shape for path/id segments (Doc-5A §5.4 — a malformed segment is SYNTAX, category 1;
 * Doc-4A §11.2). Case-insensitive. The single source for the identity command layer's id-shape check.
 */
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
