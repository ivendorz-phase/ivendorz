import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/shared/ui/lib/cn";
import { Logo } from "@/shared/ui/layout/logo";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  columns?: FooterColumn[];
  /** Short description shown under the brand. */
  description?: string;
  /** Bottom-bar content, e.g. social links. Defaults to nothing. */
  bottom?: ReactNode;
  className?: string;
}

export function Footer({ columns = [], description, bottom, className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-border bg-card", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-4">
            <Logo />
            {description ? (
              <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-foreground">{column.title}</p>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {`\u00A9 ${year} iVendorz. All rights reserved.`}
          </p>
          {bottom ? <div className="flex items-center gap-4">{bottom}</div> : null}
        </div>
      </div>
    </footer>
  );
}
