import Link from "next/link";
import { HostBadge } from "@/components/host-badge";
import type { PublicEvent } from "@/lib/events";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export function PublicEventCard({ event }: { event: PublicEvent }) {
  const date = new Date(event.startsAt);
  const eventHref = `/events/${encodeURIComponent(event.slug || event.id)}`;
  return <article className="public-event-card">
    <Link className="public-event-poster" href={eventHref} aria-label={`View ${event.title}`} data-color={event.organizer.badge.category} style={event.coverImageUrl ? { backgroundImage: `url(${JSON.stringify(event.coverImageUrl)})` } : undefined}>
      <span className="event-card-category">{event.category}</span>
      {!event.coverImageUrl && <strong>{event.title}</strong>}
      <span className="event-card-date"><b>{date.toLocaleDateString("en", { day: "2-digit" })}</b>{date.toLocaleDateString("en", { month: "short" }).toUpperCase()}</span>
    </Link>
    <div className="public-event-copy"><Link href={eventHref}><h3>{event.title}</h3></Link><p>{date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })} · {event.location}</p><div className="host-inline"><Link className="host-avatar" href={`/organizers/${event.organizer.id}`} aria-label={`View ${event.organizer.name}'s profile`}>{event.organizer.avatarUrl ? <span style={{ backgroundImage: `url(${JSON.stringify(event.organizer.avatarUrl)})` }} /> : initials(event.organizer.name)}</Link><div className="host-inline-copy"><Link className="host-name" href={`/organizers/${event.organizer.id}`}>{event.organizer.name}</Link><HostBadge {...event.organizer.badge} /></div></div></div>
  </article>;
}
