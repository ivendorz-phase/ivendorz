// Doc-7B app-component tier — kit compositions of primitives. Presentation-only; content by props.
//
// DEFERRED app components (demand-driven — build when a surface first needs one):
//   data-table (cursor-paginated; arrives with the `table` primitive) · form-field (renders
//   `field_errors`; arrives with the first write surface).

export * from "./empty-state";
export * from "./error-state";
export * from "./not-found";
export * from "./status-chip";
export * from "./currency-display";
export * from "./pagination-control";
export * from "./file-link";
