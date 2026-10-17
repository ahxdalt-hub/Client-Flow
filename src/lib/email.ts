import "server-only";
import { CONTACT, PRODUCT, WEBSITE_URL } from "./config";

/**
 * Transactional email via Resend's REST API (no SDK needed).
 * Configure RESEND_API_KEY + EMAIL_FROM to enable; otherwise the
 * email content is logged server-side so the flow still completes.
 */

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

type SendArgs = { to: string; subject: string; html: string };

async function sendRaw({ to, subject, html }: SendArgs) {
  if (!isEmailConfigured()) {
    console.info(`[email:not-configured] Would send "${subject}" to ${to}`);
    return { sent: false as const };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    console.error(`[email] resend failed ${res.status}: ${await res.text()}`);
    return { sent: false as const };
  }
  return { sent: true as const };
}

const shell = (title: string, body: string) => `
<div style="background:#FBFAF7;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E8E2D9;border-radius:18px;overflow:hidden;">
    <div style="background:#14110E;padding:20px 28px;">
      <span style="color:#FBFAF7;font-weight:700;letter-spacing:0.02em;">Client<span style="color:#C0562F;">Flow</span></span>
    </div>
    <div style="padding:28px;">
      <h2 style="margin:0 0 12px;font-size:20px;color:#14110E;">${title}</h2>
      ${body}
      <p style="color:#6B655D;font-size:13px;line-height:1.6;margin-top:28px;">
        Questions? Just reply to this email or write to ${CONTACT.email}.
      </p>
    </div>
  </div>
</div>`;

export function sendOrderPaidEmail(input: {
  to: string;
  name: string;
  orderId: string;
  downloadUrl: string;
  amountRupees: number;
}) {
  const subject = `Your ${PRODUCT.name} download is ready`;
  const body = `
    <p style="color:#6B655D;line-height:1.65;">Hi ${input.name || "there"},</p>
    <p style="color:#6B655D;line-height:1.65;">
      Payment received — ₹${input.amountRupees}. Your copy of the
      <strong style="color:#14110E;">${PRODUCT.name}</strong> is ready.
      Your download link stays active for 30 days.
    </p>
    <p style="margin:24px 0;">
      <a href="${input.downloadUrl}"
         style="background:#14110E;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;display:inline-block;">
        Download the kit
      </a>
    </p>
    <p style="color:#6B655D;font-size:13px;">If the button doesn't work, paste this into your browser:<br>
      <a href="${input.downloadUrl}" style="color:#C0562F;">${input.downloadUrl}</a>
    </p>
    <p style="color:#6B655D;font-size:13px;">Order ref: ${input.orderId}</p>`;
  return sendRaw({ to: input.to, subject, html: shell("Your download is ready", body) });
}

export async function sendSampleEmail(input: { to: string }) {
  const subject = `Your free ${PRODUCT.name} sample`;
  const body = `
    <p style="color:#6B655D;line-height:1.65;">Hi,</p>
    <p style="color:#6B655D;line-height:1.65;">
      Here's the link to your free sample — three full templates from the kit:
    </p>
    <p style="margin:24px 0;">
      <a href="${WEBSITE_URL}/downloads/clientflow-sample.zip"
         style="background:#14110E;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;display:inline-block;">
        Download the sample
      </a>
    </p>
    <p style="color:#6B655D;font-size:13px;">Valid forever. If the button doesn't work, paste this URL into your browser.</p>`;
  return sendRaw({ to: input.to, subject, html: shell("Your free sample", body) });
}
