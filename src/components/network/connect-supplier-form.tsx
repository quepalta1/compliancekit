"use client";

import { useActionState } from "react";
import { connectSupplier, type NetworkActionState } from "@/server/actions/network";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2 } from "lucide-react";

export function ConnectSupplierForm() {
  const [state, formAction, isPending] = useActionState<NetworkActionState, FormData>(
    connectSupplier,
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Connect Supplier
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
            <div className="rounded-lg border border-[#16a34a]/30 bg-[#16a34a]/10 px-4 py-3 text-sm text-[#16a34a]">
              {state.success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="supplierSlug">Supplier Workspace Slug</Label>
            <Input
              id="supplierSlug"
              name="supplierSlug"
              type="text"
              placeholder="e.g. acme-corp"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the workspace slug of the supplier organization.
            </p>
          </div>

          <Button type="submit" disabled={isPending}>
            <Link2 className="h-4 w-4" />
            {isPending ? "Connecting..." : "Connect Supplier"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
