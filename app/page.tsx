import Link from "next/link";
import { PublicEventGrid } from "@/components/public-event-grid";

export default function HomePage() {
  return <main className="home"><nav><Link className="brand" href="/"><span className="brand-mark">+</span> gatherly</Link><div className="home-actions"><Link className="button-link" href="/login">Sign in</Link><Link className="button-link primary" href="/signup">Start hosting</Link></div></nav><section className="home-main"><span className="step-label">EVENTS THAT FEEL ALIVE</span><h1>SHOW<br />UP.</h1><p>Build the page, sell the tickets, know the room. Gatherly gives organizers one confident place to make it happen.</p><div><Link className="button-link primary" href="/signup">Create your first event</Link></div></section><section className="home-events"><div className="section-heading"><span className="step-label">HAPPENING SOON</span><h2>Worth leaving<br />home for.</h2></div><PublicEventGrid /></section></main>;
}
