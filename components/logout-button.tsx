"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) { const data = await response.json(); setError(data.error || "Could not sign out."); return; }
      router.push("/login"); router.refresh();
    } catch { setError("Could not reach Gatherly. Try again."); }
    finally { setPending(false); }
  }

  return <div><button className="logout-button" type="button" onClick={logout} disabled={pending}>{pending ? "Signing out..." : "Sign out"}</button>{error && <p role="alert" className="field-error">{error}</p>}</div>;
}
