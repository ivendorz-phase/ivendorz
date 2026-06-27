import type { NextConfig } from "next";

/**
 * iVendorz — Next.js configuration (Wave 0 bootstrap).
 * Single deployable; the modular monolith is internal (REPOSITORY_STRUCTURE §1/§2).
 * No business logic here — routing/composition only.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
};

export default nextConfig;
