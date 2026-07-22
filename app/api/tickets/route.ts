import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { apiError } from "@/lib/http";

export async function GET() {
  const auth = await authenticateApiRequest("attendee");
  if (auth.response) return auth.response;
  try {
    const db = await getDb();
    const attendeeId = new ObjectId(auth.user.id);
    const tickets = await db.collection("tickets").aggregate([
      { $match: { attendeeId } },
      { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
      { $unwind: "$event" },
      { $project: { tier: 1, status: 1, createdAt: 1, "event.title": 1, "event.startsAt": 1, "event.location": 1, "event.category": 1 } },
      { $sort: { "event.startsAt": 1 } },
    ]).toArray();
    return NextResponse.json({ tickets: tickets.map((ticket) => ({ ...ticket, id: ticket._id.toString(), _id: undefined })) });
  } catch (error) {
    console.error("Attendee tickets failed", error);
    return apiError("Your tickets could not be loaded. Please try again.", 503);
  }
}
