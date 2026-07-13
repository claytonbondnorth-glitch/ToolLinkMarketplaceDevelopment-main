type WaitlistRecord = {
  id?: string;
  email?: string;
  user_id?: string | null;
  source?: string | null;
  created_at?: string;
};

type DatabaseWebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: WaitlistRecord;
  old_record?: WaitlistRecord | null;
};

const TOOLLINK_URL = "https://www.toollinkk.com";

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildFinanceWaitlistEmailHtml(recipientEmail: string): string {
  const safeEmail = escapeHtml(recipientEmail);

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ToolLink Finance Waiting List</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111111;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f5f7;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;background:#ffffff;border:1px solid #ececec;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(120deg,#111111 0%,#1c1c1c 65%,#2a2a2a 100%);padding:28px 24px;text-align:left;">
                <div style="display:inline-block;background:#ff6a00;color:#ffffff;font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:8px 12px;border-radius:999px;">ToolLink Finance</div>
                <h1 style="margin:18px 0 0 0;font-size:32px;line-height:1.15;color:#ffffff;font-weight:800;">You&rsquo;re on the list</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 18px 24px;">
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.65;color:#2b2b2b;">Thanks for registering your interest in ToolLink Finance.</p>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.65;color:#2b2b2b;">ToolLink is currently working with accredited Australian finance professionals to prepare tool and equipment finance options.</p>
                <p style="margin:0 0 22px 0;font-size:16px;line-height:1.65;color:#2b2b2b;">Finance is not available yet. We&rsquo;ll contact you when ToolLink Finance is ready.</p>
                <p style="margin:0 0 24px 0;font-size:13px;line-height:1.5;color:#666666;">Registered email: ${safeEmail}</p>
                <a href="${TOOLLINK_URL}" style="display:inline-block;background:#ff6a00;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 22px;border-radius:10px;">Visit ToolLink</a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px 26px 24px;border-top:1px solid #f0f0f0;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#6a6a6a;">ToolLink &mdash; Australia&rsquo;s marketplace for buying and selling tools</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, message: "Method not allowed. Use POST." }, 405);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  if (!resendApiKey) {
    console.error("[finance-waitlist] Missing RESEND_API_KEY secret.");
    return jsonResponse({ ok: false, message: "Server misconfiguration: missing RESEND_API_KEY." }, 500);
  }

  const webhookSecret = Deno.env.get("FINANCE_WEBHOOK_SECRET") ?? "";
  if (webhookSecret) {
    const authHeader = req.headers.get("authorization") ?? "";
    const expected = `Bearer ${webhookSecret}`;
    if (authHeader !== expected) {
      console.error("[finance-waitlist] Unauthorized webhook request.");
      return jsonResponse({ ok: false, message: "Unauthorized webhook request." }, 401);
    }
  }

  const payload = (await req.json().catch(() => null)) as DatabaseWebhookPayload | null;
  if (!payload) {
    console.error("[finance-waitlist] Invalid JSON payload.");
    return jsonResponse({ ok: false, message: "Invalid JSON payload." }, 400);
  }

  const eventType = (payload.type ?? "").toUpperCase();
  const schema = payload.schema ?? "";
  const table = payload.table ?? "";

  if (eventType !== "INSERT" || schema !== "public" || table !== "finance_waitlist") {
    console.log("[finance-waitlist] Ignored event.", { eventType, schema, table });
    return jsonResponse({ ok: true, ignored: true, message: "Event ignored." }, 200);
  }

  const record = payload.record ?? {};
  const rowId = record.id ?? "";
  const email = (record.email ?? "").trim().toLowerCase();

  if (!email) {
    console.error("[finance-waitlist] Waitlist row has no email.", { rowId });
    return jsonResponse({ ok: false, message: "Waitlist record is missing email." }, 400);
  }

  if (!isValidEmail(email)) {
    console.error("[finance-waitlist] Waitlist row has invalid email format.", { rowId, email });
    return jsonResponse({ ok: false, message: "Waitlist record email format is invalid." }, 400);
  }

  const resendFrom = Deno.env.get("RESEND_FROM_EMAIL") || "ToolLink <onboarding@resend.dev>";
  const html = buildFinanceWaitlistEmailHtml(email);

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": rowId ? `finance_waitlist_${rowId}` : `finance_waitlist_${email}`,
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [email],
      subject: "You’re on the ToolLink Finance waiting list",
      html,
    }),
  });

  const resendBody = await resendResponse.json().catch(() => ({}));

  if (!resendResponse.ok) {
    console.error("[finance-waitlist] Resend API error.", {
      status: resendResponse.status,
      rowId,
      email,
      resendBody,
    });

    return jsonResponse({
      ok: false,
      message: "Failed to send finance waitlist confirmation email.",
      status: resendResponse.status,
      resend: resendBody,
    }, 502);
  }

  console.log("[finance-waitlist] Confirmation email sent.", {
    rowId,
    email,
    resendId: (resendBody as { id?: string }).id ?? null,
  });

  return jsonResponse({
    ok: true,
    message: "Finance waitlist confirmation email sent.",
    rowId,
    email,
    resendId: (resendBody as { id?: string }).id ?? null,
  });
});
