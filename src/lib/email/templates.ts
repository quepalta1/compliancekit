/* ------------------------------------------------------------------ */
/*  Email templates for ComplianceKit notifications                    */
/* ------------------------------------------------------------------ */

interface EvidenceExpiryReminderParams {
  recipientName: string;
  evidenceTitle: string;
  daysUntilExpiry: number;
  organizationName: string;
  dashboardUrl: string;
}

/**
 * Returns the subject line for an evidence-expiry reminder email.
 */
export function evidenceExpiryReminderSubject(
  daysUntilExpiry: number,
  evidenceTitle: string,
): string {
  return `[ComplianceKit] "${evidenceTitle}" expires in ${daysUntilExpiry} days`;
}

/**
 * Returns a clean HTML email body warning about upcoming evidence expiry.
 */
export function evidenceExpiryReminderHtml(
  params: EvidenceExpiryReminderParams,
): string {
  const {
    recipientName,
    evidenceTitle,
    daysUntilExpiry,
    organizationName,
    dashboardUrl,
  } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Evidence Expiry Reminder</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1e293b;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">ComplianceKit</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
                Hi ${escapeHtml(recipientName)},
              </p>
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
                This is a reminder that the following evidence item in
                <strong>${escapeHtml(organizationName)}</strong> will expire in
                <strong>${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}</strong>:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#0f172a;font-size:16px;font-weight:600;">
                      ${escapeHtml(evidenceTitle)}
                    </p>
                    <p style="margin:6px 0 0;color:#64748b;font-size:13px;">
                      Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">
                Please review and renew this evidence before it expires to
                maintain your compliance posture.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:6px;background-color:#2563eb;">
                    <a href="${escapeHtml(dashboardUrl)}" target="_blank"
                       style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                      View in Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                You received this email because you are the owner of this
                evidence item in ${escapeHtml(organizationName)}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Escape HTML special characters to prevent XSS in templated values. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
