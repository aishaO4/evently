import Link from "next/link";

export function AuthShell({ children, alternateHref, alternateLabel, artMode = "join" }: { children: React.ReactNode; alternateHref: string; alternateLabel: string; artMode?: "join" | "return" | "reset" }) {
  const copy = artMode === "return" ? { kicker: "YOUR PEOPLE ARE HERE", line1: "BACK", line2: "STAGE", note: "Plans move fast. Your dashboard keeps up." } : artMode === "reset" ? { kicker: "NO DEAD ENDS", line1: "FRESH", line2: "START", note: "One secure link. Then you are back in." } : { kicker: "HOST SOMETHING REAL", line1: "MAKE", line2: "NOISE", note: "Tickets, guests and payouts. One confident flow." };
  return <main className="auth-page">
    <section className="auth-panel">
      <header className="auth-top">
        <Link className="brand" href="/"><span className="brand-mark">+</span> ticklit</Link>
        <Link className="auth-top-link" href={alternateHref}>{alternateLabel}</Link>
      </header>
      {children}
      <footer className="auth-legal">By continuing, you agree to Ticklit&apos;s terms and acknowledge the privacy policy.</footer>
    </section>
    <aside className="auth-art" aria-label="Ticklit event poster artwork">
      <span className="art-star" aria-hidden="true">*</span>
      <div className="poster-stack" aria-hidden="true">
        <div className="poster back-one" />
        <div className="poster back-two" />
        <div className="poster main"><span className="poster-kicker">{copy.kicker}</span><span className="poster-orbit" /><h2>{copy.line1}<br /><em>{copy.line2}</em></h2><div className="poster-meta"><span>DUBAI / 2026</span><span>SHOW UP</span></div></div>
      </div>
      <p className="art-note">{copy.note}</p>
    </aside>
  </main>;
}
