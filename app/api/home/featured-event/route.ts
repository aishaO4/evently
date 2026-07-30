import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { apiError } from "@/lib/http";

export async function GET() {
  try {
    const db = await getDb();
    const event = await db.collection("events").findOne(
      { status: "published" },
      {
        sort: { startsAt: -1 },
        projection: { _id: 1, title: 1, startsAt: 1, location: 1 },
      },
    );

    if (!event) return NextResponse.json({ event: null });

    const orders = await db.collection("orders").find(
      { eventId: event._id, paymentStatus: "paid" },
      { projection: { ticketCount: 1 } },
    ).toArray();

    const attendeeCount = orders.reduce((sum, order) => sum + Number(order.ticketCount || 0), 0);

    return NextResponse.json({
      event: {
        id: event._id.toString(),
        title: String(event.title || "Untitled event"),
        startsAt: event.startsAt instanceof Date ? event.startsAt.toISOString() : String(event.startsAt),
        location: String(event.location || "Location to be announced"),
        attendeeCount,
      },
    });
  } catch (error) {
    console.error("Featured event could not be loaded", error);
    return apiError("Featured event is temporarily unavailable. Please try again.", 503);
  }
}
