import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client for server-side operations that bypass RLS
 * (webhooks, cron jobs, admin tasks). Never expose this on the client.
 */
export function createServiceClient() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    // Dynamically import to avoid bundling demo code in production
    const { createMockClient } = require("@/lib/demo/mock-client");
    return createMockClient() as any;
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
