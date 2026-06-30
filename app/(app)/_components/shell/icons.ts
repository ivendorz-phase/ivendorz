import {
  Boxes,
  ClipboardList,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  Store,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

// Nav icon registry — maps a SERIALIZABLE string key to a Lucide component.
//
// WHY KEYS, NOT COMPONENTS: nav data crosses the RSC server→client boundary (the server shell passes
// `nav` to the client Sidebar / MobileNav / QuickCreate). React cannot serialize a component across
// that boundary, so NavItem / QuickCreateItem carry an icon KEY (a plain string) and the CLIENT nav
// components resolve it here, in client scope. A workspace adds its icons by extending this map.
export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  rfqs: ClipboardList,
  quotations: FileText,
  vendors: Users,
  orders: Package,
  microsite: Store,
  products: Boxes,
  leads: Inbox,
  advertising: Megaphone,
  settings: Settings,
  billing: CreditCard,
  team: UserPlus,
} as const satisfies Record<string, LucideIcon>;

export type NavIconKey = keyof typeof NAV_ICONS;
