# Doc-4 Governance Note v1.0

| Field | Value |
|---|---|
| Status | APPROVED (Architecture Board, per Doc-4A structure review) |
| Scope | Governance authority of the Doc-4 document family. No architecture change. |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2 — all FROZEN |

## Declaration

1. **Doc-4A — API Standards & Conventions governs all Doc-4 descendants.** Every Doc-4 document (Doc-4B…4N) must conform to Doc-4A. Non-conforming documents fail review and may not be frozen.

2. **Extended precedence chain (ratified here, not by Architecture patch):**

```
Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B…4N
```

Doc-4A may never override Architecture, ADRs, Doc-2, or Doc-3. On any conflict, the higher document prevails and Doc-4A must be patched.

3. **Doc-4A defines standards only.** It defines no entities, no workflows, no endpoints, no module contracts. All actual contracts live in module documents.

4. **Amendment rule.** After freeze, Doc-4A changes only through the established patch process (approved patch documents, minimal additive scope). Module documents may never locally deviate from Doc-4A as a substitute for a patch.

5. **Reserved namespaces** (Doc-4A Appendix B) are allocated only by Doc-4A amendment, never by module-document invention.

*End of Doc-4 Governance Note v1.0.*
