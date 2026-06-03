import { Resend } from "resend";
let resendClient = null;
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[EMAIL DISPATCH WARNING] RESEND_API_KEY is not defined. Falling back to stdout simulation.`);
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(key);
  }
  return resendClient;
}
export async function sendEmail({ to, subject, html }) {
  const resend = getResend();
  console.log(`
======================================================
[EMAIL OUTBOX OUTP] Dispatching to: ${to}
Subject: ${subject}
======================================================
`);
  if (!resend) {
    console.log(`[EMAIL SIMULATOR CONTENT]:
${html.replace(/<[^>]*>/g, " ").substring(0, 300)}...
======================================================
`);
    return false;
  }
  try {
    const response = await resend.emails.send({
      from: "Trendora Store <onboarding@resend.dev>",
      to,
      subject,
      html
    });
    if (response?.error) {
      const isValidationError = response.error.name === "validation_error" || typeof response.error.message === "string" && response.error.message.includes("sandbox");
      if (isValidationError) {
        const ownerEmail = "mudassaralibhatti446@gmail.com";
        console.warn(`[EMAIL SENDER] Sandbox mode: Rerouting email directly to registered inbox (${ownerEmail}) because recipient '${to}' is in sandbox restriction.`);
        const reroutedHtml = html;
        try {
          const retryResponse = await resend.emails.send({
            from: "Trendora Store <onboarding@resend.dev>",
            to: ownerEmail,
            subject,
            // Keep the exact original subject for authenticity
            html: reroutedHtml
          });
          if (retryResponse?.error) {
            console.error(`[EMAIL DISPATCH ERROR] Failed to deliver to registered owner:`, retryResponse.error);
            return false;
          }
          console.log(`[EMAIL DISPATCH SUCCESS] Email successfully delivered to owner inbox: ${ownerEmail}`);
          return true;
        } catch (retryErr) {
          console.error(`[EMAIL DISPATCH ERROR] Unexpected error during owner delivery:`, retryErr);
          return false;
        }
      } else {
        console.error(`[EMAIL DISPATCH ERROR] Failed via Resend helper`, response.error);
      }
      return false;
    }
    console.log(`[EMAIL DISPATCH SUCCESS] Message delivered successfully via Resend. ID: ${response.data?.id}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL DISPATCH ERROR] Unexpected error while sending email via Resend API:`, error);
    return false;
  }
}
