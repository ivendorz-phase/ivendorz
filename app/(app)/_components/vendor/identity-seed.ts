// Vendor Workspace — identity PLACEHOLDER (Doc-7C SR3, `get_active_context` — PARKED). A single
// source for the neutral identity fixture shared by the shell (`vendor-shell-vm.ts`) and any
// page-level surface that greets the user (the VX-01 dashboard header card) — so the two never
// drift into two independent fabrications of "who is signed in". Mirrors the buyer track's own
// `BUYER_IDENTITY_SEED` (`(buyer)/_components/identity-seed.ts`) byte-for-byte in shape and intent.
// Replaced by the real wired context at integration (Inv #5: the client never asserts org identity;
// this is a server-side placeholder only).
export const VENDOR_IDENTITY_SEED = {
  userName: "Your account",
  orgName: "Active organization",
} as const;
