# Doc-4A Review Log (Authoring History — NON-NORMATIVE)

| Field | Value |
|---|---|
| Status | Authoring history only. Not part of the frozen Doc-4A specification. |
| Purpose | Preserves per-pass review findings extracted from Doc-4A content passes per Architecture Board decision (review 4, "Embedded Review Section": findings must never remain in normative content). |

Board dispositions applied (review 4): F-002, F-003, F-004, F-005, F-008, F-009, F-010 patched into Pass 2 content; P2-B1 (delegation intersection reading, F-001) — **Architecture Board Ratification: APPROVED**, closed, not a freeze blocker.

---

# Pass 1 Findings (§0–§3)

### BLOCKER — all resolved before this output

| ID | Finding | Resolution |
|---|---|---|
| P1-B1 | The frozen structure required a conflict-handling mechanism but no procedure existed; without it, the conformance obligation (§0.1) is unenforceable when an author hits a genuine corpus conflict. | Added §0.6 Flag-and-Halt as the single conflict procedure, grounded in Master Architecture §22.7. |
| P1-B2 | §3 needed a contract notation, but §21 (templates) is not yet authored — a forward dependency that could stall Pass 1 or invite invention. | §3.3 defines the binding notation grammar (field tables, abstract type set, pointer format); §21 will instantiate this grammar, not define a competing one. Recorded as the normative-home assignment. |

### MAJOR — all resolved before this output

| ID | Finding | Resolution |
|---|---|---|
| P1-M1 | Casing/format for enum and state values is not stated anywhere in the frozen corpus as a convention; inventing a casing rule risked contradicting Doc-2 verbatim values. | §3.1/§3.2 adopt the verbatim-from-Doc-2 rule instead of a casing rule: values are quoted exactly; no Doc-4 document normalizes them. |
| P1-M2 | RECOMMENDED has two project uses (RFC-2119 strength; template status per frozen §21.3/21.4) — ambiguity would let module docs treat RECOMMENDED-template rules as optional even when the template is used. | §3.4 defines both uses and fixes the binding rule: a RECOMMENDED template, once used, is MUST-level. |
| P1-M3 | Doc-4L (integration index) could be cited as a contract source, recreating duplicated truth. | §1.3 marks Doc-4L non-normative and forbids citing it as a source. |
| P1-M4 | The notification-contract vacuum (ADR §E-5) needed an explicit interim prohibition in scope, or module documents would fill it. | §1.2 assigns the matrix to Doc-4H and prohibits interim invention. |

### MINOR — open, carried to later passes

| ID | Finding | Disposition |
|---|---|---|
| P1-m1 | The abstract type set (§3.3) may need extension (e.g., duration, geo) when module contracts surface real needs. | Extend only by Doc-4A patch; revisit at Pass covering §9–§10. |
| P1-m2 | Appendix A applicability to Doc-4L (non-normative index) is undefined. | Resolve when Appendix A is authored: index gets a reduced check set. |
| P1-m3 | §3.5 assumes patch IDs remain stable across reissues; the corpus practice (integrated reissues, e.g., Doc-3 v1.0.1) supports this but it is unratified. | Note for the Governance Note's next revision; no content risk now. |

### NITPICK — open

| ID | Finding | Disposition |
|---|---|---|
| P1-n1 | Family-map letters (4B…4L) bake module order into document names; a future module split forces relettering. | Accepted; §1.3 already requires map changes by patch. |
| P1-n2 | §2 cites Master Architecture §23 principle numbers; if Architecture is ever repaginated, citations need refresh. | Architecture is frozen; Appendix C will carry the resolution table. |

---

# Pass 2 Findings (§4–§8)

### BLOCKER — all resolved before this output

