// SearchBar — presentational catalog search field for the discovery pages (Doc-7D · landing_page_spec
// §2). PRESENTATION-ONLY placeholder: the LIVE search EXPERIENCE (suggest, results, ⌘K) is owned by the
// landing Command Center and by M2.3 (Search Experience). Here the field is an inert visual entry that
// the wired `search_catalog` read binds later. A Server Component — no submission wiring, no results.
import { Search } from "lucide-react";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";
import { cn } from "@/frontend/lib/cn";

export interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Search products, suppliers, categories…",
  className,
}: SearchBarProps) {
  return (
    <div role="search" className={cn("flex items-center gap-2", className)}>
      <label htmlFor="discovery-search" className="sr-only">
        Search the marketplace
      </label>
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="discovery-search"
          type="search"
          autoComplete="off"
          placeholder={placeholder}
          className="h-11 pl-9 pr-3 text-base"
        />
      </div>
      <Button type="button" size="lg" aria-label="Search">
        <Search />
      </Button>
    </div>
  );
}
