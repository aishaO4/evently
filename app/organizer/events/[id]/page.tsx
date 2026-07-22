import { EventManager } from "@/components/event-manager";
import { WorkspaceShell } from "@/components/workspace-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const user = await requireRole("organizer", `/organizer/events/${id}`); return <WorkspaceShell user={user} eyebrow="MANAGE EVENT" title="Event controls."><EventManager id={id} /></WorkspaceShell>; }
