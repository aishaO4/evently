import { SalesDashboard } from "@/components/sales-dashboard";
import { WorkspaceShell } from "@/components/workspace-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function EventSalesPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const user = await requireRole("organizer", `/organizer/events/${id}/sales`); return <WorkspaceShell user={user} eyebrow="EVENT PERFORMANCE" title="Ticket sales."><SalesDashboard id={id} /></WorkspaceShell>; }
