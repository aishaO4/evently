"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type EventRow = { id: string; title: string; status: string; startsAt: string; location: string };
export function OrganizerDashboard() {
  const [events, setEvents] = useState<EventRow[]>([]); const [state, setState] = useState("loading");
  function load() { setState("loading"); fetch("/api/organizer/events").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setEvents(data.events); setState("ready"); }).catch(() => setState("error")); }
  useEffect(() => { fetch("/api/organizer/events").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setEvents(data.events); setState("ready"); }).catch(() => setState("error")); }, []);
  if (state === "loading") return <div className="workspace-loading event-list-skeleton" role="status" aria-label="Loading your events"><span /><span /><span /></div>;
  if (state === "error") return <div className="workspace-alert" role="alert"><b>Your events are out of reach.</b><span>Check your connection, then try again.</span><button className="button-link" type="button" onClick={load}>Try again</button></div>;
  if (!events.length) return <section className="workspace-empty"><b>Your first event starts here.</b><p>Create a draft and it will stay private to your account.</p><Link className="button-link primary" href="/create">Create event</Link></section>;
  return <section className="workspace-list" aria-label="Your events">{events.map((event) => <article key={event.id}><span className={`status-label ${event.status}`}>{event.status}</span><div><h2>{event.title}</h2><p><time dateTime={event.startsAt}>{new Date(event.startsAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</time> · {event.location}</p></div><div className="row-actions"><Link href={`/organizer/events/${event.id}`}>Manage<span className="sr-only"> {event.title}</span></Link><Link href={`/organizer/events/${event.id}/sales`}>Sales<span className="sr-only"> for {event.title}</span></Link></div></article>)}</section>;
}
