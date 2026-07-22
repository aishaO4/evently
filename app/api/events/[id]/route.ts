import { MongoServerError, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { findPublicOrganizer, toPublicEvent } from "@/lib/events";
import { apiError, isSameOrigin, validationError } from "@/lib/http";
import { eventPatchSchema, eventSchema, parseJson } from "@/lib/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || id.length > 100) return apiError("Enter a valid event ID.", 422);

  try {
    const db = await getDb();
    const identifier = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id };
    const event = await db.collection("events").findOne(
      { ...identifier, status: "published" },
      { projection: { title: 1, slug: 1, category: 1, coverImageUrl: 1, startsAt: 1, endsAt: 1, location: 1, organizerId: 1 } },
    );
    if (!event) return apiError("Event not found.", 404);
    const organizer = await findPublicOrganizer(db, event.organizerId);
    if (!organizer) return apiError("Event host not found.", 404);
    return NextResponse.json({ event: await toPublicEvent(db, event, organizer) });
  } catch (error) {
    console.error("Public event could not be loaded", error);
    return apiError("This event is temporarily unavailable. Please try again.", 503);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return apiError("Request origin could not be verified.", 403);
  const auth = await authenticateApiRequest("organizer");
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!ObjectId.isValid(id)) return apiError("Enter a valid event ID.", 422);
  const result = eventPatchSchema.safeParse(await parseJson(request));
  if (!result.success) return validationError(result.error);
  try {
    const db = await getDb();
    const ownerQuery = { _id: new ObjectId(id), organizerId: new ObjectId(auth.user.id), status: { $ne: "archived" } };
    const existing = await db.collection("events").findOne(ownerQuery);
    if (!existing) return apiError("Event not found or you do not have access.", 404);
    const complete = eventSchema.safeParse({ ...existing, ...result.data });
    if (!complete.success) return validationError(complete.error);
    const update = await db.collection("events").findOneAndUpdate(
      ownerQuery,
      { $set: { ...result.data, updatedAt: new Date() } },
      { returnDocument: "after", projection: { organizerId: 0 } },
    );
    if (!update) return apiError("Event not found or you do not have access.", 404);
    return NextResponse.json({ event: { ...update, id: update._id.toString(), _id: undefined } });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return apiError("That public event URL is already in use.", 409, { slug: "Choose another URL." });
    console.error("Event update failed", error);
    return apiError("Your event could not be updated. Please try again.", 500);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return apiError("Request origin could not be verified.", 403);
  const auth = await authenticateApiRequest("organizer");
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!ObjectId.isValid(id)) return apiError("Enter a valid event ID.", 422);
  try {
    const db = await getDb();
    const update = await db.collection("events").updateOne(
      { _id: new ObjectId(id), organizerId: new ObjectId(auth.user.id), status: { $ne: "archived" } },
      { $set: { status: "archived", updatedAt: new Date() } },
    );
    if (!update.matchedCount) return apiError("Event not found or you do not have access.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Event archive failed", error);
    return apiError("Your event could not be archived. Please try again.", 500);
  }
}
