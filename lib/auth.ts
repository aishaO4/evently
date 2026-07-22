import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export const SESSION_COOKIE = "gatherly_session";
const DAY = 24 * 60 * 60 * 1000;

export type UserRole = "organizer" | "attendee";
export type SafeUser = { id: string; name: string; email: string; role: UserRole };

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: ObjectId, remember = false) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + (remember ? 30 : 1) * DAY);
  const db = await getDb();
  await db.collection("sessions").insertOne({ userId, tokenHash: hashToken(token), expiresAt, createdAt: new Date(), lastUsedAt: new Date() });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.collection("sessions").deleteOne({ tokenHash: hashToken(token) });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const session = await db.collection("sessions").findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await db.collection("users").findOne({ _id: session.userId }, { projection: { name: 1, email: 1, role: 1 } });
  if (!user) return null;
  await db.collection("sessions").updateOne({ _id: session._id }, { $set: { lastUsedAt: new Date() } });
  return { id: user._id.toString(), name: String(user.name), email: String(user.email), role: user.role === "attendee" ? "attendee" : "organizer" };
}

export async function requireUser(returnTo = "/create") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  return user;
}

export async function requireRole(role: UserRole, returnTo: string) {
  const user = await requireUser(returnTo);
  if (user.role !== role) redirect(user.role === "organizer" ? "/organizer/dashboard" : "/tickets");
  return user;
}
