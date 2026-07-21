// Event names + versioned payload types emitted by module "communication" (Doc-2 §8 / Doc-4J catalog).
//
// M6 EMITS no Doc-2 §8 domain event (Doc-4H §H7 / Part-3 H.7 as flipped — no event coined; the
// audited write is `business write + audit append` in one transaction, no outbox/event leg).
//
// CONSUMPTION (the Doc-4H_GrowthDelivery_Patch_v1.0.1 §3(a) flip): BC-COMM-3 consumes EXACTLY ONE
// event — the **M1-owned** `InvitationIssued` (idempotent on `event_id`; ownership stays with M1;
// declaration = `@/modules/identity/contracts` events surface, bound by pointer — a consumed event
// is NEVER re-declared by its consumer, Doc-4A §4.4 single-authorship). BC-COMM-2 is untouched
// (no notification exists for an external invitee — patch §3(b)). BC-COMM-4 emits and consumes
// none (R11). This stub therefore still declares nothing.
export {};
