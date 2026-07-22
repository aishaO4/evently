import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("Sign in to continue.", 401);
  return NextResponse.json({ user });
}
