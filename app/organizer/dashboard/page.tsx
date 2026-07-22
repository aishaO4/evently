import { OrganizerDashboard } from "@/components/organizer-dashboard";
import { WorkspaceShell } from "@/components/workspace-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function OrganizerDashboardPage() { const user = await requireRole("organizer", "/organizer/dashboard"); return <WorkspaceShell user={user} eyebrow="ORGANIZER WORKSPACE" title="Your events."><OrganizerDashboard /></WorkspaceShell>; }
