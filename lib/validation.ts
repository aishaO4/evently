import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254);
const password = z.string().min(10, "Use at least 10 characters.").max(128).regex(/[a-z]/, "Add a lowercase letter.").regex(/[A-Z]/, "Add an uppercase letter.").regex(/[0-9]/, "Add a number.");

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email,
  password,
  role: z.enum(["organizer", "attendee"], { error: "Choose how you will use Ticklit." }),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(128),
  remember: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({ token: z.string().min(32), password });
export const accountSchema = z.object({ name: z.string().trim().min(2, "Enter your name.").max(80) });

const ticketTierSchema = z.object({
  name: z.string().trim().min(1).max(60),
  type: z.enum(["free", "paid", "donation"]),
  price: z.number().min(0).max(1_000_000),
  quantity: z.number().int().min(1).max(1_000_000),
});

const eventFields = z.object({
  title: z.string().trim().min(3).max(100),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  category: z.string().trim().min(2).max(50),
  location: z.string().trim().min(2).max(200),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  coverImageUrl: z.string().url().max(2_000).nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  ticketTiers: z.array(ticketTierSchema).min(1).max(20),
});

export const eventSchema = eventFields.refine((data) => data.endsAt > data.startsAt, { message: "End time must be after start time.", path: ["endsAt"] });
export const eventPatchSchema = eventFields.partial()
  .refine((data) => Object.keys(data).length > 0, { message: "Add at least one event change." })
  .refine((data) => !data.startsAt || !data.endsAt || data.endsAt > data.startsAt, { message: "End time must be after start time.", path: ["endsAt"] });

export async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
