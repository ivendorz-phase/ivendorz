// Vendor Workspace — Messages route (VX-03). Thin composition-only page (App Router). The split-pane
// shell + governance disclosure live in the view component.
import type { Metadata } from "next";
import { MessagesView } from "../../../_components/vendor/messages/messages-view";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return <MessagesView />;
}
