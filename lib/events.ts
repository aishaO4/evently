import type { Db, ObjectId } from "mongodb";
import type { HostBadgeCategory, HostBadgeVariant } from "@/components/host-badge";

export type HostBadgeData = { variant: HostBadgeVariant; category: HostBadgeCategory };
export type PublicHost = { id: string; name: string; avatarUrl: string | null; badge: HostBadgeData };
export type PublicEvent = {
  id: string;
  title: string;
  slug: string;
  category: string;
  coverImageUrl: string | null;
  startsAt: string;
  endsAt: string;
  location: string;
  organizer: PublicHost;
};

const categories: HostBadgeCategory[] = ["blue", "yellow", "lime", "purple"];
const categoryMap: Record<string, HostBadgeCategory> = {
  music: "blue",
  business: "blue",
  community: "yellow",
  celebration: "yellow",
  wellness: "lime",
  creative: "purple",
  "food & drink": "purple",
};

function paletteFor(category?: string, seed = "") {
  const mapped = categoryMap[(category || "").toLowerCase()];
  if (mapped) return mapped;
  const hash = [...seed].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return categories[hash % categories.length];
}

export async function getHostBadge(db: Db, user: Record<string, unknown>, category?: string): Promise<HostBadgeData> {
  const verified = Boolean(user.payoutVerifiedAt && user.idVerifiedAt);
  if (verified) return { variant: "verified", category: paletteFor(category, String(user._id)) };
  const pastEvents = await db.collection("events").countDocuments({
    organizerId: user._id,
    status: { $in: ["published", "completed"] },
    endsAt: { $lt: new Date() },
  }, { limit: 2 });
  return { variant: pastEvents >= 2 ? "repeat" : "new", category: paletteFor(category, String(user._id)) };
}

export async function toPublicHost(db: Db, user: Record<string, unknown>, category?: string): Promise<PublicHost> {
  return {
    id: String(user._id),
    name: String(user.name || "Gatherly host"),
    avatarUrl: typeof user.avatarUrl === "string" ? user.avatarUrl : null,
    badge: await getHostBadge(db, user, category),
  };
}

export async function toPublicEvent(db: Db, event: Record<string, unknown>, user: Record<string, unknown>): Promise<PublicEvent> {
  return {
    id: String(event._id),
    title: String(event.title),
    slug: String(event.slug),
    category: String(event.category || "Community"),
    coverImageUrl: typeof event.coverImageUrl === "string" ? event.coverImageUrl : null,
    startsAt: (event.startsAt as Date).toISOString(),
    endsAt: (event.endsAt as Date).toISOString(),
    location: String(event.location || "Location to be announced"),
    organizer: await toPublicHost(db, user, String(event.category || "")),
  };
}

export async function findPublicOrganizer(db: Db, organizerId: ObjectId) {
  return db.collection("users").findOne(
    { _id: organizerId },
    { projection: { name: 1, avatarUrl: 1, payoutVerifiedAt: 1, idVerifiedAt: 1, createdAt: 1 } },
  );
}
