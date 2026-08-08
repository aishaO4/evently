"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HostBadge, type HostBadgeCategory, type HostBadgeVariant } from "@/components/host-badge";
import { PublicEventCard } from "@/components/public-event-card";
import type { PublicEvent } from "@/lib/events";

type Organizer = { id: string; name: string; avatarUrl: string | null; memberSince: string | null; badge: { variant: HostBadgeVariant; category: HostBadgeCategory }; pastEventsCount: number; upcomingEventsCount: number; events: PublicEvent[] };

export function OrganizerProfile({ id }: { id: string }) {
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/organizers/${encodeURIComponent(id)}`, { signal: controller.signal }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setOrganizer(data.organizer); }).catch((reason) => { if (reason.name !== "AbortError") setError(reason.message || "Organizer unavailable."); });
    return () => controller.abort();
  }, [id]);

  if (error) return <main className="page-message"><Link className="brand" href="/"><span className="brand-mark">+</span> ticklit</Link><div><span className="step-label">PROFILE</span><h1>Host not found.</h1><p>{error}</p><Link className="button-link primary" href="/">Browse events</Link></div></main>;
  if (!organizer) return <div className="detail-loading" aria-label="Loading organizer"><span /><span /><span /></div>;
  return <main className="profile-page"><header className="public-header"><Link className="brand" href="/"><span className="brand-mark">+</span> ticklit</Link><Link className="button-link" href="/signup">Host an event</Link></header><section className="profile-hero"><div className="profile-avatar" data-color={organizer.badge.category}>{organizer.avatarUrl ? <span style={{ backgroundImage: `url(${JSON.stringify(organizer.avatarUrl)})` }} /> : organizer.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("")}</div><div className="profile-identity"><span className="mono">TICKLIT ORGANIZER</span><div className="profile-name-line"><h1>{organizer.name}</h1><HostBadge {...organizer.badge} /></div><p>Making rooms worth showing up for{organizer.memberSince ? ` since ${new Date(organizer.memberSince).getFullYear()}` : ""}.</p></div><div className="profile-stats"><span><b>{organizer.pastEventsCount}</b>past events</span><span><b>{organizer.upcomingEventsCount}</b>coming up</span></div></section><section className="profile-events"><div className="section-heading"><span className="step-label">ON THE CALENDAR</span><h2>What&apos;s next.</h2></div>{organizer.events.length ? <div className="public-event-grid">{organizer.events.map((event) => <PublicEventCard event={event} key={event.id} />)}</div> : <div className="public-message"><b>Nothing announced yet.</b><span>Follow this host for the next drop.</span></div>}</section></main>;
}
