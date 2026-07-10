"use client";

// Role editor — P-ACC-09 (Doc-7E · T-SETTINGS). Client Component holding only ephemeral form state
// (Doc-7C §2.3). PRESENTATION-ONLY: creating, saving and deleting all show honest interims and change
// nothing — the server owns roles and their composition.
//
// FIELD DISCIPLINE (invent nothing):
//  • Create → frozen `identity.create_role.v1` (`name` unique-per-org + optional `permission_slugs`);
//    rename → `identity.update_role.v1` (`name`, optimistic `updated_at`); permission composition →
//    `identity.set_role_permissions.v1` (`add_slugs`/`remove_slugs`); delete → `identity.delete_role.v1`
//    (Doc-4C §C7). Role administration uses the interim slug `[ESC-IDN-SLUG]` (no dedicated
//    can_manage_roles in Doc-2 §7 — carried, not invented).
//  • Permissions are chosen by their FROZEN SLUG (Invariant #10 — never a name-string decision); each row
//    shows the human `description` and the slug itself as the reference.
//  • SYSTEM BUNDLES are read-only here: not renamable (`identity_role_system_protected`), not deletable,
//    composition policy-restricted — so the editor presents them view-only.
//  • Deleting a role in use is blocked server-side (`identity_role_in_use`); the confirm says so.
//  • A stale save surfaces `CONFLICT` (optimistic `updated_at`).
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Info, Lock } from "lucide-react";
import { FormField } from "@/frontend/components/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Badge } from "@/frontend/primitives/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";
import { PERMISSION_CATALOG, type RoleSeed } from "./role-seed";

type Props = { mode: "create" } | { mode: "edit"; role: RoleSeed };

function sameSet(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

export function RoleEditor(props: Props) {
  const router = useRouter();
  const isCreate = props.mode === "create";
  const role = props.mode === "edit" ? props.role : null;
  const readOnly = role?.isSystemBundle === true;

  const initialName = role?.name ?? "";
  const initialSlugs = useMemo(() => new Set(role?.permissionSlugs ?? []), [role]);

  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [slugs, setSlugs] = useState<Set<string>>(() => new Set(initialSlugs));
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const dirty = !readOnly && (name !== initialName || !sameSet(slugs, initialSlugs));

  function toggle(slug: string) {
    setSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setSaved(false);
  }

  function onSave() {
    if (name.trim().length === 0) {
      setNameError("Enter a role name.");
      return;
    }
    setNameError(undefined);
    // Presentation-only: nothing is written (the server owns roles) — honest interim.
    setSaved(true);
  }

  function onReset() {
    setName(initialName);
    setSlugs(new Set(initialSlugs));
    setNameError(undefined);
    setSaved(false);
  }

  function onDelete() {
    // Presentation-only: nothing happens — honest interim.
    setDeleted(true);
    setDeleteOpen(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {saved ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Role changes aren’t wired in this preview — nothing was saved.</p>
        </div>
      ) : null}
      {deleted ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Deleting this role isn’t wired in this preview — nothing happened.</p>
        </div>
      ) : null}

      {readOnly ? (
        <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            This is a built-in system role. Its name and permissions are managed by iVendorz and
            can’t be edited. Create a custom role to tailor access.
          </p>
        </div>
      ) : null}

      {/* Role name. */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Role details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            id="role-name"
            label="Role name"
            required
            description="Shown when assigning members to this role."
            error={nameError}
          >
            <Input
              name="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              placeholder="e.g. Procurement Lead"
              disabled={readOnly}
              readOnly={readOnly}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Permission grid — chosen by frozen slug (Inv #10). */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <fieldset disabled={readOnly}>
            <legend className="sr-only">Permissions for this role</legend>
            <ul className="divide-y divide-border">
              {PERMISSION_CATALOG.map((p) => {
                const id = `perm-${p.slug}`;
                return (
                  <li key={p.slug} className="flex items-start gap-3 py-3">
                    <input
                      type="checkbox"
                      id={id}
                      checked={slugs.has(p.slug)}
                      onChange={() => toggle(p.slug)}
                      disabled={readOnly}
                      className="mt-0.5 size-4 shrink-0 accent-iv-brand-500"
                    />
                    <label htmlFor={id} className="min-w-0 cursor-pointer">
                      <span className="block text-sm font-medium text-foreground">
                        {p.description}
                      </span>
                      <span className="block font-mono text-xs text-muted-foreground">
                        {p.slug}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </CardContent>
      </Card>

      {/* Danger zone — delete (edit + custom only; system bundles are not deletable). */}
      {!isCreate && !readOnly ? (
        <Card className="bg-iv-danger-subtle">
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2 text-base text-iv-danger-muted">
              <AlertTriangle aria-hidden="true" className="size-4" />
              Danger zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Delete role</p>
                <p className="text-sm text-muted-foreground">
                  You can’t delete a role while members are still assigned to it.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                className="sm:shrink-0"
                onClick={() => setDeleteOpen(true)}
              >
                Delete role
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Save bar. Create always shows a save; edit shows it when dirty. */}
      {!readOnly && (isCreate || dirty) ? (
        <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted-foreground">
            {isCreate
              ? "Set a name and permissions, then create the role."
              : "You have unsaved changes."}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={isCreate ? () => router.push("/account/roles") : onReset}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onSave}>
              {isCreate ? "Create role" : "Save changes"}
            </Button>
          </div>
        </div>
      ) : null}

      {/* System bundle: no save bar — offer a way back. */}
      {readOnly ? (
        <div>
          <Button type="button" variant="outline" onClick={() => router.push("/account/roles")}>
            Back to roles
          </Button>
        </div>
      ) : null}

      {/* Delete-role confirm. */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this role?</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-foreground">{role?.name}</span> will be removed.
              Members must be reassigned to another role first. This can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={onDelete}>
              Delete role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* System-role badge context for screen readers is conveyed by the note above. */}
      {readOnly ? <Badge className="sr-only">System role</Badge> : null}
    </div>
  );
}
