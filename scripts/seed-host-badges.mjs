import { hash } from "bcryptjs";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "gatherly";
const client = new MongoClient(uri);

const password = "HostBadge123!";
const passwordHash = await hash(password, 12);
const now = new Date();

function iso(date) {
  return new Date(date).toISOString();
}

const organizerSpecs = [
  {
    email: "verified.host@example.com",
    name: "Maya Verified",
    role: "organizer",
    passwordHash,
    payoutVerifiedAt: now,
    idVerifiedAt: now,
    createdAt: now,
    updatedAt: now,
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
    passwordHash,
    createdAt: now,
    updatedAt: now,
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
    passwordHash,
    createdAt: now,
    updatedAt: now,
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

try {
  await client.connect();
  const db = client.db(dbName);

  for (const spec of organizerSpecs) {
    const existing = await db.collection("users").findOne({ email: spec.email });
    let userId;

    if (existing) {
      await db.collection("users").updateOne(
        { _id: existing._id },
        { $set: { ...spec, updatedAt: now } },
      );
      userId = existing._id;
    } else {
      const inserted = await db.collection("users").insertOne(spec);
      userId = inserted.insertedId;
    }

    const organizerEvents = spec.events.map((event) => ({
      ...event,
      organizerId: userId,
      createdAt: now,
      updatedAt: now,
    }));

    for (const event of organizerEvents) {
      const existingEvent = await db.collection("events").findOne({ slug: event.slug });
      if (existingEvent) {
        await db.collection("events").updateOne(
          { _id: existingEvent._id },
          { $set: { ...event, updatedAt: now } },
        );
      } else {
        await db.collection("events").insertOne(event);
      }
    }
  }

  console.log("Seeded organizer accounts and events:");
  console.log("- verified.host@example.com -> verified badge");
  console.log("- repeat.host@example.com -> repeat badge (2 past events)");
  console.log("- new.host@example.com -> new badge");
  console.log("Password for each seeded account: HostBadge123!");
  console.log(`MongoDB URI: ${uri}`);
  console.log(`Database: ${dbName}`);
} catch (error) {
  console.error("Seeding failed", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
