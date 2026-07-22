import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { apiError, isSameOrigin, validationError } from "@/lib/http";
import { loginSchema, parseJson } from "@/lib/validation";

const DUMMY_HASH = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxuW8S9EDqgYNZp.5VvZVZ5H9lK";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return apiError("Request origin could not be verified.", 403);
  const result = loginSchema.safeParse(await parseJson(request));
  if (!result.success) return validationError(result.error);

  try {
    const db = await getDb();
    const user = await db.collection("users").findOne({ email: result.data.email });
    const valid = await compare(result.data.password, String(user?.passwordHash || DUMMY_HASH));
    if (!user || !valid) return apiError("Email or password is incorrect.", 401);
    await createSession(user._id, result.data.remember);
    return NextResponse.json({ user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role || "organizer" } });
  } catch (error) {
    console.error("Login failed", error);
    return apiError("We could not sign you in. Please try again.", 500);
  }
}
