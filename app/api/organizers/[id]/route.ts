import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { findPublicOrganizer, getHostBadge, toPublicEvent } from "@/lib/events";
import { apiError } from "@/lib/http";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return apiError("Enter a valid organizer ID.", 422);

  try {
    const db = await getDb();
    const organizerId = new ObjectId(id);
    const organizer = await findPublicOrganizer(db, organizerId);
    if (!organizer) return apiError("Organizer not found.", 404);
    const now = new Date();
    const [pastEventsCount, upcomingEventsCount, events] = await Promise.all([
      db.collection("events").countDocuments({ organizerId, status: { $in: ["published", "completed"] }, endsAt: { $lt: now } }),
      db.collection("events").countDocuments({ organizerId, status: "published", endsAt: { $gte: now } }),
      db.collection("events").find(
        { organizerId, status: "published", endsAt: { $gte: now } },
        { projection: { title: 1, slug: 1, category: 1, coverImageUrl: 1, startsAt: 1, endsAt: 1, location: 1, organizerId: 1 } },
      ).sort({ startsAt: 1 }).limit(6).toArray(),
    ]);
    return NextResponse.json({
      organizer: {
        id,
        name: String(organizer.name || "Gatherly host"),
        avatarUrl: typeof organizer.avatarUrl === "string" ? organizer.avatarUrl : null,
        memberSince: organizer.createdAt instanceof Date ? organizer.createdAt.toISOString() : null,
        badge: await getHostBadge(db, organizer),
        pastEventsCount,
        upcomingEventsCount,
        events: await Promise.all(events.map((event) => toPublicEvent(db, event, organizer))),
      },
    });
  } catch (error) {
    console.error("Public organizer could not be loaded", error);
    return apiError("This organizer is temporarily unavailable. Please try again.", 503);
  }
}
