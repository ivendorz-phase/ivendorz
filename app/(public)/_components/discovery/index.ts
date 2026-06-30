// Public marketplace-discovery components (Team 1, Public M2 — presentation-only). Reusable across the
// landing sections (SEC-CATEGORY/SUPPLIERS/PRODUCTS) and the M2.2 discovery routes (/marketplace,
// /vendors, /categories). Compose the FROZEN Doc-7B kit only; bind no Doc-5 contract (typed VMs).
export { VendorCard, type VendorCardProps } from "./vendor-card";
export { ProductCard, type ProductCardProps } from "./product-card";
export { CategoryTile, type CategoryTileProps } from "./category-tile";
export {
  vendorInitials,
  type VendorCardVM,
  type ProductCardVM,
  type CategoryVM,
  type PriceVM,
} from "./view-models";
