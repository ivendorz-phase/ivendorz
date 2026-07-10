// CertificationGrid (M2.6) — certifications, licenses, and memberships the vendor declares. CRITICAL
// FIREWALL: these are SELF-DECLARED, supplier-provided company information ONLY — they are NEVER the
// platform "Verified" signal (that stays the binary M5 public projection), never imply platform
// verification, and carry NO verification workflow, status, or numbers (Doc-5G R10: verification detail
// is staff-internal). No frozen field; presentation reference only; genuine-empty when absent. Reuses
// the kit (Card); RSC-friendly.
import { Award } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import type { CertificationVM } from "./company-content-seed";

export interface CertificationGridProps {
  certifications?: CertificationVM[];
}

export function CertificationGrid({ certifications }: CertificationGridProps) {
  if (!certifications || certifications.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {certifications.map((cert) => (
          <li key={cert.name}>
            <Card className="h-full">
              <CardContent className="flex gap-2.5 pt-6">
                <Award aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-iv-navy-700" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{cert.name}</p>
                  {cert.detail ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{cert.detail}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {/* Firewall-safe disclosure: self-declared, not a platform verification claim. */}
      <p className="text-xs text-muted-foreground">
        Certifications and licenses are provided by the supplier.
      </p>
    </div>
  );
}
