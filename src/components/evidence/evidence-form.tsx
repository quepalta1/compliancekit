"use client";

import { useActionState, useState } from "react";
import {
  createEvidenceItem,
  updateEvidenceItem,
} from "@/server/actions/evidence";
import type { EvidenceActionState } from "@/server/actions/evidence";
import { Save, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface Control {
  id: string;
  control_code: string;
  title: string;
}

interface Props {
  controls: Control[];
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    expires_at: string | null;
    control_ids: string[];
  };
}

export function EvidenceForm({ controls, mode, initialData }: Props) {
  const action = mode === "create" ? createEvidenceItem : updateEvidenceItem;
  const [state, formAction, isPending] = useActionState<
    EvidenceActionState,
    FormData
  >(action, null);

  const [selectedControls, setSelectedControls] = useState<Set<string>>(
    new Set(initialData?.control_ids ?? []),
  );
  const [controlsExpanded, setControlsExpanded] = useState(false);

  function toggleControl(controlId: string) {
    setSelectedControls((prev) => {
      const next = new Set(prev);
      if (next.has(controlId)) {
        next.delete(controlId);
      } else {
        next.add(controlId);
      }
      return next;
    });
  }

  return (
    <form action={formAction}>
      {mode === "edit" && initialData && (
        <input type="hidden" name="evidence_id" value={initialData.id} />
      )}
      <input
        type="hidden"
        name="control_ids"
        value={Array.from(selectedControls).join(",")}
      />

      {state?.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={initialData?.title ?? ""}
            placeholder="e.g., Annual penetration test report"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialData?.description ?? ""}
            placeholder="Describe what this evidence demonstrates..."
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Expires at */}
        <div>
          <label
            htmlFor="expires_at"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Expiration Date
          </label>
          <input
            id="expires_at"
            name="expires_at"
            type="date"
            defaultValue={
              initialData?.expires_at
                ? initialData.expires_at.split("T")[0]
                : ""
            }
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave blank if this evidence does not expire.
          </p>
        </div>

        {/* Control selection */}
        <div>
          <button
            type="button"
            onClick={() => setControlsExpanded(!controlsExpanded)}
            className="flex w-full items-center justify-between text-sm font-medium text-gray-700"
          >
            <span>
              Linked Controls{" "}
              {selectedControls.size > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {selectedControls.size}
                </span>
              )}
            </span>
            {controlsExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {controlsExpanded && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              {controls.map((control) => (
                <label
                  key={control.id}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedControls.has(control.id)}
                    onChange={() => toggleControl(control.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono font-medium text-gray-600">
                    {control.control_code}
                  </span>
                  <span className="text-gray-700">{control.title}</span>
                </label>
              ))}
              {controls.length === 0 && (
                <p className="px-3 py-4 text-sm text-gray-500 text-center">
                  No controls available.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <Link
          href="/app/evidence"
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Evidence"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
