"use client";

import { useActionState } from "react";
import { submitSupplierRequirementResponse, type NetworkActionState } from "@/server/actions/network";
import { SUPPLIER_COMPLIANCE_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface SupplierResponseFormProps {
  relationshipId: string;
  requirementId: string;
  existingResponse?: {
    compliance_status: string;
    response_text: string;
    evidence_summary: string | null;
  } | null;
}

const STATUS_LABELS: Record<(typeof SUPPLIER_COMPLIANCE_STATUSES)[number], string> = {
  compliant: "Compliant",
  partial: "Partially Compliant",
  not_compliant: "Not Compliant",
  not_applicable: "Not Applicable",
};

export function SupplierResponseForm({
  relationshipId,
  requirementId,
  existingResponse,
}: SupplierResponseFormProps) {
  const [state, formAction, isPending] = useActionState<NetworkActionState, FormData>(
    submitSupplierRequirementResponse,
    null,
  );

  return (
    <form key={JSON.stringify(state)} action={formAction} className="space-y-3">
      <input type="hidden" name="relationshipId" value={relationshipId} />
      <input type="hidden" name="requirementId" value={requirementId} />

      {state && "error" in state && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </div>
      )}
      {state && "success" in state && (
        <div className="rounded-md border border-[#16a34a]/30 bg-[#16a34a]/10 px-3 py-2 text-xs text-[#16a34a]">
          {state.success}
        </div>
      )}

      {/* Compliance Status */}
      <div className="space-y-1.5">
        <Label htmlFor={`complianceStatus-${requirementId}`} className="text-xs">
          Status <span className="text-destructive">*</span>
        </Label>
        <select
          id={`complianceStatus-${requirementId}`}
          name="complianceStatus"
          required
          defaultValue={existingResponse?.compliance_status ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
        >
          <option value="" disabled>
            Select a status...
          </option>
          {SUPPLIER_COMPLIANCE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {/* Response Text */}
      <div className="space-y-1.5">
        <Label htmlFor={`responseText-${requirementId}`} className="text-xs">
          Response <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id={`responseText-${requirementId}`}
          name="responseText"
          required
          rows={3}
          defaultValue={existingResponse?.response_text ?? ""}
          placeholder="Describe your compliance status and any relevant details..."
          className="text-sm"
        />
      </div>

      {/* Evidence Summary */}
      <div className="space-y-1.5">
        <Label htmlFor={`evidenceSummary-${requirementId}`} className="text-xs">
          Evidence Summary{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id={`evidenceSummary-${requirementId}`}
          name="evidenceSummary"
          type="text"
          defaultValue={existingResponse?.evidence_summary ?? ""}
          placeholder="e.g. Certified under ISO 14001, audit report available"
          className="text-sm"
        />
      </div>

      <div className="flex justify-end pt-0.5">
        <Button type="submit" size="sm" disabled={isPending}>
          <Send className="h-3.5 w-3.5" />
          {isPending
            ? existingResponse
              ? "Updating..."
              : "Submitting..."
            : existingResponse
              ? "Update Response"
              : "Submit Response"}
        </Button>
      </div>
    </form>
  );
}
