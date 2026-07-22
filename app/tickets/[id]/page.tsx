import { TicketDetail } from "@/components/ticket-detail";
import { WorkspaceShell } from "@/components/workspace-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const user = await requireRole("attendee", `/tickets/${id}`); return <WorkspaceShell user={user} eyebrow="DIGITAL TICKET" title="Entry pass."><TicketDetail id={id} /></WorkspaceShell>; }
