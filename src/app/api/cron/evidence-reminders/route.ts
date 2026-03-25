import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEvidenceReminder } from "@/lib/email/send-reminder";

const TEMPLATE_CODE = "evidence_expiry_reminder";
const REMINDER_DAYS = [90, 60, 30] as const;

/**
 * GET /api/cron/evidence-reminders
 *
 * Vercel cron job that sends email reminders for evidence items expiring
 * in exactly 90, 60, or 30 days. Idempotent — the unique constraint on
 * email_notifications prevents duplicate sends.
 */
export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────
  const secret = request.nextUrl.searchParams.get("secret") ??
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const results: Array<{
    evidenceItemId: string;
    reminderDay: number;
    recipientEmail: string;
    status: "sent" | "skipped" | "error";
    messageId?: string;
    reason?: string;
  }> = [];

  for (const day of REMINDER_DAYS) {
    // ── Find evidence expiring in exactly `day` days ────────────────
    const targetDate = new Date();
    targetDate.setUTCDate(targetDate.getUTCDate() + day);
    const targetDateStr = targetDate.toISOString().slice(0, 10); // YYYY-MM-DD

    console.log(
      `[evidence-reminders] Checking for evidence expiring on ${targetDateStr} (${day}-day reminder)`,
    );

    const { data: items, error: queryError } = await supabase
      .from("evidence_items")
      .select("id, title, expires_at, owner_user_id, organization_id")
      .eq("expires_at", targetDateStr);

    if (queryError) {
      console.error(
        `[evidence-reminders] Query error for ${day}-day window:`,
        queryError.message,
      );
      continue;
    }

    if (!items || items.length === 0) {
      console.log(`[evidence-reminders] No items expiring in ${day} days`);
      continue;
    }

    console.log(
      `[evidence-reminders] Found ${items.length} item(s) expiring in ${day} days`,
    );

    for (const item of items) {
      // ── Resolve owner ───────────────────────────────────────────────
      if (!item.owner_user_id) {
        console.log(
          `[evidence-reminders] Skipping ${item.id} — no owner_user_id`,
        );
        results.push({
          evidenceItemId: item.id,
          reminderDay: day,
          recipientEmail: "",
          status: "skipped",
          reason: "no_owner",
        });
        continue;
      }

      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(item.owner_user_id);

      if (userError || !userData?.user?.email) {
        console.log(
          `[evidence-reminders] Skipping ${item.id} — could not resolve owner email`,
        );
        results.push({
          evidenceItemId: item.id,
          reminderDay: day,
          recipientEmail: "",
          status: "skipped",
          reason: "owner_email_not_found",
        });
        continue;
      }

      const recipientEmail = userData.user.email;
      const recipientName =
        userData.user.user_metadata?.full_name ??
        userData.user.email?.split("@")[0] ??
        "there";

      // ── Check if already sent (idempotency) ─────────────────────────
      const { data: existing } = await supabase
        .from("email_notifications")
        .select("id")
        .eq("evidence_item_id", item.id)
        .eq("template_code", TEMPLATE_CODE)
        .eq("reminder_day", day)
        .eq("recipient_email", recipientEmail)
        .limit(1)
        .maybeSingle();

      if (existing) {
        console.log(
          `[evidence-reminders] Already sent ${day}-day reminder for ${item.id} to ${recipientEmail}`,
        );
        results.push({
          evidenceItemId: item.id,
          reminderDay: day,
          recipientEmail,
          status: "skipped",
          reason: "already_sent",
        });
        continue;
      }

      // ── Resolve organization name ──────────────────────────────────
      const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", item.organization_id)
        .single();

      const organizationName = org?.name ?? "Your organization";

      // ── Send ────────────────────────────────────────────────────────
      const sendResult = await sendEvidenceReminder({
        evidenceItem: item,
        reminderDay: day,
        recipientEmail,
        recipientName,
        organizationName,
      });

      if (!sendResult.success) {
        console.error(
          `[evidence-reminders] Failed to send to ${recipientEmail} for ${item.id}:`,
          sendResult.error,
        );
        results.push({
          evidenceItemId: item.id,
          reminderDay: day,
          recipientEmail,
          status: "error",
          reason: sendResult.error,
        });
        continue;
      }

      // ── Record in email_notifications ──────────────────────────────
      const { error: insertError } = await supabase
        .from("email_notifications")
        .insert({
          organization_id: item.organization_id,
          evidence_item_id: item.id,
          template_code: TEMPLATE_CODE,
          reminder_day: day,
          recipient_email: recipientEmail,
          provider_message_id: sendResult.messageId ?? null,
        });

      if (insertError) {
        // Unique constraint violation means another run already recorded it
        console.warn(
          `[evidence-reminders] Insert error for ${item.id} (may be duplicate):`,
          insertError.message,
        );
      }

      console.log(
        `[evidence-reminders] Sent ${day}-day reminder for "${item.title}" to ${recipientEmail} (messageId: ${sendResult.messageId})`,
      );

      results.push({
        evidenceItemId: item.id,
        reminderDay: day,
        recipientEmail,
        status: "sent",
        messageId: sendResult.messageId,
      });
    }
  }

  const summary = {
    sent: results.filter((r) => r.status === "sent").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    errors: results.filter((r) => r.status === "error").length,
    details: results,
  };

  console.log("[evidence-reminders] Run complete:", JSON.stringify(summary));

  return NextResponse.json(summary);
}
