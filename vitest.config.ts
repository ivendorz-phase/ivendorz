import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/**
 * iVendorz — Vitest configuration (Wave 0 bootstrap).
 * Unit + through-contracts conformance harness (Doc-8B). E2E lives in Playwright.
 * Per-module unit tests live inside the module; cross-module/integration in /tests.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
