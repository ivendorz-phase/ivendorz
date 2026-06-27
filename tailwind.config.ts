import type { Config } from "tailwindcss";

/**
 * iVendorz — Tailwind configuration (Wave 0 bootstrap).
 * Design tokens (colors/typography/spacing) are owned by the Doc-7B Design System
 * and are realized in a later wave; this is the minimal bootstrap surface.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
