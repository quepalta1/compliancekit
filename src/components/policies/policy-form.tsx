"use client";

import { useActionState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { generatePolicy, type PolicyActionState } from "@/server/actions/policy";

interface Template {
  id: string;
  code: string;
  name: string;
  description: string;
}

interface Props {
  templates: Template[];
  defaultTemplateId?: string;
}

export function PolicyForm({ templates, defaultTemplateId }: Props) {
  const [state, formAction, isPending] = useActionState<PolicyActionState, FormData>(
    generatePolicy,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Template selection */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-900 mb-3">
          Select a policy template
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {templates.map((template) => (
            <label
              key={template.id}
              className="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:ring-1 has-[:checked]:ring-blue-500"
            >
              <input
                type="radio"
                name="templateId"
                value={template.id}
                defaultChecked={template.id === defaultTemplateId}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <FileText className="h-4 w-4 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {template.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {template.description}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Context textarea */}
      <div>
        <label
          htmlFor="context"
          className="block text-sm font-medium text-gray-900 mb-1.5"
        >
          Company context / notes
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Provide any specific context about your organization that should be
          reflected in the policy (e.g., industry, team size, specific
          requirements).
        </p>
        <textarea
          id="context"
          name="context"
          rows={5}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., We are a 50-person fintech company processing payment data across the EU..."
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <a
          href="/app/policies"
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Submitting..." : "Generate Policy"}
        </button>
      </div>
    </form>
  );
}
