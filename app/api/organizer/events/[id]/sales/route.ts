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
    const organizerId = new ObjectId(auth.user.id);
    const eventId = new ObjectId(id);
    const event = await db.collection("events").findOne({ _id: eventId, organizerId, status: { $ne: "archived" } }, { projection: { title: 1, startsAt: 1 } });
    if (!event) return apiError("Event not found or you do not have access.", 404);
    const orders = await db.collection("orders").find(
      { eventId, organizerId },
      { projection: { attendeeId: 0, organizerId: 0, eventId: 0, paymentReference: 0 } },
    ).sort({ createdAt: -1 }).limit(100).toArray();
    const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
    return NextResponse.json({ event: { id, title: event.title, startsAt: event.startsAt }, summary: { orders: paidOrders.length, tickets: paidOrders.reduce((sum, order) => sum + Number(order.ticketCount || 0), 0), gross: paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0) }, orders: orders.map((order) => ({ ...order, id: order._id.toString(), _id: undefined })) });
  } catch (error) {
    console.error("Organizer sales failed", error);
    return apiError("Sales could not be loaded. Please try again.", 503);
  }
}
