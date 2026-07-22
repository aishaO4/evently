import { TicketWallet } from "@/components/ticket-wallet";
import { WorkspaceShell } from "@/components/workspace-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function TicketsPage() { const user = await requireRole("attendee", "/tickets"); return <WorkspaceShell user={user} eyebrow="TICKET WALLET" title="Your tickets."><TicketWallet /></WorkspaceShell>; }
