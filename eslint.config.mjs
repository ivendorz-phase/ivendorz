import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * iVendorz — ESLint flat config (Wave 0 bootstrap).
 * Base: Next.js core-web-vitals + TypeScript.
 * Plus: module-boundary enforcement (REPOSITORY_STRUCTURE §3/§9/§10) —
 *   only `<other-module>/contracts` is importable across modules; reaching into
 *   another module's domain/application/infrastructure/api fails the build.
 */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      "generated-contracts-registry/**",
      "src/generated/**",
      "prisma/generated/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*", "app/**/*"],
      "boundaries/elements": [
        {
          type: "module-contracts",
          pattern: "src/modules/*/contracts",
          mode: "folder",
          capture: ["module"],
        },
        {
          type: "module-internal",
          pattern: "src/modules/*/(domain|application|infrastructure|api)",
          mode: "folder",
          capture: ["module", "layer"],
        },
        { type: "shared", pattern: "src/shared", mode: "folder" },
        { type: "server", pattern: "src/server", mode: "folder" },
        { type: "app", pattern: "app", mode: "folder" },
      ],
    },
    rules: {
      // A module's internal layers may import: their OWN module (any layer),
      // any module's `contracts`, shared, and server. Importing ANOTHER module's
      // internal layers is forbidden (cross-module surface = contracts only).
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: ["module-internal"],
              disallow: [["module-internal", { module: "!${from.module}" }]],
              message:
                "Cross-module import must target the other module's `contracts/` only — never its domain/application/infrastructure/api (REPOSITORY_STRUCTURE §3/§9).",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
