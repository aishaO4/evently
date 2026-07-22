import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { hashToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { apiError, isSameOrigin, validationError } from "@/lib/http";
import { parseJson, resetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return apiError("Request origin could not be verified.", 403);
  const result = resetPasswordSchema.safeParse(await parseJson(request));
  if (!result.success) return validationError(result.error);

  try {
    const db = await getDb();
    const tokenHash = hashToken(result.data.token);
    const reset = await db.collection("passwordResetTokens").findOne({ tokenHash, usedAt: null, expiresAt: { $gt: new Date() } });
    if (!reset) return apiError("This reset link is invalid or has expired.", 400);
    const updated = await db.collection("users").updateOne({ _id: reset.userId }, { $set: { passwordHash: await hash(result.data.password, 12), updatedAt: new Date() } });
    if (!updated.matchedCount) return apiError("This account is no longer available.", 404);
    await Promise.all([
      db.collection("passwordResetTokens").updateOne({ _id: reset._id }, { $set: { usedAt: new Date() } }),
      db.collection("sessions").deleteMany({ userId: reset.userId }),
    ]);
    return NextResponse.json({ message: "Password updated. You can now sign in." });
  } catch (error) {
    console.error("Password reset failed", error);
    return apiError("We could not reset your password. Please try again.", 500);
  }
}
