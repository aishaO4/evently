import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { apiError } from "@/lib/http";

export async function GET() {
  const auth = await authenticateApiRequest("organizer");
  if (auth.response) return auth.response;
  try {
    const db = await getDb();
    const events = await db.collection("events").find(
      { organizerId: new ObjectId(auth.user.id), status: { $ne: "archived" } },
      { projection: { organizerId: 0, ticketTiers: 0 } },
    ).sort({ updatedAt: -1 }).toArray();
    return NextResponse.json({ events: events.map((event) => ({ ...event, id: event._id.toString(), _id: undefined })) });
  } catch (error) {
    console.error("Organizer events failed", error);
    return apiError("Your events could not be loaded. Please try again.", 503);
  }
}
