// Neutral "section being built" placeholder for vendor workspace nav targets whose screen content
// is scheduled for a later milestone. Keeps the whole IA navigable now (shell + nav + states are in
// place) without asserting any unbuilt UI or data. Presentation-only; RSC-friendly.
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";

export interface WorkspaceSectionPlaceholderProps {
  title: string;
  description?: string;
}

export function WorkspaceSectionPlaceholder({
  title,
  description,
}: WorkspaceSectionPlaceholderProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coming soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This section’s presentation is being implemented. The workspace shell, navigation, and
            loading / empty / error states are in place; the screen content arrives in a later
            milestone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
