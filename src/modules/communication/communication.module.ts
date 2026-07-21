// Composition root for module "communication" — wires the module and exposes contracts only
// (REPOSITORY_STRUCTURE §3). W3-COMM-1 realizes the BC-COMM-4 Support Communications surface (Doc-4H
// Pass-B Part-4; Doc-5H §7): the four audited Support-Ticket mutations + the two reads.
// W3-COMM-GRW-1 adds the BC-COMM-3 growth-delivery surface: `comm.dispatch_invitation_delivery.v1`
// (Doc-4H GrowthDelivery Patch v1.0.1 §HB-3.6 — the System consumer of the M1-owned
// `InvitationIssued`) + the §2 invitation retry orchestration. Other modules consume
// `communicationServices`, never the application/infrastructure layers directly.

import {
  addTicketMessage,
  closeTicket,
  createTicket,
  dispatchInvitationDelivery,
  getTicket,
  listFailedInvitationDeliveries,
  listTickets,
  retryInvitationDelivery,
  updateTicket,
} from "./contracts/services";

/** The M6 caller-facing surface realized so far (BC-COMM-4 + the BC-COMM-3 growth-delivery slice). */
export const communicationServices = {
  createTicket,
  updateTicket,
  addTicketMessage,
  closeTicket,
  getTicket,
  listTickets,
  dispatchInvitationDelivery,
  retryInvitationDelivery,
  listFailedInvitationDeliveries,
};
