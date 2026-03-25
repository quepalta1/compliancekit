"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/server/actions/billing";

interface UpgradeButtonProps {
  planCode: string;
}

export function UpgradeButton({ planCode }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const result = await createCheckoutSession(planCode);

      if ("error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }

      window.location.href = result.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting...
          </>
        ) : (
          <>
            Upgrade
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
