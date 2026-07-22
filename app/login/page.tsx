import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Sign in" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) { const params = await searchParams; return <AuthShell alternateHref="/signup" alternateLabel="New here? Create an account" artMode="return"><AuthForm mode="login" returnTo={params.returnTo} /></AuthShell>; }
