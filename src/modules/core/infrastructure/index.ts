// M0 infrastructure barrel (PRIVATE — not a cross-module surface). Adapters that invoke the
// `core` schema directly. Cross-module callers reach these only through the module composition
// root (core.module.ts) / contracts, never by importing infrastructure (REPOSITORY_STRUCTURE).

export { allocateHumanReference } from "./data/human-reference.service";
export { appendAuditRecord } from "./data/audit-record.service";
export { configValueQuery } from "./data/system-configuration.service";
export { featureFlagEvaluate } from "./data/feature-flag.service";
export {
  archiveDispatchedEvents,
  dispatchOutboxEvents,
  drainOutbox,
} from "./events/drain-outbox.service";
// [growth/integration MERGE UNION] `core.write_outbox_event.v1` — ONE adapter post-merge:
// Lane A's envelope-stamping writer, bound to the W3-BILL-4 SECURITY DEFINER function (see the
// service header). The billing-side `data/outbox-event.service.ts` was folded into it.
export { writeOutboxEvent } from "./events/write-outbox-event.service";
export type { DrainOutboxOptions, DrainOutboxResult } from "./events/drain-outbox.service";
