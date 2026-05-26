import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "ManorOps <onboarding@resend.dev>";
const APP_URL = process.env.NEXTAUTH_URL ?? "https://manorops.vercel.app";

export async function sendReminderEmail({
  to,
  message,
  remindAt,
  taskTitle,
  documentTitle,
  assetName,
  propertyName,
}: {
  to: string;
  message: string;
  remindAt: Date;
  taskTitle?: string | null;
  documentTitle?: string | null;
  assetName?: string | null;
  propertyName?: string | null;
}) {
  const context = [
    taskTitle && `Task: ${taskTitle}`,
    documentTitle && `Document: ${documentTitle}`,
    assetName && `Asset: ${assetName}`,
    propertyName && `Property: ${propertyName}`,
  ]
    .filter(Boolean)
    .join(" &middot; ");

  const dateStr = new Date(remindAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Reminder: ${message}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;padding:36px;">
        <tr><td>
          <div style="display:inline-block;background:#1c1917;color:#ffffff;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;letter-spacing:0.05em;margin-bottom:28px;">MANOROPS</div>
          <h2 style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1c1917;">${message}</h2>
          ${context ? `<p style="margin:0 0 6px;font-size:14px;color:#78716c;">${context}</p>` : ""}
          <p style="margin:0 0 32px;font-size:13px;color:#a8a29e;">Due ${dateStr}</p>
          <a href="${APP_URL}/dashboard" style="display:inline-block;background:#1c1917;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">Open ManorOps &rarr;</a>
          <p style="margin:32px 0 0;font-size:12px;color:#d6d3d1;">You received this because you have an active reminder in ManorOps. Dismiss the reminder in the app to stop these emails.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
