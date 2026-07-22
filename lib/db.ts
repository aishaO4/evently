import { MongoClient, type Db } from "mongodb";

const databaseName = process.env.MONGODB_DB || "gatherly";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
  mongoIndexesPromise?: Promise<void>;
};

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  const clientPromise = globalForMongo.mongoClientPromise || new MongoClient(uri).connect();
  if (process.env.NODE_ENV !== "production") globalForMongo.mongoClientPromise = clientPromise;
  const client = await clientPromise;
  const db = client.db(databaseName);

  if (!globalForMongo.mongoIndexesPromise) {
    globalForMongo.mongoIndexesPromise = Promise.all([
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
      db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection("passwordResetTokens").createIndex({ tokenHash: 1 }, { unique: true }),
      db.collection("passwordResetTokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection("events").createIndex({ slug: 1 }, { unique: true }),
      db.collection("events").createIndex({ organizerId: 1, status: 1, endsAt: 1 }),
      db.collection("events").createIndex({ status: 1, startsAt: 1 }),
      db.collection("orders").createIndex({ organizerId: 1, eventId: 1, createdAt: -1 }),
      db.collection("orders").createIndex({ attendeeId: 1, createdAt: -1 }),
      db.collection("tickets").createIndex({ attendeeId: 1, eventId: 1 }),
    ]).then(() => undefined);
  }

  await globalForMongo.mongoIndexesPromise;
  return db;
}
