"use client";

import { useActionState } from "react";
import { createBuyerRequirement, type NetworkActionState } from "@/server/actions/network";
import { REQUIREMENT_CATEGORIES, REQUIREMENT_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  security: "Security",
  animal_welfare: "Animal Welfare",
  sustainability: "Sustainability",
  labor: "Labor & Human Rights",
  privacy: "Privacy & Data Protection",
  operations: "Operations",
  other: "Other",
};

const SELECT_CLASS =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

export function RequirementForm() {
  const [state, formAction, isPending] = useActionState<NetworkActionState, FormData>(
    createBuyerRequirement,
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Plus className="h-4 w-4" />
          Add Requirement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form key={JSON.stringify(state)} action={formAction} className="space-y-4">
          {state && "error" in state && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {state && "success" in state && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {state.success}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Information Security Management"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={3}
              placeholder="Describe what suppliers must demonstrate to meet this requirement..."
            />
          </div>

          {/* Category and Requirement Type row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" className={SELECT_CLASS}>
                {REQUIREMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] ?? cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirementType">Requirement Type</Label>
              <select id="requirementType" name="requirementType" className={SELECT_CLASS}>
                {REQUIREMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === "framework" ? "Framework Requirement" : "Buyer Policy"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Framework Reference */}
          <div className="space-y-2">
            <Label htmlFor="frameworkRef">Framework Reference (optional)</Label>
            <Input
              id="frameworkRef"
              name="frameworkRef"
              type="text"
              placeholder="e.g. ISO 27001 A.5.19"
            />
          </div>

          {/* Evidence Hint */}
          <div className="space-y-2">
            <Label htmlFor="evidenceHint">Evidence Hint (optional)</Label>
            <Input
              id="evidenceHint"
              name="evidenceHint"
              type="text"
              placeholder="e.g. Provide certification or audit report"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={isPending}>
              <Plus className="h-4 w-4" />
              {isPending ? "Adding..." : "Add Requirement"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
