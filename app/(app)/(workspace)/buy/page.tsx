// `/buy` entry → the Dashboard (Doc-7F §9.1 default landing). Composition-only (mirrors `/sell`).
import { redirect } from "next/navigation";

export default function BuyerWorkspaceIndexPage() {
  redirect("/buy/dashboard");
}
