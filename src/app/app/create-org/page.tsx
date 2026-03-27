"use client";

import { useActionState, useCallback, useState } from "react";
import {
  createOrganization,
  type OrgActionState,
} from "@/server/actions/organization";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateOrganizationPage() {
  const [state, formAction, isPending] = useActionState<
    OrgActionState,
    FormData
  >(createOrganization, null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const generateSlug = useCallback((value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (!slugTouched) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            CK
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create your organization
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set up your organization to start your compliance journey.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="pt-2">
            <form action={formAction} className="space-y-5">
              {state?.error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {state.error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Organization name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Acme Corp"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="acme-corp"
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and hyphens only.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating..." : "Create organization"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
