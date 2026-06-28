import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Vitest config — unit/contract/integration runner (Doc-8B D1: Vitest + single TS toolchain).
// E2E is Playwright (tests/e2e, excluded here). Hermetic: only out-of-wire boundaries are mocked
// (tests/_harness/mocks.ts); domain/data/contract paths are never mocked (Band I).
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirror the tsconfig `@/*` → `./src/*` path alias so the app-layer (`src/server`) — which imports
    // module contracts via `@/...` — is resolvable under Vitest. Pure test-infra parity; no architecture.
    alias: [
      { find: /^@\/(.*)$/, replacement: `${fileURLToPath(new URL("./src/", import.meta.url))}$1` },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    globalSetup: ["tests/_harness/global-setup.ts"],
    // Determinism: zero flaky tolerance (Doc-8B §6). Seeded clock + deterministic IDs land
    // with the modules that need them (Wave 2); no domain assertions at Wave 0.
    //
    // Single shared ephemeral test DB ⇒ NO cross-FILE parallelism (Doc-8B §3 "per-test isolated; no
    // inter-case state bleed"). The DB-backed integration files share ONE Postgres and several read the
    // active-org singleton over the app-bypassing superuser connection (whose `findFirst` is RLS-unscoped
    // — documented in the WP-1.5 route test); running them concurrently would let one file's committed
    // fixtures bleed into another's global-state assertion. Files run sequentially; tests within a file
    // still run in order. (Per-file workers each load the DB env via `tests/_harness/env`.)
    fileParallelism: false,
  },
});
