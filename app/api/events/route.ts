import { ObjectId, MongoServerError } from "mongodb";
import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { findPublicOrganizer, toPublicEvent } from "@/lib/events";
import { apiError, isSameOrigin, validationError } from "@/lib/http";
import { eventSchema, parseJson } from "@/lib/validation";

export async function GET(request: Request) {
  const rawLimit = new URL(request.url).searchParams.get("limit") || "8";
  const limit = Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 24) return apiError("Limit must be between 1 and 24.", 422);

  try {
    const db = await getDb();
    const events = await db.collection("events").find(
      { status: "published", endsAt: { $gte: new Date() } },
      { projection: { title: 1, slug: 1, category: 1, coverImageUrl: 1, startsAt: 1, endsAt: 1, location: 1, organizerId: 1 } },
    ).sort({ startsAt: 1 }).limit(limit).toArray();
    const publicEvents = await Promise.all(events.map(async (event) => {
      const organizer = await findPublicOrganizer(db, event.organizerId);
      return organizer ? toPublicEvent(db, event, organizer) : null;
    }));
    return NextResponse.json({ events: publicEvents.filter(Boolean) });
  } catch (error) {
    console.error("Public events could not be loaded", error);
    return apiError("Events are temporarily unavailable. Please try again.", 503);
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return apiError("Request origin could not be verified.", 403);
  const auth = await authenticateApiRequest("organizer");
  if (auth.response) return auth.response;
  const result = eventSchema.safeParse(await parseJson(request));
  if (!result.success) return validationError(result.error);
  try {
    const db = await getDb();
    const now = new Date();
    const inserted = await db.collection("events").insertOne({ ...result.data, organizerId: new ObjectId(auth.user.id), createdAt: now, updatedAt: now });
    return NextResponse.json({ event: { id: inserted.insertedId.toString(), ...result.data } }, { status: 201 });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return apiError("That public event URL is already in use.", 409, { slug: "Choose another URL." });
    console.error("Event creation failed", error);
    return apiError("Your event could not be saved. Please try again.", 500);
  }
}
