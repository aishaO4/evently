"use client";

import { useEffect, useState } from "react";
import { PublicEventCard } from "@/components/public-event-card";
import type { PublicEvent } from "@/lib/events";

export function PublicEventGrid() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/events?limit=8", { signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setEvents(data.events); setState("ready");
    }).catch((error) => { if (error.name !== "AbortError") setState("error"); });
    return () => controller.abort();
  }, []);

  if (state === "loading") return <div className="event-loading" role="status" aria-label="Loading events">{[1, 2, 3].map((item) => <span key={item} aria-hidden="true" />)}</div>;
  if (state === "error") return <div className="public-message" role="alert"><b>Events took the night off.</b><span>Refresh the page to try again.</span></div>;
  if (!events.length) return <div className="public-message"><b>The first listing is almost here.</b><span>Published events will appear in this space.</span></div>;
  return <div className="public-event-grid">{events.map((event) => <PublicEventCard event={event} key={event.id} />)}</div>;
}
