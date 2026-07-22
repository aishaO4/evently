import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { apiError } from "@/lib/http";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest("organizer");
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!ObjectId.isValid(id)) return apiError("Enter a valid event ID.", 422);
  try {
    const db = await getDb();
    const event = await db.collection("events").findOne({ _id: new ObjectId(id), organizerId: new ObjectId(auth.user.id), status: { $ne: "archived" } }, { projection: { organizerId: 0 } });
    if (!event) return apiError("Event not found or you do not have access.", 404);
    return NextResponse.json({ event: { ...event, id: event._id.toString(), _id: undefined } });
  } catch (error) {
    console.error("Organizer event failed", error);
    return apiError("Your event could not be loaded. Please try again.", 503);
  }
}
