// `cn` — the kit's className composer (clsx + tailwind-merge). Presentation-only
// utility shared by every Doc-7B kit component; owns no state, no data. The merge
// step lets a surface override a kit class without specificity fights.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
