import { Resend } from "resend";

let resendClient = null;

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

export async function sendEmail({ to, subject, html }) {
  const resend = getResend();
  if (!resend) return false;

  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Trendora Store <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    return !response?.error;
  } catch {
    return false;
  }
}
