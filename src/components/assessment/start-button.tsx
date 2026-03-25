"use client";

import { Plus } from "lucide-react";
import { startAssessment } from "@/server/actions/assessment";
import { useTransition } from "react";

export function StartAssessmentButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await startAssessment();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
    >
      <Plus className="h-4 w-4" />
      {isPending ? "Starting..." : "New Assessment"}
    </button>
  );
}
