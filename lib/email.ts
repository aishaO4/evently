import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    if (process.env.NODE_ENV === "production") throw new Error("Password reset email is not configured.");
    console.info(`[Gatherly development reset link] ${email}: ${resetUrl}`);
    return;
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  await transport.sendMail({
    from: SMTP_FROM || "Gatherly <no-reply@example.com>",
    to: email,
    subject: "Reset your Gatherly password",
    text: `Reset your Gatherly password: ${resetUrl}\n\nThis link expires in one hour. If you did not request it, you can ignore this email.`,
  });
}
