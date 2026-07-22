import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { apiError, isSameOrigin, validationError } from "@/lib/http";
import { accountSchema, parseJson } from "@/lib/validation";

export async function GET() {
  const auth = await authenticateApiRequest();
  if (auth.response) return auth.response;
  return NextResponse.json({ user: auth.user });
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return apiError("Request origin could not be verified.", 403);
  const auth = await authenticateApiRequest();
  if (auth.response) return auth.response;
  const result = accountSchema.safeParse(await parseJson(request));
  if (!result.success) return validationError(result.error);
  try {
    const db = await getDb();
    await db.collection("users").updateOne({ _id: new ObjectId(auth.user.id) }, { $set: { name: result.data.name, updatedAt: new Date() } });
    return NextResponse.json({ user: { ...auth.user, name: result.data.name } });
  } catch (error) {
    console.error("Account update failed", error);
    return apiError("Your account could not be updated. Please try again.", 500);
  }
}