| ID | Finding | Resolution |
|---|---|---|
| P2-B1 | **Delegation permission-inheritance ambiguity.** The frozen access formula ("…OR Active Delegation Grant = Access", Master Architecture §6.5/§13.2) could be read as the grant alone sufficing, letting any member of a representative org act without internal authorization — an authorization-integrity hole. | §6B.2 fixes the conservative intersection reading: membership + slug inside the representative org + grant whose `permission_set` includes the slug + vendor-profile scope. This is the only reading consistent with the three-layer check and the worked example in Master Architecture §13.2 (sales agent of Org Y). Recorded for explicit Board ratification since it interprets, not copies, the formula. |
| P2-B2 | **Tier-change event flow risked reading as a cross-ownership write** (declared tier owned by Marketplace, verified tier by Trust, history written by Marketplace on Trust's event). A naive §4B "owner writes its signal" rule would contradict Doc-2 §8 / PATCH-04. | §4B.3 added: event-synchronized signal data preserves the catalog's exact split; direct-write shortcuts prohibited; canonical example cited by pointer. |
| P2-B3 | **Timing channel absent from the structure's non-disclosure list scope** would leave a discoverable side channel (synchronous early-exit on blacklist gate). | §7.5 includes timing as a bound channel with a contract-level rule (protected gating inside uniform/async paths), consistent with Doc-3's routing-stage enforcement. |

### MAJOR — all resolved before this output

| ID | Finding | Resolution |
|---|---|---|
| P2-M1 | **"Platform Staff" as an actor type would invent a fifth actor**, conflicting with the audit model's four actor types (Master Architecture §14.2). | §5.2 maps platform staff into the **Admin** actor space, differentiated by `staff_*` permission bundles (Support/Verification/Super Admin named per Master Architecture §13.5). No new actor type created. |
| P2-M2 | **Derived read-models** (matching results, vendor matching attributes) had no surface rule and could widen visibility or be treated as authoritative. | §7.2 derived-class row: non-authoritative, visibility inherited from authoritative sources, never widened. |
| P2-M3 | **Service-to-service transitive trust**: a called module honoring the caller's authorization without re-verification would create an implicit bypass. | §5.5: called modules re-verify against propagated context; privileged execution paths retain scope filtering + audit (Master Architecture §6.3 service-role policy). |
| P2-M4 | **Delegation revocation left standing visibility** would breach tenancy: materialized grantee/visibility rows must fall with the grant. | §6B.5 binds revocation to materialized-row removal with audit (Doc-2 §6, PATCH-02), and routes post-revocation failures through §7.5 semantics. |
| P2-M5 | **Shared-kernel abuse** (business endpoints placed in Doc-4B as "shared utilities") had no explicit prohibition. | §4.3 names it a rejected pattern; Module 0 surface is infrastructure-only per Master Architecture §17.1. |

### MINOR — open, carried forward

| ID | Finding | Disposition |
|---|---|---|
| P2-m1 | §6B.1's delegation-eligible operation list is indicative; the authoritative eligible-slug set is the Doc-2 §7 "also via delegation grant" annotations. Module documents must derive eligibility from the catalog, not from §6B.1's examples. | Add an Appendix A check: delegation-eligible declarations must match Doc-2 §7 annotations. |
| P2-m2 | §7.5 timing rule constrains contract design but cannot fully bind implementation timing; residual enforcement belongs to development/QA documents. | Note for the Development Decomposition (timing-leak test guidance). |
| P2-m3 | §8.2 lookup-by-human_ref needs an error-semantics note (unknown human_ref vs no-access) once §12 exists. | Resolve in Pass covering §12; bind to §7.5. |

### NITPICK — open

| ID | Finding | Disposition |
|---|---|---|
| P2-n1 | Doc-2 A-01 places `delegation_grants` in Identity; §6B text avoids naming the owner to stay restatement-free, citing by pointer. | Acceptable; Appendix C will carry the resolution. |
| P2-n2 | §4.2's table labels Commands/Queries/Events as "surface kinds" while Master Architecture §16.4 says modules "expose only Commands, Queries, and Events" — identical meaning, slightly different framing. | Wording-level; no action. |

---

# Pass 3 Findings (§9–§12) — self-review, recorded per Board extraction rule

### BLOCKER — all resolved before output

| ID | Finding | Resolution |
|---|---|---|
| P3-B1 | **Offset pagination leaks exclusions.** Index/offset pagination lets a vendor measure exclusion counts by offset arithmetic, breaching §7.5 (counts/pagination channels). | §9.6 mandates opaque cursors platform-wide and prohibits offset/index pagination outright. |
| P3-B2 | **AUTHORIZATION vs NOT_FOUND boundary was undefined**, leaving each module to decide when "you may not" becomes "it does not exist" — the single largest non-disclosure leak surface. | §12.4 defines the boundary by the caller's established right-to-know-existence; per-failure-point declaration mandatory; safe default NOT_FOUND (§12.6). |
| P3-B3 | **Validation-failure side effects could create alternate workflows** (auto-draft on rejection, auto-state "needs_fix"), silently extending frozen state machines. | §11.3: validation failure has no effect; alternate-workflow behaviors prohibited unless they are corpus-defined transitions (moderation rejection cited as the legal contrast case). |

### MAJOR — all resolved before output

| ID | Finding | Resolution |
|---|---|---|
| P3-M1 | Cross-module response embedding would duplicate ownership of representations and let stale copies masquerade as truth. | §10.6: cross-module references stay references; expansion only within own aggregate; no transitive expansion. |
| P3-M2 | `total_count` on protected surfaces contradicts §7.5 unless exclusion-consistent. | §10.3 makes totals contract-optional; §10.7 binds items/counts/totals/facets to one exclusion set. |
| P3-M3 | Batch mutations could become hidden cross-aggregate transactions (violating aggregate boundaries) or hidden workflows. | §9.8 + §10.5: batches are lists of independent single-aggregate operations with per-item outcomes; cross-aggregate atomicity prohibited. |
| P3-M4 | Error messages interpolating dynamic data (names, counts, states) are a tenancy/disclosure leak channel not covered by codes alone. | §12.3: fixed message catalogs; no interpolation of data the caller cannot otherwise read; branching on class/code only. |
| P3-M5 | Validation rules without source pointers would let modules smuggle invented business logic into contracts. | §11.1: every rule cites corpus pointer, POLICY key, or Doc-4A section; sourceless rules rejected. |
| P3-M6 | STATE errors naming current state to any caller would disclose protected workflow facts (e.g., RFQ progress to a non-invited vendor). | §12.5: state detail only to callers already entitled to read the state; otherwise protected-fact collapse. |

### MINOR — open, carried forward

| ID | Finding | Disposition |
|---|---|---|
| P3-m1 | Cursor stability semantics under concurrent change are declared (at-most-once per traversal, no snapshot promise) but need test guidance. | Development Decomposition (with P2-m2 timing tests). |
| P3-m2 | Redacted-field representation (absent vs placeholder) is contract-declared per §10.7; a platform-wide default may be worth fixing in §21 template instructions. | Decide in Pass covering §21. |
| P3-m3 | `reference_id` correlation lookups must themselves be access-controlled (support/audit surface) or they become an oracle. | Bind in §17/Doc-4B audit-query contracts; note carried. |

### NITPICK — open

| ID | Finding | Disposition |
|---|---|---|
| P3-n1 | `REFERENCE` and `BUSINESS` error classes extend the frozen structure's indicative class list (it said "canonical error classes" non-exhaustively); the closed set is now normative. | Consistent with frozen §12 purpose; note for Appendix C. |
| P3-n2 | §12.1 `reference_id : uuid` uses the abstract type set; no human_ref for correlation IDs by design. | No action. |
