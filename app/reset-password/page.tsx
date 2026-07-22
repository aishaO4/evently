import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Choose a new password" };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token = "" } = await searchParams; return <AuthShell alternateHref="/login" alternateLabel="Back to sign in" artMode="reset"><AuthForm mode="reset" token={token} /></AuthShell>; }
