"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword, type AuthActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    resetPassword,
    null,
  );

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {state && "error" in state && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state && "success" in state && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Check your email for a password reset link.
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-[#0369A1] text-white hover:bg-[#0369A1]/90"
        >
          {pending ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          <Link
            href="/login"
            className="font-medium text-[#0369A1] hover:text-[#0369A1]/80"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </>
  );
}
