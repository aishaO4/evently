import Link from "next/link";
import { WorkspaceShell } from "@/components/workspace-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const user = await requireRole("organizer", "/create");
  return <WorkspaceShell user={user} eyebrow="CREATE EVENT" title="Make the next room happen."><section className="workspace-empty"><b>Event creation is account-protected.</b><p>Your existing creation wizard will save drafts under {user.email} through the owner-scoped event API.</p><Link className="button-link primary" href="/organizer/dashboard">View my events</Link></section></WorkspaceShell>;
}
