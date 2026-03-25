"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Auto-refreshes the page every N seconds when there are
 * in-progress policy documents (queued/generating).
 */
export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
