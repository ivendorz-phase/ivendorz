import type { ReactNode } from "react";
import { cn } from "@/shared/ui/lib/cn";

export interface NavbarProps {
  /** Leading slot, e.g. a mobile menu trigger or page title. */
  leading?: ReactNode;
  /** Centered slot, typically a search field. */
  center?: ReactNode;
  /** Trailing slot for actions: notifications, user menu, etc. */
  actions?: ReactNode;
  className?: string;
}

export function Navbar({ leading, center, actions, className }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6",
        className,
      )}
    >
      {leading ? <div className="flex items-center gap-2">{leading}</div> : null}
      {center ? (
        <div className="hidden flex-1 justify-center md:flex">{center}</div>
      ) : (
        <div className="flex-1" />
      )}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
