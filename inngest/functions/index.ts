import type { InngestFunction } from "inngest";
import { dispatchOutbox } from "./dispatch-outbox";

// Inngest job functions registry — outbox consumers (REPOSITORY_STRUCTURE §7).
//
// The M0 transactional-outbox dispatcher (`dispatchOutbox`) drains `core.outbox_events`
// `pending → dispatched` (Doc-8B §7.2; Doc-4B — M0 owns the outbox). It is registered here as the
// async-jobs spine over the outbox; the drain logic lives in M0 infrastructure and is consumed via
// `@/modules/core/contracts` (contracts-only cross-module access). Emitter-agnostic (R-a /
// ESC-W1-OUTBOX): it dispatches test-seeded rows now and real write-plus-emit rows in Wave 2 with no
// code change. Each module's own jobs are added here as their owning wave lands.
export const functions: InngestFunction.Any[] = [dispatchOutbox];
