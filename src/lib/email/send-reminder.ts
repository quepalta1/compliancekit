import { getResend, FROM_EMAIL } from "./resend";
import {
  evidenceExpiryReminderHtml,
  evidenceExpiryReminderSubject,
} from "./templates";

interface SendEvidenceReminderParams {
  evidenceItem: {
    id: string;
    title: string;
    expires_at: string;
    owner_user_id: string;
    organization_id: string;
  };
  reminderDay: number;
  recipientEmail: string;
  recipientName: string;
  organizationName: string;
}

/**
 * Sends an evidence-expiry reminder email via Resend.
 * Returns the provider message ID on success.
 */
export async function sendEvidenceReminder(
  params: SendEvidenceReminderParams,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    evidenceItem,
    reminderDay,
    recipientEmail,
    recipientName,
    organizationName,
  } = params;

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://app.compliancekit.app"}/evidence/${evidenceItem.id}`;

  const subject = evidenceExpiryReminderSubject(reminderDay, evidenceItem.title);
  const html = evidenceExpiryReminderHtml({
    recipientName,
    evidenceTitle: evidenceItem.title,
    daysUntilExpiry: reminderDay,
    organizationName,
    dashboardUrl,
  });

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject,
      html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
