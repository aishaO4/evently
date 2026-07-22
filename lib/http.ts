import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function apiError(message: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json({ error: message, fields }, { status });
}

export function validationError(error: ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] || "form");
    if (!fields[key]) fields[key] = issue.message;
  }
  return apiError("Check the highlighted fields and try again.", 422, fields);
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  return origin === new URL(request.url).origin;
}
