import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const DEFAULT_SEED_PASSWORD = "host-badge-seed-2026";
const SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD || DEFAULT_SEED_PASSWORD;
const SEED_PASSWORD_HINT = "Set ADMIN_SEED_PASSWORD in Vercel to change this from the default.";

const organizerSpecs = [
  {
    email: "verified.host@example.com",
    name: "Maya Verified",
    role: "organizer",
    payoutVerifiedAt: new Date(),
    idVerifiedAt: new Date(),
    events: [
      {
        title: "Verified Launch Night",
        slug: "verified-launch-night",
        category: "Business",
        location: "Seattle, WA",
        startsAt: new Date("2026-09-12T19:00:00.000Z"),
        endsAt: new Date("2026-09-12T22:00:00.000Z"),
        status: "published",
        ticketTiers: [{ name: "General Admission", type: "free", price: 0, quantity: 120 }],
      },
    ],
  },
  {
    email: "repeat.host@example.com",
    name: "Noah Repeat",
    role: "organizer",
    events: [
      {
        title: "Repeat Host Reunion",
        slug: "repeat-host-reunion",
        category: "Community",
        location: "Portland, OR",
        startsAt: new Date("2026-10-03T18:30:00.000Z"),
        endsAt: new Date("2026-10-03T21:30:00.000Z"),
        status: "published",
        ticketTiers: [{ name: "General Admission", type: "free", price: 0, quantity: 90 }],
      },
      {
        title: "Past Event One",
        slug: "past-event-one",
        category: "Community",
        location: "Portland, OR",
        startsAt: new Date("2025-03-08T18:00:00.000Z"),
        endsAt: new Date("2025-03-08T21:00:00.000Z"),
        status: "published",
        ticketTiers: [{ name: "General Admission", type: "free", price: 0, quantity: 60 }],
      },
      {
        title: "Past Event Two",
        slug: "past-event-two",
        category: "Community",
        location: "Portland, OR",
        startsAt: new Date("2024-06-14T18:00:00.000Z"),
        endsAt: new Date("2024-06-14T21:00:00.000Z"),
        status: "published",
        ticketTiers: [{ name: "General Admission", type: "free", price: 0, quantity: 60 }],
      },
    ],
  },
  {
    email: "new.host@example.com",
    name: "Lina New",
    role: "organizer",
    events: [
      {
        title: "New Host First Night",
        slug: "new-host-first-night",
        category: "Wellness",
        location: "Austin, TX",
        startsAt: new Date("2026-08-20T17:00:00.000Z"),
        endsAt: new Date("2026-08-20T20:00:00.000Z"),
        status: "published",
        ticketTiers: [{ name: "General Admission", type: "free", price: 0, quantity: 75 }],
      },
    ],
  },
];

function getProvidedPassword(request: Request) {
  const url = new URL(request.url);
  const queryPassword = url.searchParams.get("password");
  const headerPassword = request.headers.get("x-admin-seed-password");
  return queryPassword || headerPassword || "";
}

export async function GET(request: Request) {
  const providedPassword = getProvidedPassword(request);
  if (providedPassword !== SEED_PASSWORD) {
    return NextResponse.json(
      { error: "Unauthorized", hint: SEED_PASSWORD_HINT },
      { status: 401 },
    );
  }

  return seedHostBadges();
}

export async function POST(request: Request) {
  return GET(request);
}

async function seedHostBadges() {
  try {
    const db = await getDb();
    const passwordHash = await hash("HostBadge123!", 12);
    const now = new Date();
    const results: string[] = [];

    for (const spec of organizerSpecs) {
      const existingUser = await db.collection("users").findOne({ email: spec.email });
      const payload = {
        ...spec,
        passwordHash,
        createdAt: existingUser?.createdAt || now,
        updatedAt: now,
      };

      let userId: unknown;
      if (existingUser) {
        await db.collection("users").updateOne({ _id: existingUser._id }, { $set: payload });
        userId = existingUser._id;
      } else {
        const inserted = await db.collection("users").insertOne(payload);
        userId = inserted.insertedId;
      }

      for (const event of spec.events) {
        const eventPayload = {
          ...event,
          organizerId: userId,
          createdAt: now,
          updatedAt: now,
        };

        const existingEvent = await db.collection("events").findOne({ slug: event.slug });
        if (existingEvent) {
          await db.collection("events").updateOne({ _id: existingEvent._id }, { $set: eventPayload });
        } else {
          await db.collection("events").insertOne(eventPayload);
        }
      }

      results.push(`${spec.email} seeded`);
    }

    return NextResponse.json({
      ok: true,
      message: "Host badge seed completed.",
      details: results,
      password: SEED_PASSWORD === DEFAULT_SEED_PASSWORD ? "default-password-active" : "custom-password-active",
    });
  } catch (error) {
    console.error("Host badge seeding failed", error);
    return NextResponse.json({ ok: false, error: "Seed failed.", details: String(error) }, { status: 500 });
  }
}
