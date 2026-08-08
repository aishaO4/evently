"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HostBadge } from "@/components/host-badge";
import type { PublicEvent } from "@/lib/events";

export function EventDetail({ id }: { id: string }) {
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/events/${encodeURIComponent(id)}`, { signal: controller.signal }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setEvent(data.event); }).catch((reason) => { if (reason.name !== "AbortError") setError(reason.message || "Event unavailable."); });
    return () => controller.abort();
  }, [id]);

  if (error) return <PageMessage title="We missed that event." text={error} />;
  if (!event) return <div className="detail-loading" aria-label="Loading event"><span /><span /><span /></div>;
  const date = new Date(event.startsAt);
  return <main className="event-detail-page"><header className="public-header"><Link className="brand" href="/"><span className="brand-mark">+</span> ticklit</Link><Link className="button-link" href="/signup">Host an event</Link></header><section className="event-detail-hero"><div className="event-detail-copy"><span className="step-label">{event.category}</span><h1>{event.title}</h1><dl><div><dt>WHEN</dt><dd>{date.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}<br />{date.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}</dd></div><div><dt>WHERE</dt><dd>{event.location}</dd></div></dl><Link className="ticket-button" href="/login">Get tickets <span>→</span></Link></div><div className="event-detail-art" data-color={event.organizer.badge.category} style={event.coverImageUrl ? { backgroundImage: `url(${JSON.stringify(event.coverImageUrl)})` } : undefined}>{!event.coverImageUrl && <><span>LIVE / {date.getFullYear()}</span><strong>{event.title}</strong><i aria-hidden="true">*</i></>}</div></section><section className="event-host-section"><span className="host-avatar host-avatar-large" aria-hidden="true">{event.organizer.avatarUrl ? <span style={{ backgroundImage: `url(${JSON.stringify(event.organizer.avatarUrl)})` }} /> : event.organizer.name.slice(0, 2).toUpperCase()}</span><div><span className="mono">HOSTED BY</span><div className="profile-name-line"><Link href={`/organizers/${event.organizer.id}`}>{event.organizer.name}</Link><HostBadge {...event.organizer.badge} /></div></div><Link className="text-arrow" href={`/organizers/${event.organizer.id}`}>View profile →</Link></section></main>;
}

function PageMessage({ title, text }: { title: string; text: string }) { return <main className="page-message"><Link className="brand" href="/"><span className="brand-mark">+</span> ticklit</Link><div><span className="step-label">NOT FOUND</span><h1>{title}</h1><p>{text}</p><Link className="button-link primary" href="/">Browse events</Link></div></main>; }
