"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

type Mode = "signup" | "login" | "forgot" | "reset";

const content = {
  signup: { label: "CREATE YOUR ACCOUNT", title: "Your plans, one place.", intro: "Host the room or join the guest list. Choose the account that fits today.", submit: "Create my account", pending: "Creating account..." },
  login: { label: "WELCOME BACK", title: "Pick up the momentum.", intro: "Sign in to manage drafts, ticket sales and the people showing up.", submit: "Sign in", pending: "Signing in..." },
  forgot: { label: "PASSWORD RESET", title: "Find your way back.", intro: "Enter your account email. If it matches, we will send a secure reset link.", submit: "Send reset link", pending: "Sending link..." },
  reset: { label: "NEW PASSWORD", title: "Make it a strong one.", intro: "Choose a new password. Signing in again will be required on your other devices.", submit: "Update password", pending: "Updating password..." },
};

export function AuthForm({ mode, token = "", returnTo = "" }: { mode: Mode; token?: string; returnTo?: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const meta = content[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError(""); setSuccess(""); setFields({});
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const body: Record<string, unknown> = { ...values };
    if (mode === "login") body.remember = values.remember === "on";
    if (mode === "reset") body.token = token;
    const endpoint = mode === "forgot" ? "forgot-password" : mode === "reset" ? "reset-password" : mode;
    try {
      const response = await fetch(`/api/auth/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setFields(data.fields || {});
        window.setTimeout(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
        return;
      }
      if (mode === "forgot") setSuccess(data.message);
      else if (mode === "reset") { setSuccess(data.message); setTimeout(() => router.push("/login?reset=success"), 900); }
      else {
        const roleHome = data.user?.role === "attendee" ? "/tickets" : "/organizer/dashboard";
        router.push(returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : roleHome);
      }
    } catch {
      setError("We could not reach Ticklit. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return <div className="auth-content">
    <span className="step-label">{meta.label}</span>
    <h1>{meta.title}</h1>
    <p>{meta.intro}</p>
    <form ref={formRef} className="auth-form" onSubmit={submit} noValidate aria-busy={pending}>
      {mode === "signup" && <Field label="Your name" name="name" autoComplete="name" placeholder="Aisha Rahman" error={fields.name} />}
      {mode === "signup" && <fieldset className="role-choice"><legend>Choose your starting workspace</legend><label><input type="radio" name="role" value="organizer" defaultChecked /><span className="role-icon" aria-hidden="true">↗</span><span><b>Host events</b><small>Publish events, manage guests and follow sales.</small></span></label><label><input type="radio" name="role" value="attendee" /><span className="role-icon" aria-hidden="true">★</span><span><b>Attend events</b><small>Discover events and keep every ticket close.</small></span></label><p className="role-note">You’ll land in the workspace you choose. Your account type is shown in navigation.</p></fieldset>}
      {mode !== "reset" && <Field label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={fields.email} />}
      {(mode === "signup" || mode === "login" || mode === "reset") && <div className="field">
        <div className="field-head"><label htmlFor="password">Password</label>{mode === "login" && <Link href="/forgot-password">Forgot password?</Link>}</div>
        <div className="input-wrap"><input className="password-input" id="password" name="password" type={visible ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} aria-invalid={Boolean(fields.password)} aria-describedby={[fields.password && "password-error", mode !== "login" && "password-note"].filter(Boolean).join(" ") || undefined} required /><button className="reveal" type="button" onClick={() => setVisible((value) => !value)} aria-label={`${visible ? "Hide" : "Show"} password`} aria-pressed={visible}>{visible ? "HIDE" : "SHOW"}</button></div>
        <p className="field-error" id="password-error">{fields.password}</p>
        {mode !== "login" && <p className="password-note" id="password-note">10+ characters with uppercase, lowercase and a number.</p>}
      </div>}
      {mode === "login" && <label className="check-label"><input type="checkbox" name="remember" />Keep me signed in for 30 days</label>}
      {error && <div className="form-alert" role="alert">{error}</div>}
      {success && <div className="form-alert success" role="status">{success}</div>}
      {mode === "reset" && !token && <div className="form-alert" role="alert">This reset link is missing or invalid. Request a new password reset link.</div>}
      <button className="submit-button" type="submit" disabled={pending || (mode === "reset" && !token)}>{pending ? meta.pending : meta.submit}</button>
      {mode === "signup" && <p className="form-foot">Already have an account? <Link href="/login">Sign in</Link></p>}
      {mode === "login" && <p className="form-foot">New to Ticklit? <Link href="/signup">Create an account</Link></p>}
      {(mode === "forgot" || mode === "reset") && <p className="form-foot"><Link href="/login">Back to sign in</Link></p>}
    </form>
  </div>;
}

function Field({ label, name, type = "text", autoComplete, placeholder, error }: { label: string; name: string; type?: string; autoComplete?: string; placeholder?: string; error?: string }) {
  const errorId = `${name}-error`;
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} autoComplete={autoComplete} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} required /><p className="field-error" id={errorId}>{error}</p></div>;
}
