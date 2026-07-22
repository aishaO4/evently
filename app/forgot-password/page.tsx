import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Reset your password" };
export default function ForgotPasswordPage() { return <AuthShell alternateHref="/login" alternateLabel="Remembered it? Sign in" artMode="reset"><AuthForm mode="forgot" /></AuthShell>; }
