import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Create your account" };
export default function SignupPage() { return <AuthShell alternateHref="/login" alternateLabel="Already a member? Sign in"><AuthForm mode="signup" /></AuthShell>; }
