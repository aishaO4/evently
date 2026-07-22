import { NextResponse } from "next/server";
import { destroySession, getCurrentUser } from "@/lib/auth";
import { apiError, isSameOrigin } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return apiError("Request origin could not be verified.", 403);
  if (!(await getCurrentUser())) return apiError("Sign in to continue.", 401);
  await destroySession();
  return NextResponse.json({ ok: true });
}
