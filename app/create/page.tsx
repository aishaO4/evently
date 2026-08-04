import { WorkspaceShell } from "@/components/workspace-shell";
import { EventCreationWizard } from "@/components/event-creation-wizard";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const user = await requireRole("organizer", "/create");
  return (
    <WorkspaceShell user={user} eyebrow="CREATE EVENT" title="Make the next room happen.">
      <EventCreationWizard />
    </WorkspaceShell>
  );
}
