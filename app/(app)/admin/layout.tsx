// Admin Console layout (Doc-7H · `P-ADM` surface) — mounts the CANONICAL Platform Shell with the Admin
// ViewModel. One shell, multiple workspaces (Buyer / Vendor / Admin); the surface contributes only a VM +
// content. Admin has NO active-org (Doc-7H); the VM identity is a neutral platform-staff placeholder until the
// Doc-7C context layer is wired. App Router composition only (REPOSITORY_STRUCTURE §8) — no business logic.
import type { ReactNode } from "react";
import { AppShell } from "../_components/shell";
import { ADMIN_SHELL_VM } from "../_components/admin/admin-shell-vm";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={ADMIN_SHELL_VM}>{children}</AppShell>;
}
