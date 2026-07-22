import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { hashToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { apiError, isSameOrigin, validationError } from "@/lib/http";
import { forgotPasswordSchema, parseJson } from "@/lib/validation";

const RESPONSE = "If that email belongs to an account, a reset link is on its way.";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return apiError("Request origin could not be verified.", 403);
  const result = forgotPasswordSchema.safeParse(await parseJson(request));
  if (!result.success) return validationError(result.error);

  try {
    const db = await getDb();
    const user = await db.collection("users").findOne({ email: result.data.email });
    if (!user) return NextResponse.json({ message: RESPONSE });
    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(token);
    await db.collection("passwordResetTokens").deleteMany({ userId: user._id, usedAt: null });
    await db.collection("passwordResetTokens").insertOne({ userId: user._id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000), usedAt: null, createdAt: new Date() });
    try {
      await sendPasswordResetEmail(result.data.email, token);
    } catch (error) {
      await db.collection("passwordResetTokens").deleteOne({ tokenHash });
      throw error;
    }
    return NextResponse.json({ message: RESPONSE });
  } catch (error) {
    console.error("Password reset request failed", error);
    return apiError("We could not send the reset email. Please try again shortly.", 503);
  }
}
