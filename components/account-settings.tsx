"use client";

import { FormEvent, useState } from "react";

export function AccountSettings({ initialName, email, role }: { initialName: string; email: string; role: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(""); setError("");
    const name = String(new FormData(event.currentTarget).get("name") || "");
    try { const response = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setMessage("Account saved."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Account could not be saved."); }
    finally { setPending(false); }
  }
  return <form className="settings-card" onSubmit={submit} aria-busy={pending}><div className="settings-intro"><span className="mono">PROFILE DETAILS</span><h2>How you show up</h2><p>This name appears on your Ticklit account and organizer workspace.</p></div><div className="field"><label htmlFor="account-name">Display name</label><input id="account-name" name="name" defaultValue={initialName} autoComplete="name" required /></div><div className="field"><label htmlFor="account-email">Email</label><input id="account-email" value={email} disabled /><small>Contact support to change your sign-in email.</small></div><div className="field"><label htmlFor="account-role">Account type</label><input id="account-role" value={role === "organizer" ? "Organizer" : "Attendee"} disabled /><small>Your workspace and navigation are tailored to this role.</small></div>{error && <div className="form-alert" role="alert">{error}</div>}{message && <div className="form-alert success" role="status">{message}</div>}<button className="submit-button" disabled={pending}>{pending ? "Saving changes…" : "Save changes"}</button></form>;
}
