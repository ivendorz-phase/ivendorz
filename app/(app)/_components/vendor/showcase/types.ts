// Vendor Project Portfolio (Digital Showcase) — presentation types for `marketplace.showcase_projects`.
//
// READ THIS BEFORE ADDING A FIELD — two tiers, deliberately distinguished:
//
//  • FROZEN (Doc-2 §10.750 "portfolio entries"; Doc-6D Pass3:50-61): the aggregate root, the
//    `content_jsonb` carrier, and the interim `display_order` / `is_visible` columns. There is NO
//    status enum on this aggregate — Doc-6D explicitly refused to coin one (Pass3:47); visibility is
//    service-level over `is_visible`, and nothing here invents a state machine. The frozen lifecycle
//    reads `draft → published` (Doc-2:293) and is expressed through that boolean alone.
//
//  • OWNER-RULED, corpus patch pending — `[ESC-6-SCHEMA-SHOWCASE]` (plan G5, ruled 2026-07-20): the
//    typed case-study fields below. They mirror the PUBLIC case-study surface (P-PUB-25) so authoring
//    matches rendering. Until an additive Doc-2/Doc-4D/Doc-5D patch binds them as columns they are
//    carried inside the frozen `content_jsonb`. Do not treat them as frozen columns.
//
// Contracts (Doc-5D §6 BC-MKT-4, unimplemented at time of writing): `create_showcase_project.v1` ·
// `update_showcase_project.v1` · `publish_showcase_project.v1` (emits NO event — none exists to emit,
// Doc-5D Pass2:115) · `get_showcase_project.v1`.
//
// All fields optional → the presentation phase has no data and renders genuine-empty states
// (VX-03: a wired read or an honest empty state, never fixture rows).

/** One case study in the vendor's portfolio (list row or editor subject). */
export interface ShowcaseProjectView {
  /** Frozen aggregate id. */
  id: string;
  /** [G5-ruled, content_jsonb] Case-study title. */
  title?: string;
  /** [G5-ruled, content_jsonb] Industry/sector served. Free text — the taxonomy binding is a
   *  wiring-time question and is NOT coined here (`ESC-MKT-VENDORTYPE` is open). */
  sector?: string;
  /** [G5-ruled, content_jsonb] Client DESCRIPTOR only — e.g. "state-owned fertilizer producer".
   *  Never a named company: the platform does not publish counterparty identities from this surface. */
  client_descriptor?: string;
  /** [G5-ruled, content_jsonb] Year or period label, server-formatted (no client clock). */
  period?: string;
  /** [G5-ruled, content_jsonb] Short narrative summary. */
  summary?: string;
  /** [G5-ruled, content_jsonb] Scope bullets; renders as the case-study list. */
  scope_highlights?: string[];
  /** [G5-ruled, content_jsonb] Gallery image references (M0 storage `file_ref`; upload itself is
   *  gated by the open `ESC-7-API/upload`). Presentation holds refs only — never a fabricated src. */
  gallery_refs?: string[];
  /** FROZEN (interim, Doc-6D Pass3) — ordering within the portfolio. */
  display_order?: number;
  /** FROZEN (interim, Doc-6D Pass3) — service-visibility; `true` ⇒ public case study. */
  is_visible?: boolean;
}
