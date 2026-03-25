import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    // Lazy-load to avoid bundling demo code when not needed
    const { createMockClient } = require("@/lib/demo/mock-client");
    return createMockClient() as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
