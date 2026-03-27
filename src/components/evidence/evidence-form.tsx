"use client";

import { useActionState, useState } from "react";
import {
  createEvidenceItem,
  updateEvidenceItem,
} from "@/server/actions/evidence";
import type { EvidenceActionState } from "@/server/actions/evidence";
import { Save, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Card>
        <CardContent className="space-y-5 pt-2">
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
              defaultValue={initialData?.title ?? ""}
              placeholder="e.g., Annual penetration test report"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={initialData?.description ?? ""}
              placeholder="Describe what this evidence demonstrates..."
            />
          </div>

          {/* Expires at */}
          <div className="space-y-2">
            <Label htmlFor="expires_at">Expiration Date</Label>
            <Input
              id="expires_at"
              name="expires_at"
              type="date"
              defaultValue={
                initialData?.expires_at
                  ? initialData.expires_at.split("T")[0]
                  : ""
              }
            />
            <p className="text-xs text-muted-foreground">
              Leave blank if this evidence does not expire.
            </p>
          </div>

          {/* Control selection */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setControlsExpanded(!controlsExpanded)}
              className="flex w-full items-center justify-between"
            >
              <Label className="cursor-pointer">
                Linked Controls{" "}
                {selectedControls.size > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedControls.size}
                  </Badge>
                )}
              </Label>
              {controlsExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {controlsExpanded && (
              <div className="max-h-60 overflow-y-auto rounded-lg border divide-y">
                {controls.map((control) => (
                  <label
                    key={control.id}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedControls.has(control.id)}
                      onChange={() => toggleControl(control.id)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                    <Badge variant="secondary" className="font-mono text-xs">
                      {control.control_code}
                    </Badge>
                    <span>{control.title}</span>
                  </label>
                ))}
                {controls.length === 0 && (
                  <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                    No controls available.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <Link href="/app/evidence" className={buttonVariants({ variant: "ghost" })}>Cancel</Link>
        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Evidence"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
