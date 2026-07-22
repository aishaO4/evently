import { AccountSettings } from "@/components/account-settings";
import { WorkspaceShell } from "@/components/workspace-shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function AccountPage() { const user = await requireUser("/account"); return <WorkspaceShell user={user} eyebrow="ACCOUNT" title="Account settings."><AccountSettings initialName={user.name} email={user.email} role={user.role} /></WorkspaceShell>; }
