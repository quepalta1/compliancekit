"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface BillingBannerProps {
  variant: "success" | "info";
  message: string;
}

const variantStyles = {
  success: "border-green-200 bg-green-50 text-green-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

export function BillingBanner({ variant, message }: BillingBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={`mt-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${variantStyles[variant]}`}
    >
      <span>{message}</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-4 shrink-0 rounded p-0.5 hover:opacity-70"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
