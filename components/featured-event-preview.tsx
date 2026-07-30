"use client";

import { useEffect, useMemo, useState } from "react";

type FeaturedEvent = {
  id: string;
  title: string;
  startsAt: string;
  location: string;
  attendeeCount: number;
};

const fallbackEvent: FeaturedEvent = {
  id: "fallback",
  title: "Rooftop Sunset Social",
  startsAt: "2026-09-26T19:00:00.000Z",
  location: "Downtown Dubai",
  attendeeCount: 36,
};

function formatEventDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Upcoming event";
  }
}

export function FeaturedEventPreview() {
  const [event, setEvent] = useState<FeaturedEvent | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/home/featured-event", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load featured event");
        if (data.event) setEvent(data.event);
      })
      .catch(() => {
        setEvent(null);
      })
      .finally(() => setLoaded(true));

    return () => controller.abort();
  }, []);

  const displayEvent = useMemo(() => event ?? fallbackEvent, [event]);
  const dateLabel = useMemo(() => formatEventDate(displayEvent.startsAt), [displayEvent.startsAt]);

  return (
    <div className="phone-scene" aria-hidden="true">
      <div className="phone">
        <div className="phone-bar">
          <span>9:41</span>
          <b>● ●●</b>
        </div>
        <div className="phone-event-art">
          <small>{loaded ? "FEATURED / LIVE" : "LOADING EVENT"}</small>
          <strong>{displayEvent.title}</strong>
          <i>☀</i>
        </div>
        <div className="phone-content">
          <strong>{displayEvent.title}</strong>
          <span>{dateLabel} · {displayEvent.location}</span>
          <div className="going-row">
            <span className="avatar avatar-d">A</span>
            <span className="avatar avatar-e">K</span>
            <span className="avatar avatar-f">R</span>
            <b>{displayEvent.attendeeCount} {displayEvent.attendeeCount === 1 ? "guest" : "guests"} going</b>
          </div>
          <div className="phone-buttons">
            <button type="button">Going ✓</button>
            <button type="button">Share ↗</button>
          </div>
          <div className="comment">
            <span className="avatar avatar-g">L</span>
            <p>
              <b>Live now</b> this event is pulling in real guests.
            </p>
          </div>
        </div>
      </div>
      <div className="reaction reaction-a">🔥 <b>12</b></div>
      <div className="reaction reaction-b">omw!!</div>
      <div className="reaction reaction-c">📸</div>
    </div>
  );
}
