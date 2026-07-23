// Comparison Workspace — barrel. The fresh presentation architecture for the un-gated FE slice
// (per the approved plan): a shared route-group provider + gating initializer + region components.
export {
  ComparisonWorkspaceStateProvider,
  useComparisonWorkspace,
} from "./comparison-workspace-state";
export {
  ComparisonWorkspaceView,
  ComparisonNotFound,
  ComparisonAwaiting,
} from "./comparison-workspace-view";
export { ComparisonWorkspaceInitializer } from "./comparison-workspace-initializer";
export {
  buildWorkspaceData,
  toInitializeInput,
  type ComparisonWorkspaceData,
} from "./workspace-view-models";
export { normalizeSelection, defaultSelection, parseSelParam } from "./selection";
