import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { apiError } from "@/lib/http";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest("attendee");
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!ObjectId.isValid(id)) return apiError("Enter a valid ticket ID.", 422);
  try {
    const db = await getDb();
    const result = await db.collection("tickets").aggregate([
      { $match: { _id: new ObjectId(id), attendeeId: new ObjectId(auth.user.id) } },
      { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
      { $unwind: "$event" },
      { $project: { tier: 1, status: 1, createdAt: 1, "event.title": 1, "event.startsAt": 1, "event.location": 1, "event.category": 1 } },
    ]).next();
    if (!result) return apiError("Ticket not found or you do not have access.", 404);
    return NextResponse.json({ ticket: { ...result, id: result._id.toString(), _id: undefined, ticketReference: result._id.toString().slice(-8).toUpperCase() } });
  } catch (error) {
    console.error("Attendee ticket failed", error);
    return apiError("Your ticket could not be loaded. Please try again.", 503);
  }
}
