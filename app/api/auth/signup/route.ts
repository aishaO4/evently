import { hash } from "bcryptjs";
import { MongoServerError } from "mongodb";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { apiError, isSameOrigin, validationError } from "@/lib/http";
import { parseJson, signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return apiError("Request origin could not be verified.", 403);
  const result = signupSchema.safeParse(await parseJson(request));
  if (!result.success) return validationError(result.error);

  try {
    const db = await getDb();
    const now = new Date();
    const inserted = await db.collection("users").insertOne({
      name: result.data.name,
      email: result.data.email,
      passwordHash: await hash(result.data.password, 12),
      role: result.data.role,
      createdAt: now,
      updatedAt: now,
    });
    await createSession(inserted.insertedId, true);
    return NextResponse.json({ user: { id: inserted.insertedId.toString(), name: result.data.name, email: result.data.email, role: result.data.role } }, { status: 201 });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return apiError("An account with this email already exists.", 409, { email: "Try signing in instead." });
    console.error("Signup failed", error);
    return apiError("We could not create your account. Please try again.", 500);
  }
}
